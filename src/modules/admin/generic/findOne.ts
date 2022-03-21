import fs from "fs";
import express, {Request,Response } from 'express';
import {entityInit, isJsonParsable} from "../../../helper/commonHelper";
const routes = express.Router();
import {adminAuthMiddleware} from "../../../middleware/auth.middleware";

routes.get('/:module', adminAuthMiddleware, async ( req: Request, res: Response) => {
    const entity = req.params.module;
    const queryParams = req.query;
    entityInit(entity).then(() => {
        fs.readFile(`./data/${entity}.json`, (err, rawData) => {
            if (err) console.log(err);
            let jsonData = [];
            if(isJsonParsable(rawData)) {
                jsonData = JSON.parse(rawData.toString());
            }
            try {
                let responseObj = {};
                for (const obj of jsonData) {
                    let matchAll = true;
                    for (const [key, value] of Object.entries(queryParams)) {
                        if(typeof obj[key] === 'object') {
                            // @ts-ignore
                            for (const [k, v] of Object.entries(value)) {
                                if(obj[key][k] !== v) {
                                    matchAll = false;
                                    break;
                                }
                            }

                        } else if(obj[key] !== value) {
                            matchAll = false;
                            break;
                        }
                    }
                    if(matchAll) {
                        responseObj = obj;
                        break;
                    }
                }

                res.status(200).send({
                    success: true,
                    message: `${entity} find data`,
                    data: responseObj
                });

            } catch (e: any) {
                res.status(500).send({
                    success: false,
                    message: e.message
                });
            }
        })
    });
});

export default routes;