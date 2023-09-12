import { Router } from "express";
import { hasAuth, isJSON } from "../middlewares/headerChecker.mid.js";
import asyncEnv from "../utils/asyncEnv.util.js";
import postCreate from "../controllers/posts/create.controller.js";
import postUpdate from "../controllers/posts/update.controller.js";
import postCreateLike from "../controllers/posts/like.controller.js";
import postDeleteLike from "../controllers/posts/unlike.controller.js";
import postCreateComment from "../controllers/posts/comment.controller.js";
import postDetail from "../controllers/posts/detail.controller.js";
import postSearch from "../controllers/posts/search.controller.js";

const posts = Router();

posts.get("/search", hasAuth, asyncEnv(postSearch));
posts.get("/:id", hasAuth, asyncEnv(postDetail));
posts.post("/", isJSON, hasAuth, asyncEnv(postCreate));
posts.post("/:id/like", hasAuth, asyncEnv(postCreateLike));
posts.post("/:id/comment", hasAuth, asyncEnv(postCreateComment));
posts.put("/:id", hasAuth, asyncEnv(postUpdate));
posts.delete("/:id/like", hasAuth, asyncEnv(postDeleteLike));

export default posts;
