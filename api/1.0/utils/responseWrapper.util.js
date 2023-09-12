const suc200 = (res, message) => res.status(200).json(message);
const err400 = (res, message) => res.status(400).json(message);
const err401 = (res, message) => res.status(401).json(message);
const err403 = (res, message) => res.status(403).json(message);
const err429 = (res, message) => res.status(429).json(message);
const err500 = (res, message) => res.status(500).json(message);

export { suc200, err400, err401, err403, err429, err500 };
