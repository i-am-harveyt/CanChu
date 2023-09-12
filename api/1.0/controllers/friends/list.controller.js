import { db } from "../../database/MySQL.database.js";
import { and, eq, or } from "../../database/logicalOperators.database.js";
import { verifyJWT } from "../../utils/jwtWrapper.util.js";
import extractJWT from "../../utils/processJWT.util.js";
import { err403, suc200 } from "../../utils/responseWrapper.util.js";

const friendsList = async (req, res) => {
	let email = "";
	try {
		const decoded = verifyJWT(extractJWT(req));
		email = decoded.email;
	} catch (err) {
		err403(res, "Invalid Token");
		return;
	}

	let ret = [];
	try {
		const rows = await db
			.select("users u", [
				"u.id as uid",
				"u.name",
				"u.picture",
				"f.id as fid",
				"f.from_id",
				"f.to_id",
			])
			.left_join("users ue")
			.on(eq("ue.email", email))
			.inner_join("friendship f")
			.on(
				and(
					or(
						and("f.from_id=u.id", "f.to_id=ue.id"),
						and("f.from_id=ue.id", "f.to_id=u.id")
					),
					eq("f.status", 1)
				)
			)
			.execute();
		rows.map((row) => {
			ret.push({
				id: row.uid,
				name: row.name,
				picture: row.picture,
				friendship: {
					id: row.fid,
					status: "friend",
				},
			});
		});
	} catch (err) {
		err403(res, { error: "Fetch failed, email may not correct" });
		return;
	}

	suc200(res, { data: { users: ret } });
};

export default friendsList;
