import { verifyJWT } from "../../utils/jwtWrapper.util.js";
import extractJWT from "../../utils/processJWT.util.js";
import {
  err400,
  err401,
  err403,
  suc200,
} from "../../utils/responseWrapper.util.js";
import { db } from "../../database/MySQL.database.js";
import { and, eq } from "../../database/logicalOperators.database.js";

const postDeleteLike = async (req, res) => {
  const post_id = parseInt(req.params.id);
  if (!post_id) {
    err400(res, { error: "Post ID not found" });
    return;
  }

  let email = "";
  try {
    const decoded = verifyJWT(extractJWT(req));
    email = decoded.email;
  } catch (err) {
    err401(res, { error: "Invalid Token" });
    return;
  }
  if (!email || !email.length) {
    err403(res, { error: "email cannot be extracted" });
    return;
  }

  let user_id = 0;
  try {
    const [row] = await db
      .select("users", ["id"])
      .where(eq("email", email))
      .execute();
    user_id = row.id;
  } catch (err) {
    err403(res, { error: "Invalid Email" });
    return;
  }

  try {
    const deleteInfo = await db
      .delete("likes")
      .where(and(eq("user_id", user_id), eq("post_id", post_id)))
      .execute();
    if (!deleteInfo.affectedRows) {
      err403(res, { error: "Such like data do not existed." });
      return;
    }
  } catch (err) {
    err403(res, {
      error: "DELETE error: you may give us a non-existed post id",
    });
    return;
  }

  suc200(res, { data: { post: { id: post_id } } });
};

export default postDeleteLike;
