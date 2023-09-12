import { db } from "../../database/MySQL.database.js";
import { and, eq } from "../../database/logicalOperators.database.js";
import { verifyJWT } from "../../utils/jwtWrapper.util.js";
import extractJWT from "../../utils/processJWT.util.js";
import {
	err400,
	err403,
	err500,
	suc200,
} from "../../utils/responseWrapper.util.js";

const postUpdate = async (req, res) => {
	const post_id = parseInt(req.params.id);
	const context = req.body.context;
	if (!context || !context.length) {
		err400(res, { error: "No context or context is empty" });
		return;
	}

	let email;
	try {
		const decoded = verifyJWT(extractJWT(req));
		email = decoded.email;
	} catch (err) {
		err403(res, { error: "Wrong Token" });
		return;
	}

	let author_id = 0;
	try {
		const [row] = await db
			.select("users", ["id"])
			.where(eq("email", email))
			.execute();
		author_id = row.id;
	} catch (err) {
		err403(res, { error: "Wrong Email" });
		return;
	}
	if (!author_id) {
		err403(res, { error: "No email" });
		return;
	}

	try {
		await db
			.update("posts", { context: context })
			.where(and(eq("author_id", author_id), eq("id", post_id)))
			.execute();
	} catch (err) {
		err500(res, { error: "Update Post Error" });
		return;
	}

	suc200(res, { context: context });
};

export default postUpdate;
