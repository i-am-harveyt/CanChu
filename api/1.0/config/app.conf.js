// Setup express
import express, { json } from "express";
import cors from "cors";
const app = express();

app.use(json());
app.use("/static", express.static("static"));
app.use(cors());


export default app;
