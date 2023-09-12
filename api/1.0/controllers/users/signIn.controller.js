import { db } from "../../database/MySQL.database.js";
import {
	err400,
	err403,
	err500,
	suc200,
} from "../../utils/responseWrapper.util.js";
import hash from "../../utils/hash.util.js";
import { signJWT } from "../../utils/jwtWrapper.util.js";
import { eq } from "../../database/logicalOperators.database.js";

const signInHandler = async (req, res) => {
	switch (req.body.provider) {
		case "native":
			await handleNativeSignIn(req, res);
			break;
		case "facebook":
			await handleFBSignIn(req, res);
			break;
		default:
			err400(res, { error: "No provider" });
	}
};

const handleNativeSignIn = async (req, res) => {
	/* native */
	// fetch data via email
	let result;
	try {
		result = await db
			.select("users", ["id", "provider", "name", "email", "picture", "pwd"])
			.where(eq("email", req.body.email))
			.execute();
	} catch (err) {
		err500(res, { error: "Server Error Response", message: err });
		return;
	}
	const [data] = result;
	if (typeof data === "undefined") {
		err403(res, { error: "User not found" });
		return;
	}
	if (hash(req.body.password) !== data["pwd"]) {
		err403(res, { error: "Wrong Password" });
		return;
	}
	suc200(res, {
		data: {
			access_token: signJWT({ email: req.body.email, id: data["id"] }),
			user: {
				id: data["id"],
				provider: data["provider"],
				name: data["name"],
				email: data["email"],
				picture: data["picture"],
			},
		},
	});
};

/* handle facebook sign in */
const handleFBSignIn = async (req, res) => {
	const token = req.body.access_token;
	// endpoint
	const endpoint =
		`https://graph.facebook.com/v17.0/me?` +
		`fields=id,name,email,picture&access_token=${token}`;

	// fetch
	let result;
	try {
		result = await fetch(endpoint);
	} catch (err) {
		err500(res, { error: "Fetch Error" });
		return;
	}

	// insert into db
	const name = result["name"];
	const email = result["email"];
	const picture = data["picture"]["data"]["url"];
	try {
		result = await db
			.insert("users", {
				provider: "facebook",
				name: name,
				email: `'${email}'`,
				picture: picture,
				pwd: "",
			})
			.execute();
	} catch (error) {
		err500(res, { error: "Insert Error" });
		return;
	}

	suc200(res, {
		data: {
			access_token: signJWT({ email: email, id: result.id }),
			user: {
				id: result.id,
				provider: "facebook",
				name: name,
				email: email,
				picture: picture,
			},
		},
	});
};

export { signInHandler };
