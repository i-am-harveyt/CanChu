import { Router } from "express";
import { hasAuth } from "../middlewares/headerChecker.mid.js";
import asyncEnv from "../utils/asyncEnv.util.js";
import eventGet from "../controllers/events/get.controller.js";
import eventRead from "../controllers/events/read.controller.js";

const events = Router();

events.get("/", hasAuth, asyncEnv(eventGet));
events.post("/:event_id/read", hasAuth, asyncEnv(eventRead))

export default events;
