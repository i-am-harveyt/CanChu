import { db } from "../../database/MySQL.database.js";
import { err403, err500, suc200 } from "../../utils/responseWrapper.util.js";
import { verifyJWT } from "../../utils/jwtWrapper.util.js";
import extractJWT from "../../utils/processJWT.util.js";

const userSearch = async (req, res) => {
  const keyword = req.query.keyword;

  // get email from token
  let id;
  try {
    const decoded = verifyJWT(extractJWT(req));
    id = decoded.id;
  } catch (err) {
    err403(res, { error: "Wrong Token", message: err });
    return;
  }

  let rows = [];
  try {
    rows = await db.userSearch(id, keyword);
  } catch (err) {
    err500(res, { error: "Fetch Failed, please contact us" });
    return;
  }
  if (!rows.length) {
    suc200(res, { data: { users: [] } });
    return;
  }

  suc200(res, { data: { users: rows } });
};

export default userSearch;
