import fs from "fs";

export const entityInit = (entity: string) : Promise<string> => {
    return new Promise((resolve, reject) => {
        const path = `./data/${entity}.json`;
        if (!fs.existsSync(path)) {
            fs.writeFileSync(path, JSON.stringify([]));
        }
        resolve("success");
    });
}

export const isJsonParsable = (buff: Buffer) : boolean => {
    try {
        JSON.parse(buff.toString());
    } catch (e) {
        return false;
    }
    return true;
}