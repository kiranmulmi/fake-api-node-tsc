import fs from "fs";
import express, {Request,Response } from 'express';
import {entityInit, isJsonParsable} from "../../../helper/commonHelper";
const routes = express.Router();
import { v4 as uuidv4 } from 'uuid';
import {adminAuthMiddleware} from "../../../middleware/auth.middleware";

routes.post('/:module', adminAuthMiddleware, async ( req: Request, res: Response) => {
    const item = req.params.module;
    entityInit(item).then(() => {
        let input = req.body;
        input = {...input, id: uuidv4()}
        fs.readFile(`./data/${item}.json`, (err, rawData) => {
            if (err) console.log(err);
            let jsonData = [];
            if(isJsonParsable(rawData)) {
                jsonData = JSON.parse(rawData.toString());
            }
            jsonData.push(input);
            const newData = JSON.stringify(jsonData);
            fs.writeFile(`./data/${item}.json`, newData, (err) => {
                if (err) console.log(err);
                res.status(200).send({
                    success: true,
                    message: `${item} insert`,
                    data: input
                });
            });
        })
    });
});

export default routes;