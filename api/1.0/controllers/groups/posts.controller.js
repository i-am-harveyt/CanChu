import { db } from "../../database/MySQL.database.js";
import { verifyJWT } from "../../utils/jwtWrapper.util.js";
import extractJWT from "../../utils/processJWT.util.js";
import {
	err400,
	err403,
	err500,
	suc200,
} from "../../utils/responseWrapper.util.js";

const groupPosts = async (req, res) => {
	const groupId = parseInt(req.params.group_id);
	if (!groupId) return err400(res, { error: "No group_id" });

	let userId = 0;
	try {
		const decoded = verifyJWT(extractJWT(req));
		userId = decoded.id;
	} catch (err) {
		console.error(err);
		return err403(res, { error: "Wrong Token" });
	}
	if (!userId) return err403(res, { error: "Wrong Token" });

	/* check membership */
	try {
		const [row] = await db.checkWithinGroup(userId, groupId);
		if (!row || !row.status)
			return err400(res, { error: "YOU ARE NOT A MEMBER IN THIS GROUP!" });
	} catch (err) {
		console.error(err);
		return err500(res, { error: "groupPosts: CHECK MEMBERSHIP FAILED" });
	}

	/* fetch group posts */
	let data = [];
	try {
		const rows = await db.groupPosts(groupId);
		data = rows;
	} catch (err) {
		console.error(err);
		return err500(res, { error: "groupPosts: FETCH POSTS FAILED" });
	}
	suc200(res, { data: { posts: data } });
};

export default groupPosts;
