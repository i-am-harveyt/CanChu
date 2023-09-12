import { verifyJWT } from "../../utils/jwtWrapper.util.js";
import extractJWT from "../../utils/processJWT.util.js";
import {
  err400,
  err403,
  err500,
  suc200,
} from "../../utils/responseWrapper.util.js";
import { db } from "../../database/MySQL.database.js";

const groupJoin = async (req, res) => {
  const groupId = parseInt(req.params.group_id);
  if (!groupId) return err400(res, { error: "Group ID is needed" });

  let userId = 0;
  try {
    const decoded = verifyJWT(extractJWT(req));
    userId = decoded.id;
  } catch (err) {
    console.error(err);
    return err403(res, { error: "Wrong Token" });
  }
  if (!userId) return err403(res, { error: "Wrong Token" });

  /* check if the user is already in the group */
  try {
    const [result] = await db.checkWithinGroup(userId, groupId);
    if (result)
      return err400(res, {
        error: "groupJoin: YOU CANNOT SUBMIT THIS REQUEST",
      });
  } catch (err) {
    console.error(err);
    return err403(res, {
      error: "groupJoin: WRONG INFORMATION",
    });
  }

  /* write into DB */
  try {
    const result = await db.groupJoin(userId, groupId);
    if (!result.insertId)
      return err403(res, {
        error: "groupJoin: YOU CANNOT JOIN A GROUP FOR MULTIPLE TIMES!",
      });
  } catch (err) {
    console.error(err);
    err500(res, { error: "groupJoin: INSERT Error" });
    return;
  }

  suc200(res, { data: { group: { id: groupId } } });
};

export default groupJoin;
