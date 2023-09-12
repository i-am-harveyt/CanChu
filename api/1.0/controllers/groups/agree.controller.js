import { db } from "../../database/MySQL.database.js";
import { verifyJWT } from "../../utils/jwtWrapper.util.js";
import extractJWT from "../../utils/processJWT.util.js";
import {
  err400,
  err403,
  err500,
  suc200,
} from "../../utils/responseWrapper.util.js";

const groupAgree = async (req, res) => {
  const groupId = parseInt(req.params.group_id);
  if (!groupId) return err400(res, { error: "No group_id" });
  const applicantId = parseInt(req.params.user_id);
  if (!applicantId) return err400(res, { error: "No user_id" });

  let userId = 0;
  try {
    const decoded = verifyJWT(extractJWT(req));
    userId = decoded.id;
  } catch (err) {
    console.error(err);
    return err403(res, { error: "Wrong Token" });
  }
  if (!userId) return err403(res, { error: "Wrong Token" });

  try {
    const [result] = await db.groupInfo(groupId);
    if (userId !== result.owner_id)
      return err400(res, {
        error: "groupPending: YOU ARE NOT THE OWNER OF THIS GROUP",
      });
  } catch (err) {
    return err500(res, { error: "groupAgree: FETCH INFO FAILED" });
  }

  try {
    const result = await db.groupAgree(groupId, applicantId);
    if (result.affectedRows === 0)
      return err403(res, { error: "groupAgree: WRONG INFORMATION" });
    else if (result.changedRows === 0)
      return err403(res, {
        error: "groupAgree: THE PERSON IS ALREADY IN THE GROUP",
      });
  } catch (err) {
    return err500(res, { error: "groupAgree: UPDATE FAILED" });
  }

  suc200(res, { data: { user: { id: applicantId } } });
};

export default groupAgree;
