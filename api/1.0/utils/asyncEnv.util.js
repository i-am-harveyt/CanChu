const asyncEnv = (asyncFn) => {
	return async (req, res, next) => {
		try {
			await asyncFn(req, res, next);
		} catch (err) {
			console.error(err);
		}
		return;
	};
};

export default asyncEnv;
