const characters =
	"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
export const characters2 = characters.replace("+/", "_-");

export function encode(data, discord) {
	if (typeof data !== "number")
		throw new Error(`Passed data isn't a number (received: ${typeof data})`);

	let result = "";
	while (data > 0) {
		result = (discord ? characters2 : characters).charAt(data % 64) + result;
		data = Math.floor(data / 64);
	}

	return result;
}

export function decode(data, discord) {
	if (typeof data !== "string")
		throw new Error(`Passed data isn't a string (received: ${typeof data})`);

	let result = 0;
	for (var i = 0; i < data.length; i++) {
		result *= 64;
		result += (discord ? characters2 : characters).indexOf(data[i]);
	}

	return result;
}
