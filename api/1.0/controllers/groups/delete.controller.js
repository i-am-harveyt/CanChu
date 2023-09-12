import { db } from "../../database/MySQL.database.js";
import { verifyJWT } from "../../utils/jwtWrapper.util.js";
import extractJWT from "../../utils/processJWT.util.js";
import {
  err400,
  err403,
  err500,
  suc200,
} from "../../utils/responseWrapper.util.js";

const groupDelete = async (req, res) => {
  const groupId = parseInt(req.params.group_id);
  if (!groupId) return err400(res, { error: "No group_id" });

  let userId = 0;
  try {
    const decoded = verifyJWT(extractJWT(req));
    userId = decoded.id;
  } catch (err) {
    console.error(err);
    return err403(res, { error: "Wrong Token" });
  }
  if (!userId) return err403(res, { error: "Wrong Token" });

  // result
  let result = {};
  try {
    result = await db.deleteGroup(userId, groupId);
  } catch (err) {
    console.error(err);
    err500(res, { error: "DELETE error in friendDelete" });
    return;
  }

  if (!result.affectedRows) {
    // no rows found
    err400(res, {
      error: "No such group or you are not the owner.",
    });
    return;
  }

  suc200(res, { data: { group: { id: groupId } } });
};

export default groupDelete;
