import express, {Request,Response } from 'express';
const routes = express.Router();
import fs from "fs";
import {entityInit, isJsonParsable} from "../../helper/commonHelper";
// @ts-ignore
import bcrypt from "bcrypt";
// @ts-ignore
import jwt from "jsonwebtoken";

import { userRoles } from "../../constants/userConstant";
import {userAuthMiddleware} from "../../middleware/auth.middleware";

routes.post('/login', async ( req: Request, res: Response) => {
    const item = "user";
    entityInit(item).then(() => {

        fs.readFile(`./data/${item}.json`, async (err, rawData) => {
            if (err) console.log(err);
            let jsonData = [];
            if(isJsonParsable(rawData)) {
                jsonData = JSON.parse(rawData.toString());
            }
            try {

                const { email, password } = req.body;
                if (!(email && password)) {
                    throw new Error("Incorrect username or password");
                }

                const user = jsonData.find( (a: any) => a.email === email);
                if(!user) {
                    throw new Error("User not found");
                }
                if(!user.metafields) {
                    throw new Error("User do not have user/admin role in metafields");
                }

                const role = user.metafields.find((a: any) => a.key === 'role');
                if(!role) {
                    throw new Error("User do not have admin/admin role in user metafields");
                }
                if(!(role.value === userRoles.ADMIN || role.value === userRoles.USER)) {
                    throw new Error("This user can not access user login");
                }
                if(!(await bcrypt.compare(password, user.password))) {
                    throw new Error("Incorrect username or password!");
                }
                const signingObject = user;
                delete signingObject.password;

                signingObject.token = jwt.sign(signingObject, process.env.TOKEN_KEY, { expiresIn: process.env.TOKEN_EXPIRY + "h"});
                res.status(200).send({
                    success: true,
                    message: `user auth`,
                    data: signingObject
                });
            } catch(e: any) {
                res.status(401).send({
                    success: false,
                    message: e.message
                });
            }
        })
    });
});
routes.get('/validate/token/', userAuthMiddleware, async ( req: any, res: Response) => {
    res.status(200).send({
        success: true,
        message: `user token validate`,
        data: req.user
    });
});
routes.post('/hash/password/', async ( req: Request, res: Response) => {
    res.status(200).send({
        success: true,
        message: `user bcrypt password`,
        data: {
            password: await bcrypt.hash(req.body.password, 10)
        }
    });
});

export default routes;