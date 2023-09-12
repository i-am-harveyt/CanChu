import extractJWT from "../../utils/processJWT.util.js"
import { verifyJWT } from "../../utils/jwtWrapper.util.js"
import { err403, suc200 } from "../../utils/responseWrapper.util.js";
import { db } from "../../database/MySQL.database.js"

const postSearch = async (req, res) => {
	const PER_PAGE=1000;
  let id;
  try {
    const decoded = verifyJWT(extractJWT(req));
    id = decoded.id;
  } catch (err) {
    err403(res, { error: "Invalid Token!" });
    return;
  }

  const { user_id, cursor } = req.query;

  let fetched_data;
  try {
    const result = await db.postSearch(id, cursor, user_id, PER_PAGE);
    fetched_data = result;
  } catch (err) {
    err403(res, { error: "You may give us wrong information.", message: err })
    return;
  }

  let return_data = {
    data: {
      posts: fetched_data.slice(0, PER_PAGE),
    }
  };

  if (fetched_data.length > PER_PAGE) return_data.data.next_cursor = btoa(fetched_data[9].id);
  else return_data.data.next_cursor = null;

  suc200(res, return_data);
};

export default postSearch;
