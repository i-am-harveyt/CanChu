import { err400, err403 } from "../utils/responseWrapper.util.js";
import validEmail from "../utils/validEmail.util.js";

const validSignUpReq = (req, res, next) => {
	// examine all required fields
	if (!req.body.name || !req.body.email || !req.body.password) {
		err400(res, { error: "Client Error Response" });
		return;
	} else if (
		req.body.name.length === 0 ||
		req.body.email.length === 0 ||
		req.body.password.length === 0
	) {
		err400(res, { error: "Client Error Response" });
		return;
	} else if (!validEmail(req.body.email)) {
		err403(res, { error: "Client Error Response" });
		return;
	}

	next();
};

export default validSignUpReq;
