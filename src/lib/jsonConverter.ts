export function getJSON(data: string): string {
    switch (data.split("\n", 1)[0]) {
        case "VIDEOHUB DEVICE:":
            var obj: any = {};
            obj.type = "information";
            var dataList = data.split("\n");
            for (var i = 1; i < dataList.length; i++) {
                var rowPropertyValue = dataList[i].split(":");
                obj[rowPropertyValue[0]] = convertStringToObject(rowPropertyValue[1].trim());
            }
            return JSON.stringify(obj);
        default:
            var obj: any = {};
            return JSON.stringify(obj);
    }
}

function convertStringToObject(toConvert: string): any {
    var num = +toConvert;
    if (!isNaN(num)) {
        return num;
    }
    switch (toConvert) {
        case "true":
            return true;
        case "false":
            return false;
    }
    return toConvert;
}