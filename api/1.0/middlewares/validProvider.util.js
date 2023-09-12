import { err400, err403 } from "../utils/responseWrapper.util.js";

const validProvider = (req, res, next) => {
	switch (req.body.provider) {
		case "native":
		case "facebook":
			next();
			break;

		case null:
		case undefined:
			err400(res, { error: "No provider" });
			return;

		default:
			err403(res, { error: "No provider" });
			return;
	}
};

export default validProvider;
