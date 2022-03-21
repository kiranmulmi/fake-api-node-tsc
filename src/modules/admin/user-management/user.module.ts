import fs from "fs";
import express, {Request,Response } from 'express';
import {entityInit, isJsonParsable} from "../../../helper/commonHelper";
const routes = express.Router();
import { v4 as uuidv4 } from 'uuid';
// @ts-ignore
import bcrypt from "bcrypt";
import {adminAuthMiddleware} from "../../../middleware/auth.middleware";
const entity = 'user';

routes.get('/', adminAuthMiddleware, async (req: Request, res: Response) => {
    entityInit(entity).then(() => {
        fs.readFile(`./data/${entity}.json`, (err, rawData: Buffer) => {
            if (err) console.log(err);
            let jsonData = [];
            if(isJsonParsable(rawData)) {
                jsonData = JSON.parse(rawData.toString());
            }
            res.status(200).send({
                success: true,
                message: `${entity} get all`,
                data: jsonData
            });
        })
    });
});

routes.post('/create', adminAuthMiddleware, async ( req: Request, res: Response) => {
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

routes.patch('/edit/:id', adminAuthMiddleware, async ( req: Request, res: Response) => {
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

routes.delete('/delete/:id', adminAuthMiddleware, async ( req: Request, res: Response) => {
    entityInit(entity).then(() => {
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
                const newData = JSON.stringify(filteredData);
                fs.writeFile(`./data/${entity}.json`, newData, (err) => {
                    if (err) console.log(err);
                    res.status(200).send({
                        success: true,
                        message: `${entity} delete`,
                        data: jsonObject
                    });
                });

            } catch(e: any) {
                res.status(500).send({
                    success: false,
                    message: e.message
                });
            }
        })
    });
});

routes.get('/findByID/:id', adminAuthMiddleware, async ( req: Request, res: Response) => {
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

routes.get('/findOne', adminAuthMiddleware, async ( req: Request, res: Response) => {
    const queryParams = req.query;
    entityInit(entity).then(() => {
        fs.readFile(`./data/${entity}.json`, (err, rawData) => {
            if (err) console.log(err);
            let jsonData = [];
            if(isJsonParsable(rawData)) {
                jsonData = JSON.parse(rawData.toString());
            }
            try {
                let responseObj: any = {};
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

routes.get('/findAll', adminAuthMiddleware, async ( req: Request, res: Response) => {
    const queryParams: any = req.query;
    //console.log(queryParams);
    entityInit(entity).then(() => {
        fs.readFile(`./data/${entity}.json`, (err, rawData) => {
            if (err) console.log(err);
            let jsonData = [];
            if(isJsonParsable(rawData)) {
                jsonData = JSON.parse(rawData.toString());
            }
            try {
                let responseArray = [];
                for (const obj of jsonData) {
                    let matchAll = true;
                    for (const [key, value] of Object.entries(queryParams)) {
                        if(key !== "metafields") {
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
                    }
                    
                    // Metafields Search
                    if(queryParams.metafields) {
                        if(queryParams.metafields.length > 0) {
                            for (const queryMetafield of queryParams.metafields) {
                                if(obj.metafields) {
                                    if(obj.metafields.length > 0) {
                                        const objMetafield = obj.metafields.find((a: any) => a.key === queryMetafield.key);
                                        if(!objMetafield) {
                                            matchAll = false;
                                            break;
                                        }

                                        if(typeof queryMetafield.value === 'object') {
                                            for (const [k, v] of Object.entries(queryMetafield.value)) {
                                                if(objMetafield.value[k] !== queryMetafield.value[k]) {
                                                    matchAll = false;
                                                    break;
                                                }
                                            }
                                        } else if(queryMetafield.value !== objMetafield.value) {
                                            matchAll = false;
                                            break;
                                        }
                                    }
                                } else {
                                    matchAll = false;
                                    break;
                                }
                            }
                        } else {
                            matchAll = false;
                            break;
                        }
                    }
                    if(matchAll) {
                        responseArray.push(obj);
                    }
                }
                res.status(200).send({
                    success: true,
                    message: `${entity} filter data`,
                    data: responseArray
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