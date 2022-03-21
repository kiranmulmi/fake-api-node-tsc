import fs from "fs";
import express, {Request,Response } from 'express';
import {entityInit, isJsonParsable} from "../../helper/commonHelper";
const routes = express.Router();
import { v4 as uuidv4 } from 'uuid';
// @ts-ignore
import bcrypt from "bcrypt";
import {userAuthMiddleware} from "../../middleware/auth.middleware";
const entity = 'user';

routes.post('/register', async (req: Request, res: Response) => {
    entityInit(entity).then(() => {
        let input = req.body;
        input = {...input, id: uuidv4()}
        fs.readFile(`./data/${entity}.json`, async (err, rawData) => {
            if (err) console.log(err);
            let jsonData = [];
            if(isJsonParsable(rawData)) {
                jsonData = JSON.parse(rawData.toString());
            }
            input.password = await bcrypt.hash(input.password, 10);
            jsonData.push(input);
            const newData = JSON.stringify(jsonData);
            delete input.password;
            fs.writeFile(`./data/${entity}.json`, newData, (err) => {
                if (err) console.log(err);
                res.status(200).send({
                    success: true,
                    message: `${entity} insert`,
                    data: input
                });
            });
        })
    });
});

routes.patch('/edit/:id', userAuthMiddleware, async (req: any, res: Response) => {
    entityInit(entity).then( async () => {
        let input = req.body;
        fs.readFile(`./data/${entity}.json`, async (err, rawData) => {
            try {
                if (err) console.log(err);
                let jsonData = [];
                if(isJsonParsable(rawData)) {
                    jsonData = JSON.parse(rawData.toString());
                }

                let jsonObject = jsonData.find( (a: any) => a.id === req.params.id);
                if(!jsonObject) {
                    throw new Error(`Object id: ${req.params.id} not found `);
                }

                if(req.user.id !== jsonObject.id) {
                    throw new Error("No permission");
                }

                const filteredData = jsonData.filter( (a: any) => a.id !== req.params.id);

                for (const [key, value] of Object.entries(input)) {
                    jsonObject[key] = value;
                }
                jsonObject = {...jsonObject, id: req.params.id};
                if(jsonObject.password && jsonObject.password !== "") {
                    jsonObject.password = await bcrypt.hash(input.password, 10);
                }
                filteredData.push(jsonObject);
                const newData = JSON.stringify(filteredData);
                delete jsonObject.password;
                fs.writeFile(`./data/${entity}.json`, newData, (err) => {
                    if (err) console.log(err);
                    res.status(200).send({
                        success: true,
                        message: `${entity} patch`,
                        data: jsonObject
                    });
                });

            } catch(e: any) {
                res.status(200).send({
                    success: false,
                    message: e.message
                });
            }
        })
    });
});

routes.get('/findByID/:id', userAuthMiddleware, async (req: any, res: Response) => {
    entityInit(entity).then(() => {

            fs.readFile(`./data/${entity}.json`, (err, rawData) => {
                if (err) console.log(err);
                let jsonData = [];
                if(isJsonParsable(rawData)) {
                    jsonData = JSON.parse(rawData.toString());
                }
                let jsonObject = jsonData.find( (a: any) => a.id === req.params.id);

                try {
                    if(!jsonObject) {
                        throw new Error(`Object id: ${req.params.id} not found `);
                    }

                    if(req.user.id !== jsonObject.id) {
                        throw new Error("No permission");
                    }
                    res.status(200).send({
                        success: true,
                        message: `${entity} get by id`,
                        data: jsonObject || {}
                    });
                } catch (e: any) {
                    res.status(200).send({
                        success: false,
                        message: e.message
                    });
                }
            });
    });
});

export default routes;