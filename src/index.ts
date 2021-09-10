import * as net from "net";
import * as converter from "./lib/jsonConverter";
import { Subject, Observable, Subscription } from "rxjs";
var client = new net.Socket();

export var dataSubject = new Subject();

client.on('data', (data) => {
    dataSubject.next(converter.getJSON(data.toString().split('\n\n')[1]));
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

export function getOutputRouting() {
    sendCommand("VIDEO OUTPUT ROUTING:");
}


function sendCommand(command: string) {
    client.write(command + "\n\n");
}