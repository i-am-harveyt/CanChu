import cache from "./redis.cache.js";

const getFriendship = async (userId1, userId2) => {
	const redis = cache.redis;
	const key1 = cache.friendshipKey(userId1, userId2);
	const key2 = cache.friendshipKey(userId2, userId1);
	let f1, f2;
	try {
		const [c1, c2] = await redis
			.multi()
			.hmGet(key1, cache.friendshipCols)
			.hmGet(key2, cache.friendshipCols)
			.exec();
		(f1 = c1), (f2 = c2);
	} catch (err) {
		console.error("cache getFriendship error");
		throw err;
	}

	if (!f1 && !f2) return null;

	let ret = {};
	if (f1 && f1[0]) {
		for (let i = 0; i < cache.friendshipCols.length; i++)
			ret[cache.friendshipCols[i]] = f1[i];
		return [userId1, userId2, ret];
	} else if (f2 && f2[0]) {
		for (let i = 0; i < cache.friendshipCols.length; i++)
			ret[cache.friendshipCols[i]] = f2[i];
		return [userId2, userId1, ret];
	}
	return [null, null, { id: null, status: null }];
};

const setFriendship = async (fromId, toId, data = null) => {
	const redis = cache.redis;
	if (fromId === toId || data === null) return null;
	const key = cache.friendshipKey(fromId, toId);

	try {
		await redis.multi().hSet(key, data).expire(key, cache.expire, "NX").exec();
	} catch (err) {
		console.error("cache setFriendship error");
		throw err;
	}
};

const delFriendship = async (fromId, toId) => {
	const redis = cache.redis;
	if (fromId === toId) return null;
	const key = cache.friendshipKey(fromId, toId);

	try {
		await redis.del(key);
	} catch (err) {
		console.error("cache setFriendship error");
		throw err;
	}
};

export { getFriendship, setFriendship, delFriendship };
