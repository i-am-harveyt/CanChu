const eq = (a, b) => {
	if (typeof b === "string") return `(${a}='${b}')`;
	return `(${a}=${b})`;
};
const and = (a, b) => {
	return `(${a} AND ${b})`;
};
const or = (a, b) => {
	return `(${a} OR ${b})`;
};

const like = (
	word = "",
	exp = "",
	arbit_prefix = true,
	arbit_postfix = true
) => {
	return ` ${word} LIKE '${arbit_prefix ? "%" : ""}${exp}${arbit_postfix ? "%" : ""
		}'`;
};

const count = (col = "") => {
	return ` COUNT(${col}) `;
};

export { eq, and, or, like, count };
