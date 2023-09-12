import sha256 from "crypto-js/sha256.js";

const hash = (input = "") => {
  return sha256(input).toString();
};

export default hash;
