import { err400 } from "../utils/responseWrapper.util.js";
import validEmail from "../utils/validEmail.util.js";

const validSignInReq = (req, res, next) => {
	const provider = req.body.provider;
	const pwd = req.body.password;
	const email = req.body.email;
	if (
		provider === "native" &&
		(!pwd || pwd.length === 0 || !email || !validEmail(email))
	) {
		err400(res, { error: "Client Error Response" });
		return;
	}

	const token = req.body.access_token;
	if (provider === "facebook" && !token) {
		err400(res, { error: "Client Error Response" });
		return;
	}

	next();
};

export default validSignInReq;
