import { Router } from "express";
import asyncEnv from "../utils/asyncEnv.util.js";
import { hasAuth, isJSON } from "../middlewares/headerChecker.mid.js";
import chatSend from "../controllers/chat/send.controller.js";
import chatGet from "../controllers/chat/get.controller.js";

const chat = Router();

chat.post("/:user_id", hasAuth, isJSON, asyncEnv(chatSend));
chat.get("/:user_id/messages", hasAuth, asyncEnv(chatGet));

export default chat;
