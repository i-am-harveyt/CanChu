import { db } from "../../database/MySQL.database.js";
import { verifyJWT } from "../../utils/jwtWrapper.util.js";
import extractJWT from "../../utils/processJWT.util.js";
import {
  err400,
  err403,
  err500,
  suc200,
} from "../../utils/responseWrapper.util.js";

const chatGet = async (req, res) => {
  const queryId = parseInt(req.params.user_id);
  if (!queryId) return err400(res, { error: "No target user" });

  let userId = 0;
  try {
    const decoded = verifyJWT(extractJWT(req));
    userId = decoded.id;
  } catch (err) {
    console.error(err);
    return err403(res, { error: "Wrong Token" });
  }
  if (!userId) return err403(res, { error: "Wrong Token" });

  let { cursor } = req.query;
  if (cursor) cursor = atob(cursor);

  let data = [];
  try {
    const rows = await db.searchMessages(userId, queryId, cursor);
    data = rows;
  } catch (err) {
    console.error(err);
    return err500(res, { error: "getMessages: FETCH MESSAGE ERROR" });
  }

  if (data.length > 10) cursor = btoa(data[10].id);
  else cursor = null;

  suc200(res, {
    data: {
      messages: data.slice(0, 10),
      next_cursor: cursor,
    },
  });
};

export default chatGet;
