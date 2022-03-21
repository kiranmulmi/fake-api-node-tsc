import fs from "fs";
import express, {Request,Response } from 'express';
import {entityInit, isJsonParsable} from "../../../helper/commonHelper";
const routes = express.Router();
import {adminAuthMiddleware} from "../../../middleware/auth.middleware";

routes.patch('/:module/:id', adminAuthMiddleware, async ( req: Request, res: Response) => {
    const entity = req.params.module;
    entityInit(entity).then(() => {
        let input = req.body;
        fs.readFile(`./data/${entity}.json`, (err, rawData) => {
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

                const filteredData = jsonData.filter( (a: any) => a.id !== req.params.id);

                for (const [key, value] of Object.entries(input)) {
                    jsonObject[key] = value;
                }
                jsonObject = {...jsonObject, id: req.params.id};

                filteredData.push(jsonObject);
                const newData = JSON.stringify(filteredData);
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

export default routes;