import { Router } from "express";
import asyncEnv from "../utils/asyncEnv.util.js";
import { hasAuth, isJSON } from "../middlewares/headerChecker.mid.js";
import groupCreate from "../controllers/groups/create.controller.js";
import groupDelete from "../controllers/groups/delete.controller.js";
import groupJoin from "../controllers/groups/join.controller.js";
import groupPending from "../controllers/groups/pending.controller.js";
import groupAgree from "../controllers/groups/agree.controller.js";
import groupPost from "../controllers/groups/post.controller.js";
import groupPosts from "../controllers/groups/posts.controller.js";

const groups = Router();

groups.post("/", hasAuth, isJSON, asyncEnv(groupCreate));
groups.delete("/:group_id", hasAuth, asyncEnv(groupDelete));
groups.post("/:group_id/join", hasAuth, asyncEnv(groupJoin));
groups.get("/:group_id/member/pending", hasAuth, asyncEnv(groupPending));
groups.post("/:group_id/member/:user_id/agree", hasAuth, asyncEnv(groupAgree));
groups.post("/:group_id/post", hasAuth, isJSON, asyncEnv(groupPost));
groups.get("/:group_id/posts", hasAuth, asyncEnv(groupPosts));

export default groups;
