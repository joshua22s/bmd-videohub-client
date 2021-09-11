import { LockState } from "./lockState";

export class Route {
    output: number;
    input: number;
    locked: LockState;

    constructor(output: number, input: number, locked: LockState) {
        this.output = output;
        this.input = input;
        this.locked = locked;
    }
}