import hash from "../../utils/hash.util.js";
import { signJWT } from "../../utils/jwtWrapper.util.js";
import { err403, err500, suc200 } from "../../utils/responseWrapper.util.js";
import { db } from "../../database/MySQL.database.js";
import { eq } from "../../database/logicalOperators.database.js";

// sign up handler
const signUpHandler = async (req, res) => {
  let result = {};

  // check if email existed
  try {
    result = await db
      .select("users", ["id", "provider", "name", "email", "picture"])
      .where(eq("email", req.body.email))
      .execute();
  } catch (err) {
    err403(res, { error: "Server Error Response", message: err });
    return;
  }
  const [data] = result;
  if (typeof data !== "undefined") {
    err403(res, { error: "Email Already Exists" });
    return;
  }

  // insert
  try {
    result = await db.insert("users", {
      provider: "native",
      name: req.body.name,
      email: req.body.email,
      pwd: hash(req.body.password),
    }).execute();
  } catch (err) {
    err500(res, { error: "Server Error Response", message: err });
    return;
  }

  suc200(res, {
    data: {
      access_token: signJWT({ email: req.body["email"], id: result.insertId }),
      user: {
        id: result.insertId,
        provider: "native",
        name: req.body.name,
        email: req.body.email,
        picture: null,
      },
    },
  });
};

export default signUpHandler;
