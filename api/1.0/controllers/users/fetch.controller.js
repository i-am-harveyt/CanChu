import processJWT from "../../utils/processJWT.util.js";
import { verifyJWT } from "../../utils/jwtWrapper.util.js";
import { err403, err500, suc200 } from "../../utils/responseWrapper.util.js";
import { db } from "../../database/MySQL.database.js";
import { getProfile, setProfile } from "../../cache/profile.cache.js";
import { getFriendship, setFriendship } from "../../cache/friendship.cache.js";

const fetchProfile = async (req, res) => {
	let self_id;
	try {
		const decoded = verifyJWT(processJWT(req));
		self_id = decoded.id;
	} catch (err) {
		err403(res, { error: "Wrong token", message: err });
		return;
	}
	const query_id = parseInt(req.params.id);

	/* fetch data from cache */
	let cacheProfile = null,
		cacheFriendship = null,
		from_id = 0,
		to_id = 0;
	try {
		cacheProfile = await getProfile(query_id);
		[from_id, to_id, cacheFriendship] = await getFriendship(self_id, query_id);
	} catch (err) {
		err403(res, { error: "fetchProfile ERROR", message: err });
		return;
	}
	if (cacheProfile.id && cacheFriendship.id && from_id && to_id) {
		let ret = {};
		for (const [key, value] of Object.entries(cacheProfile)) ret[key] = value;
		ret["friendship"] = cacheFriendship
			? {
				id: cacheFriendship.id,
				status:
					cacheFriendship.status == 1
						? "friend"
						: self_id === from_id
							? "requested"
							: "pending",
			}
			: null;
		suc200(res, { data: { user: ret } });
		return;
	}

	// fetch data from db
	let result;
	try {
		result = await db.fetchProfile(self_id, query_id);
	} catch (err) {
		err500(res, { error: "Profile Fetch Error", message: err });
		return;
	}
	let [data] = result;
	if (!data) {
		// data not found
		err403(res, { error: "Wrong Token" });
		return;
	}

	// return data
	suc200(res, {
		data: {
			user: {
				...data,
			},
		},
	});

	let friendship = data.friendship;
	if (friendship === null) friendship = null;
	else if (friendship.status === "friend") friendship.status = 1;
	else friendship.status = 0;

	await setFriendship(from_id, to_id, data.friendship);
	delete data.friendship;
	await setProfile(query_id, data);
};

export default fetchProfile;
