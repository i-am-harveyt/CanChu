import extractJWT from "../../utils/processJWT.util.js";
import { verifyJWT } from "../../utils/jwtWrapper.util.js";
import { err403, err500, suc200 } from "../../utils/responseWrapper.util.js";
import { db } from "../../database/MySQL.database.js";
import { eq } from "../../database/logicalOperators.database.js";
import { delProfile } from "../../cache/profile.cache.js"

const updateProfile = async (req, res) => {
  let decoded;
  try {
    decoded = verifyJWT(extractJWT(req));
  } catch (err) {
    err403(res, { error: "Wrong Token", message: err });
    return;
  }
  /* update */
  if (!req.body.name && !req.body.introduction && !req.body.tags) {
    // if nothing to update, just handle
    suc200(res, { message: "Nothing to update" });
    return;
  }
  let updates = {};
  if (req.body.name) updates["name"] = req.body.name;
  if (req.body.introduction) updates["introduction"] = req.body.introduction;
  if (req.body.tags) updates["tags"] = req.body.tags;
  try {
    await db.update("users", updates).where(eq("id", decoded.id)).execute();
  } catch (err) {
    err500(res, { error: "Update Profile Error", message: err });
    return;
  }
  suc200(res, { data: { user: { id: decoded.id } } });
  delProfile(decoded.id, updates);
};

export default updateProfile;
