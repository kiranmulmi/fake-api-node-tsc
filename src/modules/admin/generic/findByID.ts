import fs from "fs";
import express, {Request,Response } from 'express';
import {entityInit, isJsonParsable} from "../../../helper/commonHelper";
const routes = express.Router();
import {adminAuthMiddleware} from "../../../middleware/auth.middleware";

routes.get('/:module/:id', adminAuthMiddleware, async ( req: Request, res: Response) => {
    const entity = req.params.module;
    entityInit(entity).then(() => {
        fs.readFile(`./data/${entity}.json`, (err, rawData) => {
            if (err) console.log(err);
            let jsonData = [];
            if(isJsonParsable(rawData)) {
                jsonData = JSON.parse(rawData.toString());
            }
            let jsonObject = jsonData.find( (a: any) => a.id === req.params.id);
            res.status(200).send({
                success: true,
                message: `${entity} get by id`,
                data: jsonObject || {}
            });
        })
    });
});

export default routes;