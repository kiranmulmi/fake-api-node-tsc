import fs from "fs";
// @ts-ignore
import bcrypt from "bcrypt";
import {entityInit, isJsonParsable} from "./helper/commonHelper";
import { v4 as uuidv4 } from 'uuid';

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
})

console.log("Register your user");
readline.question(`Full Name: `, (name: string) => {
    readline.question(`Email: `, (email: string) => {
        readline.question(`Password: `, (password: string) => {
            const path = `./data/user.json`;
            if (!fs.existsSync(path)) {
                fs.writeFileSync(path, JSON.stringify([]));
            }
            entityInit('user').then(() => {
                fs.readFile(`./data/user.json`, async (err, rawData) => {
                    if (err) console.log(err);
                    let jsonData = [];
                    if(isJsonParsable(rawData)) {
                        jsonData = JSON.parse(rawData.toString());
                    }
                    try {
                        const user = jsonData.find( (a: any) => a.email === email);
                        if(user) {
                            throw new Error("user already exists!")
                        }

                        const newData = {
                            id: uuidv4(),
                            name: name,
                            email: email,
                            password: await bcrypt.hash(password, 10),
                            metafields: [
                                {
                                    key: "role",
                                    value: "ADMIN"
                                }
                            ]
                        };
                        jsonData.push(newData);
                        fs.writeFile(`./data/user.json`, JSON.stringify(jsonData), (err) => {
                            if (err) console.log(err);
                            console.log(`All Done!!`)
                            readline.close()
                        });
                    } catch (e: any) {
                        console.log(e.message);
                        readline.close()
                    }
                })
            });
        })
    })
})