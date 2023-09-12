import { Router } from "express";
import asyncEnv from "../utils/asyncEnv.util.js";
import { friendRequest } from "../controllers/friends/request.controller.js";
import { friendPend } from "../controllers/friends/pending.controller.js";
import { friendAgree } from "../controllers/friends/agree.controller.js";
import { friendDelete } from "../controllers/friends/delete.controller.js";
import { hasAuth } from "../middlewares/headerChecker.mid.js";
import friendsList from "../controllers/friends/list.controller.js";

const friends = Router();

friends.get("/", hasAuth, asyncEnv(friendsList));
friends.post("/:user_id/request", hasAuth, asyncEnv(friendRequest));
friends.get("/pending", hasAuth, asyncEnv(friendPend));
friends.post("/:friendship_id/agree", hasAuth, asyncEnv(friendAgree));
friends.delete("/:friendship_id", hasAuth, asyncEnv(friendDelete));

export default friends;
