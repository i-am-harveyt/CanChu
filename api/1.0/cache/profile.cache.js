import cache from "./redis.cache.js";

const getProfile = async (user_id = 0) => {
	const redis = cache.redis;
	if (!user_id) return null;
	const data = await redis.hmGet(cache.userKey(user_id), cache.profileCols);

	let ret = {};
	for (let i = 0; i < cache.profileCols.length; i++)
		ret[cache.profileCols[i]] =
			data[i] === process.env.JWT_SECRET ? null : data[i];

	return ret;
};

const setProfile = async (user_id = 0, profile = {}) => {
	const redis = cache.redis;

	if (!user_id) return;
	const key = cache.userKey(user_id);
	for (const col of cache.profileCols)
		if (profile[col] === null) profile[col] = process.env.JWT_SECRET;

	try {
		await redis
			.multi()
			.hSet(key, profile)
			.expire(key, cache.expire, "NX") // expires in 5 min
			.exec();
	} catch (err) {
		console.error("SET PROFILE");
		throw err;
	}
};

const delProfile = async (user_id = 0) => {
	if (!user_id) return null;
	await cache.redis.del(cache.userKey(user_id));
};

export { getProfile, setProfile, delProfile };
