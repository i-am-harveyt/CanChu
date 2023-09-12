import extractJWT from "../../utils/processJWT.util.js";
import { verifyJWT } from "../../utils/jwtWrapper.util.js";
import { err403, suc200 } from "../../utils/responseWrapper.util.js";
import { db } from "../../database/MySQL.database.js";

const friendPend = async (req, res) => {
	const { id } = verifyJWT(extractJWT(req));
	if (!id) {
		err403(res, { error: "Client Error: Wrong Token." });
		return;
	}

	let data = {};
	try {
		data = await db.friendshipPending(id);
	} catch (error) {
		err403(res, { error: "Data Not Found" });
		return;
	}
	suc200(res, { data: { users: data } });
};

export { friendPend };
