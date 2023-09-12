import extractJWT from "../../utils/processJWT.util.js";
import { verifyJWT } from "../../utils/jwtWrapper.util.js";
import { db } from "../../database/MySQL.database.js";
import { eq } from "../../database/logicalOperators.database.js";
import {
	err400,
	err403,
	err500,
	suc200,
} from "../../utils/responseWrapper.util.js";

const postCreate = async (req, res) => {
	let email;
	try {
		const decoded = verifyJWT(extractJWT(req));
		email = decoded.email;
	} catch (err) {
		err403(res, { error: "Wrong Token" });
		return;
	}

	let user_id;
	try {
		const [row] = await db
			.select("users", ["id"])
			.where(eq("email", email))
			.execute();
		user_id = row.id;
	} catch (err) {
		err403(res, { error: "Wrong Email" });
		return;
	}
	if (!user_id) {
		err403(res, { error: "There's no such user id." });
		return;
	}

	const context = req.body.context;
	if (!context || !context.length) {
		err400(res, "There is no context!(or context is empty)");
		return;
	}

	let post_id;
	try {
		const insertInfo = await db
			.insert("posts", { author_id: user_id, context: context })
			.execute();
		post_id = insertInfo.insertId;
	} catch (err) {
		err500(res, { error: "Post error! Please contact us." });
		return;
	}

	suc200(res, { data: { post: { id: post_id } } });
};

export default postCreate;
