import { db } from "../../database/MySQL.database.js";
import { verifyJWT } from "../../utils/jwtWrapper.util.js";
import extractJWT from "../../utils/processJWT.util.js";
import {
	err400,
	err403,
	err500,
	suc200,
} from "../../utils/responseWrapper.util.js";

const groupPost = async (req, res) => {
	const groupId = parseInt(req.params.group_id);
	if (!groupId) return err400(res, { error: "No group_id" });
	const context = req.body.context;
	if (!context) return err400(res, { error: "No context" });

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
		if (!row)
			return err400(res, { error: "YOU ARE NOT A MEMBER IN THIS GROUP!" });
	} catch (err) {
		console.error(err);
		return err500(res, { error: "groupPost: CHECK MEMBERSHIP FAIL" });
	}

	/* insert into db */
	let postId = 0;
	try {
		const result = await db.groupPost(groupId, userId, context);
		postId = result.insertId;
	} catch (err) {
		console.error(err);
		return err500(res, { error: "groupPost: INSERT POST FAIL" });
	}

	return suc200(res, {
		data: {
			group: { id: groupId },
			user: { id: userId },
			post: { id: postId },
		},
	});
};

export default groupPost;
