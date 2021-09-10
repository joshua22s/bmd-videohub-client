import * as net from "net";
import * as converter from "./lib/objectConverter";
import { Subject, Observable, Subscription } from "rxjs";
import { Command } from "./lib/command";
import { StateStorage } from "./lib/stateStorage";
import { Label } from "./lib/label";
import { Route } from "./lib/route";
var client = new net.Socket();

var deviceInfo = {};

export * from './lib/command';

export module Videohub {

    export var dataSubject = new Subject();

    client.on('data', (data) => {
        var objs: string[] = [];
        for (let dataObj of data.toString().split('\n\n')) {
            if (dataObj) {
                var obj = converter.convertToObject(dataObj);
                switch (obj.command) {
                    case "information":
                        StateStorage.deviceInfo = obj;
                        break;
                    case Command.INPUT_LABELS:
                        if (!StateStorage.inputLabelsStates) {
                            StateStorage.inputLabelsStates = converter.convertObjectToLabels(obj);
                        } else {
                            var labels = converter.convertObjectToLabels(obj);
                            for (let label of labels) {
                                var labelFound = StateStorage.inputLabelsStates.find(x => x.index == label.index);
                                if (labelFound) {
                                    labelFound.text = label.text;
                                }
                            }
                        }
                        break;
                    case Command.OUTPUT_LABELS:
                        if (!StateStorage.outputLabelStates) {
                            StateStorage.outputLabelStates = converter.convertObjectToLabels(obj);;
                        }
                        break;
                    case Command.VIDEO_OUTPUT_ROUTING:
                        if (!StateStorage.outputRouting) {
                            StateStorage.outputRouting = converter.convertObjectToRoutes(obj);
                        } else {
                            var routes = converter.convertObjectToRoutes(obj);
                            for (let route of routes) {
                                var routeFound = StateStorage.outputRouting.find(x => x.output == route.output);
                                if (routeFound) {
                                    routeFound.input = route.input;
                                }
                            }
                        }
                        break;
                }
                if (obj.type == "information") {
                    deviceInfo = obj;
                }
                objs.push(obj);
            }
        }
        dataSubject.next(objs);
    });

    export function connect(ip: string, port: number): Promise<string> {
        return new Promise((resolve, reject) => {
            client.connect(port, ip, () => {
                resolve("connected");
            });
        })
    }

    export function disconnect() {
        client.destroy();
    }

    export function getDeviceInfo() {
        return deviceInfo;
    }

    export function sendDataCommand(command: Command) {
        client.write(command + "\n\n");
    }

    export function getInputLabels(): Label[] {
        return StateStorage.inputLabelsStates;
    }

    export function getOutputLabels(): Label[] {
        return StateStorage.outputLabelStates;
    }

    export function getOutputRouting(): Route[] {
        return StateStorage.outputRouting;
    }
}