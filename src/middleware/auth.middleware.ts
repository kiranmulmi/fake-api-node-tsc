// @ts-ignore
import jwt from "jsonwebtoken";
import {userRoles} from "../constants/userConstant";

export const adminAuthMiddleware = (req: any, res: any, next: any) => {
    const token =
        req.body.token || req.query.token || req.headers["x-access-token"];

    if (!token) {
        return res.status(403).send({
            success: false,
            message: `A token is required for authentication`,
        });
    }
    try {
        const decodedUser = jwt.verify(token, process.env.TOKEN_KEY);
        if(!decodedUser.metafields) {
            throw new Error("User do not have admin role in metafields");
        }
        const role = decodedUser.metafields.find((a: any) => a.key === 'role');
        if(!role) {
            throw new Error("User do not have admin role in user metafields");
        }
        if(role.value !== userRoles.ADMIN) {
            throw new Error("This user can not access admin login");
        }
        req.user = decodedUser;
    } catch (err: any) {
        return res.status(401).send({
            success: false,
            message: err.message,
        });
    }
    return next();
};

export const userAuthMiddleware = (req: any, res: any, next: any) => {
    const token =
        req.body.token || req.query.token || req.headers["x-access-token"];

    if (!token) {
        return res.status(403).send({
            success: false,
            message: `A token is required for authentication`,
        });
    }
    try {
        const decodedUser = jwt.verify(token, process.env.TOKEN_KEY);
        if(!decodedUser.metafields) {
            throw new Error("User do not have admin role in metafields");
        }
        const role = decodedUser.metafields.find((a: any) => a.key === 'role');
        if(!role) {
            throw new Error("User do not have user/admin role in user metafields");
        }
        if(!(role.value === userRoles.ADMIN || role.value === userRoles.USER)) {
            throw new Error("This user can not access this login api");
        }
        req.user = decodedUser;
    } catch (err: any) {
        return res.status(401).send({
            success: false,
            message: err.message,
        });
    }
    return next();
};