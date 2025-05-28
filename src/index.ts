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

    let buffer = '';

    client.on('data', (data) => {
        buffer += data.toString();
    
        // Split by double newline (message delimiter)
        const parts = buffer.split('\n\n');
    
        // Keep the last partial chunk in the buffer
        buffer = parts.pop() ?? '';
    
        const objs: any[] = [];
    
        for (let part of parts) {
            if (!part.trim()) continue;
    
            try {
                const obj = converter.convertToObject(part);
    
                switch (obj.command) {
                    case "information":
                        delete obj.command;
                        StateStorage.deviceInfo = obj;
                        objs.push(StateStorage.deviceInfo);
                        break;
    
                    case Command.INPUT_LABELS:
                        const inputLabels = converter.convertObjectToLabels(obj, "input_label");
                        if (!StateStorage.inputLabelsStates) {
                            StateStorage.inputLabelsStates = inputLabels;
                            objs.push(inputLabels);
                        } else {
                            for (const label of inputLabels) {
                                const found = StateStorage.inputLabelsStates.find(x => x.index === label.index);
                                if (found) found.text = label.text;
                            }
                            objs.push(inputLabels);
                        }
                        break;
    
                    case Command.OUTPUT_LABELS:
                        const outputLabels = converter.convertObjectToLabels(obj, "output_label");
                        if (!StateStorage.outputLabelStates) {
                            StateStorage.outputLabelStates = outputLabels;
                            objs.push(outputLabels);
                        } else {
                            for (const label of outputLabels) {
                                const found = StateStorage.outputLabelStates.find(x => x.index === label.index);
                                if (found) found.text = label.text;
                            }
                            objs.push(outputLabels);
                        }
                        break;
    
                    case Command.VIDEO_OUTPUT_ROUTING:
                        const routes = converter.convertObjectToRoutes(obj);
                        if (!StateStorage.outputRouting) {
                            StateStorage.outputRouting = routes;
                            objs.push(routes);
                        } else {
                            for (const route of routes) {
                                const found = StateStorage.outputRouting.find(x => x.output === route.output);
                                if (found) found.input = route.input;
                            }
                            objs.push(routes);
                        }
                        break;
    
                    case Command.VIDEO_OUTPUT_LOCKS:
                        const lockStates = converter.convertObjectToLockStates(obj);
                        for (const lock of lockStates) {
                            const found = StateStorage.outputRouting?.find(x => x.output === lock.output);
                            if (found) found.locked = lock.state as LockState;
                        }
                        objs.push(lockStates);
                        break;
                }
            } catch (err) {
                console.warn('Failed to parse part:', part);
                console.error(err);
            }
        }
    
        if (objs.length > 0) {
            dataSubject.next(objs);
        }
    });
    

    export function connect(ip: string, port: number): Promise<string> {
        return new Promise((resolve, reject) => {
            try {
                client.connect(port, ip, () => {
                    setTimeout(() => {
                        resolve("connected");
                    }, 10);
                });
                client.on("error", (err) => {
                    reject(err);
                });
            } catch (err) {
                reject(err);
            }
        });
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
        command += `${output} ${LockState.LOCKED_FROM_OTHER_DEVICE}`;
        sendDataCommand(command);
    }

    export function unlockOutput(output: number) {
        var command = Command.VIDEO_OUTPUT_LOCKS + "\n";
        command += `${output} ${LockState.UNLOCKED}`;
        sendDataCommand(command);
    }
}