import cache from "../cache/redis.cache.js";
import { err429 } from "../utils/responseWrapper.util.js";

const limitKey = (ip = "") => {
  return `${ip}/limit`;
};

const rateLimiter = () => {
  const RATE_LIMIT_QUOTA = process.env.RATE_LIMIT_QUOTA
    ? process.env.RATE_LIMIT_QUOTA
    : 10;
  const RATE_LIMIT_EXP = 1;
  return async (req, res, next) => {
    const key = limitKey(req.header["X-Forwarded-For"]); // via some nginx setup
    const times = await cache.redis.incr(key);
    if (times < RATE_LIMIT_QUOTA) {
      if (times == 1) {
        cache.redis.expire(key, RATE_LIMIT_EXP);
      }
      return next();
    }
    err429(res, { error: "Too Much Requests!" });
    return;
  };
};

export default rateLimiter;
