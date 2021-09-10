import { Label } from "./label";
import { Route } from "./route";

export module StateStorage {
    export var inputLabelsStates: Label[];
    export var outputLabelStates: Label[];
    export var outputRouting: Route[];
    export var deviceInfo: any;
}