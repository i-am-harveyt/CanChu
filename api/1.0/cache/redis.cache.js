// load dotenv
import { config } from "dotenv";
config();
import { createClient } from "redis";

class Cache {
	constructor() {
		this.redis = createClient({
			url: `redis://${process.env.REDIS_HOST}:6379`,
			pingInterval: 1000,
		});
		this.redis.on("error", (err) => console.error("Redis Client Error", err));
		this.expire = 120; // 2 mins
		this.redis.connect();
		this.profileCols = [
			"id",
			"name",
			"picture",
			"friend_count",
			"introduction",
			"tags",
		];
		this.friendshipCols = ["id", "status"];
	}

	userKey(userId) {
		return `user:${userId}`;
	}

	friendshipKey(fromId, toId) {
		return `friendship:${fromId}-${toId}`;
	}
}

const cache = new Cache();
export default cache;
