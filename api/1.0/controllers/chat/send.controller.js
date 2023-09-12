import { db } from "../../database/MySQL.database.js";
import { verifyJWT } from "../../utils/jwtWrapper.util.js";
import extractJWT from "../../utils/processJWT.util.js";
import {
  err400,
  err403,
  err500,
  suc200,
} from "../../utils/responseWrapper.util.js";

const chatSend = async (req, res) => {
  const toId = parseInt(req.params.user_id);
  if (!toId) return err400(res, { error: "No receiver" });
  const message = req.body.message;
  if (!message) return err400(res, { error: "No message" });

  let fromId = 0;
  try {
    const decoded = verifyJWT(extractJWT(req));
    fromId = decoded.id;
  } catch (err) {
    console.error(err);
    return err403(res, { error: "Wrong Token" });
  }
  if (!fromId) return err403(res, { error: "Wrong Token" });

  let messageId = 0;
  try {
    const result = await db.sendMessage(fromId, toId, message);
    messageId = result.insertId;
  } catch (err) {
    console.error(err);
    return err500(res, { error: "chatSend: INSERT MESSAGE FAILED" });
  }

  return suc200(res, { data: { message: { id: messageId } } });
};

export default chatSend;
