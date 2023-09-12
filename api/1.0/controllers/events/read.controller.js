import { db } from "../../database/MySQL.database.js";
import { eq, and } from "../../database/logicalOperators.database.js";
import { verifyJWT } from "../../utils/jwtWrapper.util.js";
import extractJWT from "../../utils/processJWT.util.js";
import { err403, err500, suc200 } from "../../utils/responseWrapper.util.js";

const eventRead = async (req, res) => {
	// check token
	let email;
	try {
		const result = verifyJWT(extractJWT(req));
		email = result["email"];
	} catch (err) {
		err403(res, "Wrong Token");
		return;
	}

	const event_id = req.params.event_id;

	try {
		const row = await db
			.update("events e", { is_read: true })
			.inner_join("users u")
			.on("u.id=e.user_id")
			.where(and(eq("u.email", email), eq("e.id", event_id)))
			.execute();
		if (row.affectedRows === 0) {
			err403(res, {
				error: "Something went wrong... please check your email or event_id",
			});
			return;
		}
	} catch (err) {
		err500(res, { error: "Update Error in eventRead" });
		return;
	}

	suc200(res, { data: { event: { id: event_id } } });
};
export default eventRead;
