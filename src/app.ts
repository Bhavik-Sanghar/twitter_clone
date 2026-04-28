import express  , { type Request , type Response}from "express";
import authRoutes from "./routers/auth.router"
import userRoutes from "./routers/user.router"
import cookieParser from "cookie-parser"

import path from "path";

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use('/media', express.static(path.join(__dirname, '../media')));
app.use(express.static(path.join(__dirname, "public")));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/",authRoutes)
app.use("/user",userRoutes)


export default app;
