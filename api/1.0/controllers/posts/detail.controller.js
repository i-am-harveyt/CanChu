import { db } from "../../database/MySQL.database.js";
import { eq } from "../../database/logicalOperators.database.js";
import { verifyJWT } from "../../utils/jwtWrapper.util.js";
import timeFormatter from "../../utils/timeFormatter.util.js";
import extractJWT from "../../utils/processJWT.util.js";
import {
  err400,
  err403,
  err500,
  suc200,
} from "../../utils/responseWrapper.util.js";

const postDetail = async (req, res) => {
  let user_id = -1;
  try {
    const decoded = verifyJWT(extractJWT(req));
    user_id = decoded.id;
  } catch (err) {
    err400(res, { error: "Invalid token" });
    return;
  }
  if (!user_id) {
    err403(res, { error: "No user_id" });
    return;
  }

  const post_id = parseInt(req.params.id);
  let post_data = {};
  try {
    const [result] = await db.postDetail(post_id, user_id);
    post_data = result;
    post_data.is_liked = Boolean(post_data.is_liked);
    post_data.created_at = timeFormatter(post_data.created_at);
  } catch (err) {
    err500(res, { error: "Error when fetching post detail", message: err });
    return;
  }

  let comment_data = [];
  try {
    const rows = await db
      .select("comments c", [
        "c.id AS id",
        "c.content",
        "c.created_at",
        "u.id AS user_id",
        "u.name",
        "u.picture",
      ])
      .left_join("users u")
      .on("c.author_id=u.id")
      .where(eq("c.post_id", post_id))
      .execute();
    for (let row of rows) {
      comment_data.push({
        id: row.id,
        created_at: timeFormatter(row.created_at),
        content: row.content,
        user: {
          id: row.user_id,
          name: row.name,
          picture: row.picture,
        },
      });
    }
  } catch (err) {
    err500(res, { error: "Error when fetching comment detail" });
    return;
  }

  suc200(res, {
    data: {
      post: {
        id: post_data.id,
        user_id: post_data.user_id,
        created_at: post_data.created_at,
        context: post_data.context,
        is_liked: post_data.is_liked,
        like_count: post_data.like_count,
        comment_count: comment_data.length,
        picture: post_data.picture,
        name: post_data.name,
        comments: comment_data,
      },
    },
  });
};

export default postDetail;
