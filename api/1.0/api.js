import { Router } from "express";
import users from "./routes/users.route.js";
import friends from "./routes/friends.route.js";
import events from "./routes/events.route.js";
import groups from "./routes/groups.route.js";
import posts from "./routes/posts.route.js";
import chat from "./routes/chat.route.js";
import { suc200 } from "./utils/responseWrapper.util.js";
const api = Router();

api.use("/users", users);
api.use("/friends", friends);
api.use("/events", events);
api.use("/posts", posts);
api.use("/groups", groups);
api.use("/chat", chat);

api.get("/", (req, res) => {
  suc200(res, { message: "Hello" });
});

export default api;
