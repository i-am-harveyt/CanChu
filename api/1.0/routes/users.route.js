import { Router } from "express";
import signUpHandler from "../controllers/users/signUp.controller.js";
import fetchProfile from "../controllers/users/fetch.controller.js";
import {
  updatePicHandler,
  picUploader,
  updatePicAfter,
} from "../controllers/users/updatePic.controller.js";
import updateProfile from "../controllers/users/updateProfile.controller.js";
import { signInHandler } from "../controllers/users/signIn.controller.js";
import { isJSON, isForm, hasAuth } from "../middlewares/headerChecker.mid.js";
import validProvider from "../middlewares/validProvider.util.js";
import validSignUpReq from "../middlewares/validSignUpReq.mid.js";
import validSignInReq from "../middlewares/validSignInReq.mid.js";
import asyncEnv from "../utils/asyncEnv.util.js";
import userSearch from "../controllers/users/search.controller.js";

const users = Router();

/* sign up */
users.post("/signup", isJSON, validSignUpReq, asyncEnv(signUpHandler));

/* sign in */
users.post(
  "/signin",
  isJSON,
  validProvider,
  validSignInReq,
  asyncEnv(signInHandler),
);

/* fetch profile */
users.get("/:id/profile", hasAuth, asyncEnv(fetchProfile));

/* update picture */
users.put(
  "/picture",
  isForm,
  hasAuth,
  asyncEnv(updatePicHandler),
  picUploader.single("picture"),
  asyncEnv(updatePicAfter),
);

users.put("/profile", isJSON, hasAuth, asyncEnv(updateProfile));

users.get("/search", hasAuth, asyncEnv(userSearch));

export default users;
