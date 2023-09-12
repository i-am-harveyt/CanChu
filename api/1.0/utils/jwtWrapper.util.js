import pkg from "jsonwebtoken";
const { sign, verify } = pkg;

const signJWT = (input = { default_key: "default_value" }) => {
	return sign(input, process.env.JWT_SECRET, {
		expiresIn: 60 * 60 * 24,
	});
};

const verifyJWT = (input) => {
	try {
		return verify(input, process.env.JWT_SECRET);
	} catch (err) {
		throw err;
	}
};

export { signJWT, verifyJWT };
