const timeFormatter = (time = Date.now()) => {
	const offset = time.getTimezoneOffset();
	time = new Date(time.getTime() - offset * 60 * 1000);
	const time_str = time.toISOString().split("T");
	return `${time_str[0]} ${time_str[1].slice(0, 8)}`;
};

export default timeFormatter;
