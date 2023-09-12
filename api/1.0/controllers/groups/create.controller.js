import { db } from "../../database/MySQL.database.js";
import { verifyJWT } from "../../utils/jwtWrapper.util.js";
import extractJWT from "../../utils/processJWT.util.js";
import {
	err400,
	err403,
	err500,
	suc200,
} from "../../utils/responseWrapper.util.js";

const groupCreate = async (req, res) => {
	if (!req.body.name) return err400(res, { error: "No group name" });

	let userId = 0;
	try {
		const decoded = verifyJWT(extractJWT(req));
		userId = decoded.id;
	} catch (err) {
		console.error(err);
		return err403(res, { error: "Wrong Token" });
	}
	if (!userId) return err403(res, { error: "Wrong Token" });

	let insertId;
	try {
		const result = await db.createGroup(userId, req.body.name);
		insertId = result.insertId;
	} catch (err) {
		console.error(err);
		return err500(res, { error: "groupCreate: INSERT ERROR" });
	}

	try {
		await db.groupJoin(userId, insertId, true);
	} catch (err) {
		console.error(err);
		return err500(res, { error: "groupCreate: groupJoin: INSERT ERROR" });
	}

	return suc200(res, { data: { group: { id: insertId } } });
};

export default groupCreate;
