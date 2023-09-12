const extractJWT = (req) => {
	return req.headers.authorization.slice(7);
}
export default extractJWT;
