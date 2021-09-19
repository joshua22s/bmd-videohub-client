export class Label {
    type: string;
    index: number;
    text: string;

    constructor(index: number, text: string, type: string) {
        this.index = index;
        this.text = text;
        this.type = type;
    }
}