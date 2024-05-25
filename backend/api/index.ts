import express, { Router } from "express";
import serverless from "serverless-http";

const api = express();

const router = Router();
router.get("/hello", (_req, res) => res.send("Hello World!"));

api.use("/", router);

export const handler = serverless(api);
