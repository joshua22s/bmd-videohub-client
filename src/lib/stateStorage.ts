import { Label } from "./models/label";
import { Route } from "./models/route";

export module StateStorage {
    export var inputLabelsStates: Label[];
    export var outputLabelStates: Label[];
    export var outputRouting: Route[];
    export var deviceInfo: any;
}