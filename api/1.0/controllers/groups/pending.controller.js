import { verifyJWT } from "../../utils/jwtWrapper.util.js";
import extractJWT from "../../utils/processJWT.util.js";
import {
	err400,
	err403,
	err500,
	suc200,
} from "../../utils/responseWrapper.util.js";
import { db } from "../../database/MySQL.database.js";

const groupPending = async (req, res) => {
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

	try {
		const [result] = await db.groupInfo(groupId);
		if (userId !== result.owner_id)
			return err400(res, {
				error: "groupPending: YOU ARE NOT THE OWNER OF THIS GROUP",
			});
	} catch (err) {
		return err403(res, { error: "groupPending: FETCH INFO FAILED" });
	}

	let users = null;
	try {
		const rows = await db.groupPending(userId, groupId);
		users = rows;
	} catch (err) {
		console.error(err);
		return err500(res, { error: "groupPending: SELECT FAIL" });
	}
	if (!users) return err403(res, { error: "THERE'S NO RELATED DATA" });
	return suc200(res, { data: { users: users } });
};

export default groupPending;
