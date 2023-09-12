const authExist = (req) => {
	return req.headers["authorization"];
};
export default authExist;
