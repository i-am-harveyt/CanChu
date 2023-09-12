import { err400, err401, err403 } from "../utils/responseWrapper.util.js";

const isJSON = (req, res, next) => {
  if (!req.is("application/json")) {
    err400(res, { error: "Wrong Format" });
    return;
  }
  next();
};

const isForm = (req, res, next) => {
  if (!req.is("multipart/form-data")) {
    err400(res, { error: "Wrong Format" });
    return;
  }
  next();
};

const hasAuth = (req, res, next) => {
  if (!req.headers.authorization) {
    err400(res, { error: "No Token" });
    return;
  }
  next();
};

const hasQueryKw = (req, res, next) => {
  const kw = req.query.keyword;
  if (!kw) {
    err401(res, { error: "keyword is required" });
    return;
  } else if (!kw.length) {
    err403(res, { error: "The keyword is empty" });
    return;
  }
  next();
};

export { isJSON, isForm, hasAuth, hasQueryKw };
