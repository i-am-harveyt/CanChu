import extractJWT from "../../utils/processJWT.util.js";
import { verifyJWT } from "../../utils/jwtWrapper.util.js";
import { err403, err500, suc200 } from "../../utils/responseWrapper.util.js";
import { db } from "../../database/MySQL.database.js";
import { and, eq } from "../../database/logicalOperators.database.js";
import eventType from "../../utils/eventTypeMapping.util.js";
import { setFriendship } from "../../cache/friendship.cache.js";

const friendRequest = async (req, res) => {
  let from_id = -1;
  try {
    let result = verifyJWT(extractJWT(req));
    from_id = result.id;
  } catch (err) {
    err403(res, { error: "Client Error: Wrong Token." });
    return;
  }
  const to_id = parseInt(req.params.user_id);

  // if from and to are same, return
  if (from_id === to_id) {
    err403(res, { error: "The one who send cannot be the one who receive." });
    return;
  }

  // if to_id is actually exist, return if not
  try {
    const [result] = await db
      .select("users", ["id"])
      .where(eq("id", to_id))
      .execute();
    if (!result) {
      err403(res, { error: `User with id=${to_id} does not exist` });
      return;
    }
  } catch (err) {
    err403(res, {
      error: `User with id=${to_id} does not exist`,
      message: err,
    });
    return;
  }

  // if a has sent to b, b cannot send to a
  try {
    const [result] = await db
      .select("friendship", ["status"])
      .where(and(eq("from_id", to_id), eq("to_id", from_id)))
      .execute();
    if (result) {
      err403(res, { err: "You are sent by the one you request." });
      return;
    }
  } catch (err) {
    err500(res, { error: "Friendship insert error", message: err });
    return;
  }

  // write into DB
  let insertId = 0;
  try {
    const result = await db.sendRequest(from_id, to_id);
    insertId = result.insertId;
  } catch (err) {
    err500(res, { error: "Insert Friendship Error", message: err });
    return;
  }
  if (insertId === 0) {
    err403(res, { error: "You have sent the request to the same person!" });
    return;
  }

  try {
    await db
      .insert(
        "events",
        {
          type: eventType.friend_request,
          user_id: to_id,
          evoker_id: from_id,
        },
        true,
      )
      .execute();
  } catch (err) {
    err500(res, { error: "Insert Error When sending request." });
    return;
  }

  // write into cache
  try {
    await setFriendship(from_id, to_id, { id: insertId, status: 0 });
  } catch (err) {
    console.error("friendReq Error");
    err403(res, { error: err });
    return;
  }

  suc200(res, { data: { friendship: { id: insertId } } });
};

export { friendRequest };
