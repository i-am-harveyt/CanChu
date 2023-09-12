import { db } from "../../database/MySQL.database.js";
import { verifyJWT } from "../../utils/jwtWrapper.util.js";
import extractJWT from "../../utils/processJWT.util.js";
import eventTypeMapping from "../../utils/eventTypeMapping.util.js";
import eventSumMapping from "../../utils/eventSumMapping.util.js";
import { err403, err500, suc200 } from "../../utils/responseWrapper.util.js";
import timeFormatter from "../../utils/timeFormatter.util.js";

const eventGet = async (req, res) => {
	// check token
	let user_id;
	try {
		const result = verifyJWT(extractJWT(req));
		user_id = result["id"];
	} catch (err) {
		err403(res, { error: "Wrong Token", message: err });
		return;
	}

	// select needed data
	let rows;
	try {
		rows = await db.getEvents(user_id);
	} catch (err) {
		err500(res, { error: "Fetch Error in eventGet", message: err });
		return;
	}

	let ret = [];
	rows.map((row) => {
		ret.push({
			id: row.id,
			type: eventTypeMapping[row.type],
			is_read: Boolean(row.is_read),
			image: row.picture,
			created_at: timeFormatter(new Date(row.created_at)),
			summary: eventSumMapping[row.type](row.name),
		});
	});

	suc200(res, { data: { events: ret } });
};

export default eventGet;
