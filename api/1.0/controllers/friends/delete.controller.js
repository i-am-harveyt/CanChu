import { db } from "../../database/MySQL.database.js";
import { err403, err500, suc200 } from "../../utils/responseWrapper.util.js";
import extractJWT from "../../utils/processJWT.util.js";
import { verifyJWT } from "../../utils/jwtWrapper.util.js";
import { delFriendship } from "../../cache/friendship.cache.js";

const friendDelete = async (req, res) => {
  // fetch user id
  let uid;
  try {
    const decoded = verifyJWT(extractJWT(req));
    uid = decoded.id;
  } catch (err) {
    err403(res, { error: "Client Error: Wrong Token." });
    return;
  }
  const fid = parseInt(req.params.friendship_id);

  let from_id = -1;
  let to_id = -1;
  try {
    const [data] = await db.getFriendship(fid);
    if (!data) {
      err403(res, { error: "You may provide wrong id" });
      return;
    }
    from_id = data.from_id;
    to_id = data.to_id;
  } catch (err) {
    err403(res, { error: "You may provide wrong id" });
    return;
  }

  // result
  let result = {};
  try {
    result = await db.friendshipDelete(fid, uid);
  } catch (err) {
    err500(res, { error: "DELETE error in friendDelete", message: err });
    return;
  }

  if (!result.affectedRows) {
    // no rows found
    err403(res, {
      error: "No such relationship or you are the on received.",
    });
    return;
  }

  // update cache
  try {
    await delFriendship(from_id, to_id);
  } catch (err) {
    console.error("Del Cache Error");
    err500(res, { error: "UPDATE Cache ERROR" });
    return;
  }

  suc200(res, { data: { friendship: { id: fid } } });
};

export { friendDelete };
