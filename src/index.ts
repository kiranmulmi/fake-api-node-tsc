import express, {Application} from 'express';
import bodyParser from "body-parser";
require("dotenv").config();
import cors from "cors";
import routes from "./routes";

const app:Application = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

for( const route of routes) {
    app.use(route.url, route.module)
}

const PORT = process.env.PORT || 3500;
app.listen(PORT, ():void => {
    console.log(`Server Running here 👉 https://localhost:${PORT}`);
});