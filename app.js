import rateLimiter from "./api/1.0/middlewares/rateLimiter.mid.js";
import api from "./api/1.0/api.js";
import app from "./api/1.0/config/app.conf.js";

// basic handling
app.get("/", (req, res) => {
	res.send("This page is intended to be empty");
	return;
});

// handle: /api/1.0/
app.use(
	"/api/1.0",
	// rateLimiter(),
	api,
);

export default app;
