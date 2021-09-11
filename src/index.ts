import * as net from "net";
import * as converter from "./lib/objectConverter";
import { Subject } from "rxjs";
import { Command } from "./lib/models/command";
import { StateStorage } from "./lib/stateStorage";
import { Label } from "./lib/models/label";
import { Route } from "./lib/models/route";
import { LockState } from "./lib/models/lockState";
var client = new net.Socket();


export * from './lib/models/command';

export module Videohub {

    export var dataSubject = new Subject();

    client.on('data', (data) => {
        var objs: string[] = [];
        for (let dataObj of data.toString().split('\n\n')) {
            if (dataObj) {
                var obj = converter.convertToObject(dataObj);
                switch (obj.command) {
                    case "information":
                        delete obj.command;
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
                    case Command.VIDEO_OUTPUT_LOCKS:
                        if (StateStorage.outputRouting) {
                            var lockStates = converter.convertObjectToLockStates(obj);
                            for (let state of lockStates) {
                                var routeFound = StateStorage.outputRouting.find(x => x.output == state.output);
                                if (routeFound) {
                                    routeFound.locked = state.state as LockState;
                                }
                            }
                        }
                }
                objs.push(obj);
            }
        }
        dataSubject.next(objs);
    });

    export function connect(ip: string, port: number): Promise<string> {
        return new Promise((resolve, reject) => {
            client.connect(port, ip, () => {
                setTimeout(() => {
                    resolve("connected");
                }, 10);
            });
        })
    }

    export function disconnect() {
        client.destroy();
    }

    export function getDeviceInfo() {
        return StateStorage.deviceInfo;
    }

    export function sendDataCommand(command: Command | string) {
        client.write(command + "\n\n");
    }

    export function getInputLabels(): Label[] {
        return StateStorage.inputLabelsStates;
    }

    export function changeInputLabel(index: number, text: string) {
        var command = Command.INPUT_LABELS + "\n";
        command += `${index} ${text}`;
        sendDataCommand(command);
    }

    export function getOutputLabels(): Label[] {
        return StateStorage.outputLabelStates;
    }

    export function changeOutputLabel(index: number, text: string) {
        var command = Command.OUTPUT_LABELS + "\n";
        command += `${index} ${text}`;
        sendDataCommand(command);
    }

    export function getOutputRouting(): Route[] {
        return StateStorage.outputRouting;
    }

    export function changeOutputRoute(output: number, input: number) {
        var command = Command.VIDEO_OUTPUT_ROUTING + "\n";
        command += `${output} ${input}`;
        sendDataCommand(command);
    }

    export function lockOutput(output: number) {
        var command = Command.VIDEO_OUTPUT_LOCKS + "\n";
        command += `${output} ${LockState.LOCKED_FROM_THIS_DEVICE}`;
        sendDataCommand(command);
    }

    export function unlockOutput(output: number) {
        var command = Command.VIDEO_OUTPUT_LOCKS + "\n";
        command += `${output} ${LockState.UNLOCKED}`;
        sendDataCommand(command);
    }
}