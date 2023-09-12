import { extname } from "path";
import multer from "multer";
import { diskStorage } from "multer";
import extractJWT from "../../utils/processJWT.util.js";
import { verifyJWT } from "../../utils/jwtWrapper.util.js";
import { err403, err500, suc200 } from "../../utils/responseWrapper.util.js";
import { db } from "../../database/MySQL.database.js";
import { eq } from "../../database/logicalOperators.database.js";
import { delProfile } from "../../cache/profile.cache.js";

const IP = "54.95.31.201";

// multer setup
const storage = diskStorage({
	destination: (req, file, cb) => cb(null, "static/"),
	filename: (req, file, cb) => {
		const ext = extname(file.originalname);
		cb(null, `${req.user_id}${ext}`);
	},
});

const picUploader = multer({ storage: storage });

const updatePicHandler = async (req, res, next) => {
	let result;
	try {
		result = verifyJWT(extractJWT(req));
	} catch (err) {
		err403(res, { error: "Wrong Token", message: err });
		return;
	}
	try {
		result = await db
			.select("users", ["id"])
			.where(eq("email", result.email))
			.execute();
	} catch (err) {
		err500(res, { error: "Fetch Error", message: err });
		return;
	}
	const [data] = result;
	const id = data["id"];
	req.user_id = id;
	next();
};

const updatePicAfter = async (req, res) => {
	const url = `https://${IP}/static/${req.file.filename}`;
	try {
		await db
			.update("users", {
				picture: url,
			})
			.where(`id=${req.user_id}`)
			.execute();
	} catch (err) {
		err500(res, { error: "Update Pic Error", message: err });
		return;
	}
	suc200(res, {
		data: {
			picture: url,
		},
	});
	delProfile(req.user_id);
};

export { picUploader, updatePicAfter, updatePicHandler };
