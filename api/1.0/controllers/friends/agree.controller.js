import extractJWT from "../../utils/processJWT.util.js";
import { verifyJWT } from "../../utils/jwtWrapper.util.js";
import { err403, err500, suc200 } from "../../utils/responseWrapper.util.js";
import { db } from "../../database/MySQL.database.js";
import eventType from "../../utils/eventTypeMapping.util.js";
import { setFriendship } from "../../cache/friendship.cache.js";

const friendAgree = async (req, res) => {
  let id;
  try {
    const decoded = verifyJWT(extractJWT(req));
    id = decoded.id;
  } catch (err) {
    err403(res, { error: "Client Error: Invalid Token", message: err });
    return;
  }
  if (!id) {
    err403(res, { error: "Client Error: Wrong Token." });
    return;
  }
  const fid = parseInt(req.params.friendship_id);

  // update
  let result = {};
  try {
    result = await db.friendshipAgree(fid, id);
  } catch (err) {
    err500(res, { error: "Update error in FriendshipAgree" });
    return;
  }
  if (!result.affectedRows) {
    err403(res, { error: "No such request" });
    return;
  }

  // search sender and receiver's id
  try {
    result = await db.friendFindSender(fid);
  } catch (err) {
    err403(res, { error: "User not found" });
    return;
  }
  const from_id = result[0].from_id;
  const to_id = id;

  // insert into sender's event
  try {
    await db
      .insert("events", {
        user_id: from_id,
        evoker_id: to_id,
        type: eventType.friend_accept,
      })
      .execute();
  } catch (err) {
    err500(res, { error: "Insert Error in friendAgree" });
    return;
  }

  /* cache */
  try {
    await setFriendship(from_id, to_id, { id: fid, status: 1 });
  } catch (err) {
    console.error("friendAgree error");
    throw err;
  }

  suc200(res, { data: { friendship: { id: fid } } });
};

export { friendAgree };
