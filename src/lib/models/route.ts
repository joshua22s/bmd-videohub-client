import { LockState } from "./lockState";

export class Route {
    output: number;
    input: number;
    locked: LockState;
    type: string;

    constructor(output: number, input: number, locked: LockState, type: string) {
        this.output = output;
        this.input = input;
        this.locked = locked;
        this.type = type;
    }
}