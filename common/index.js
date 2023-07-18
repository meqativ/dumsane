export { mSendMessage } from "./mSendMessage.js";
export const ZWD = "\u200d",
	Promise_UNMINIFIED_PROPERTY_NAMES = ["_deferredState", "_state", "_value", "_deferreds"],
	PROMISE_STATE_NAMES = {
		0: "pending",
		1: "fulfilled",
		2: "rejected",
		3: "adopted",
	};

export function codeblock(text, language = "", escape = false) {
	if (!text) throw new Error("No text to wrap in a codeblock provided");
	if (escape) text = text.replaceAll("```", `\`${ZWD}\`\``);
	return `\`\`\`${language}\n${text}\n\`\`\``;
}

/* Assigns the displayName property (translation) eveywhere it's needed
 * @param {object} obj The command object to assign the properties on (mutates)
 * @param {object|undefined} translations The translations to use. Must be in the same position, has to have an "s" at the end of the name and has to be an object with locale:string k,v
 * @param {string|undefined} locale The locale to use
 *
 * @returns {object} the object that was passed in the first argument
 *
 * @example
 * cmdDisplays({
 *   name: "meow",
 *   description: "mrrrp",
 * }, {
 *   names: {
 *     ru: "мяу"
 *   },
 *   description: {
 *     ru: "муррр"
 *   }
 * }, "ru")
 */
export function cmdDisplays(obj, translations, locale) {
	if (!obj?.name || !obj?.description) throw new Error(`No name(${obj?.name}) or description(${obj?.description}) in the passed command (command name: ${obj?.name})`);

	obj.displayName ??= translations?.names?.[locale] ?? obj.name;
	obj.displayDescription ??= translations?.names?.[locale] ?? obj.description;
	if (obj.options) {
		if (!Array.isArray(obj.options)) throw new Error(`Options is not an array (received: ${typeof obj.options})`);
		for (var optionIndex = 0; optionIndex < obj.options.length; optionIndex++) {
			const option = obj.options[optionIndex];
			// TODO: Handle subcommands (type 1 or 2 probably i forgor)
			if (!option?.name || !option?.description) throw new Error(`No name(${option?.name}) or description(${option?.description} in the option with index ${optionIndex}`);
			option.displayName ??= translations?.options?.[optionIndex]?.names?.[locale] ?? option.name;
			option.displayDescription ??= translations?.options?.[optionIndex]?.descriptions?.[locale] ?? option.description;
			if (option?.choices) {
				if (!Array.isArray(option?.choices)) throw new Error(`Choices is not an array (received: ${typeof option.choices})`);
				for (var choiceIndex = 0; choiceIndex < option.choices.length; choiceIndex++) {
					const choice = option.choices[choiceIndex];
					if (!choice?.name) throw new Error(`No name of choice with index ${choiceIndex} in option with index ${optionIndex}`);
					choice.displayName ??= translations?.options?.[optionIndex]?.choices?.[choiceIndex]?.names?.[locale] ?? choice.name;
				}
			}
		}
	}
	return obj;
}
export function generateRandomString(chars, length = 27) {
	if (typeof chars !== "string") throw new Error("Passed chars isn't a string");
	if (chars?.length <= 0) throw new Error("Invalid chars length");

	let result = "";

	for (let i = 0; i < length; i++) result += chars[Math.floor(Math.random() * chars.length)];

	return result;
}
export function areArraysEqual(arr1, arr2) {
	if (arr1.length !== arr2.length) return false;
	for (let i = 0; i < arr1.length; i++) {
		const item1 = arr1[i];
		const item2 = arr2[i];

		if (Array.isArray(item1) && Array.isArray(item2)) {
			if (!areArraysEqual(item1, item2)) return false;
		} else if (item1 !== null && item2 !== null && typeof item1 === "object" && typeof item2 === "object") {
			if (!areArraysEqual(Object.values(item1), Object.values(item2))) return false;
		} else if (item1 !== item2) {
			return false;
		}
	}

	return true;
}
export function cloneWithout(value, without, replace) {
	if (typeof value !== "object") return value;
	if (without.some(($) => (Array.isArray($) ? (Array.isArray(value) ? areArraysEqual($, value) : false) : $ === value))) return replace;

	const newObj = Array.isArray(value) ? [] : {};
	for (const key in value) {
		if (Array.isArray(value[key])) {
			newObj[key] = cloneWithout(value[key], without, replace);
		} else if (without.includes(value[key])) {
			newObj[key] = replace;
		} else {
			newObj[key] = cloneWithout(value[key], without, replace);
		}
	}
	return newObj;
}

/* Calls and awaits a promise function, and returns a [result, error] array
 * @param {function} promise A function that returns a promise
 * @example
 * async function log(...messages) {
 *	if (messages[0] === "error")) throw new Error() // reject(new Error)
 *
 *	console.log("[log]", ...messages)
 *	return messages // resolve(messages)
 * }
 * await awaitPromise(log, "meow") // [ ["meow"], null ]
 *
 * await awaitPromise(log, "error") // [ null, Error ]
 */
export async function awaitPromise(promiseFn, ...args) {
	let output = [null, null];
	try {
		output[0] = await promiseFn(...args);
	} catch (error) {
		output[1] = error;
	}
	return output;
}

export function processRows(rows) {
	if (!Array.isArray(rows) || !rows.every((row) => Array.isArray(row) && typeof row[0] === "string")) return JSON.stringify(rows);

	return rows
		.sort(([a], [b]) => a.length - b.length || a.localeCompare(b))
		.map((row) => (row[0] === "" ? row[1] : row.join("∶ ")))
		.join("\n");
}

/* Returns an object with the properties of a Promise but with the proper key names (hermes polyfill specific)
 * Basically UNDOes https://github.com/then/promise/blob/master/src/core.js#L16
 * @param {Promise} promise A promise object with improper key names
 * @param {boolean=false} mutate Whether to add the proper keys on the passed object itself instead of creating a new one
 * @param {boolean=false} removeOldKeys Whether to remove the old keys from the promise
 *
 * @returns {(Promise|object)}
 */
export function fixPromiseProps(improperPromise, mutate = false, removeOldKeys = false) {
	const originalKeys = Object.getOwnPropertyNames(improperPromise);
	if (originalKeys.length !== 4 || originalKeys.every((name, i) => Promise_UNMINIFIED_PROPERTY_NAMES[i] === name)) throw new Error("The passed promise is already proper or isn't a promise");

	let properPromise = {};
	if (mutate) properPromise = improperPromise;

	Promise_UNMINIFIED_PROPERTY_NAMES.forEach((name, i) => {
		properPromise[name] = improperPromise[originalKeys[i]];
		if (mutate && removeOldKeys) delete properPromise[originalKeys[i]];
	});
	Object.setPrototypeOf(properPromise, improperPromise.__proto__);
	return properPromise;
}
/*
 * Makes a pretty typeof-like string from a value
 * @param {any} value
 * @returns {string}
 *
 * @example
 * prettyTypeof(69_999)
 */
export function prettyTypeof(value) {
	const name = [value?.constructor?.name];
	name[0] ??= "Undefined";
	if (name[0] === "Promise" && Object.getOwnPropertyNames(value).length === 4) {
		const state = value["_state"] ?? value[Object.getOwnPropertyNames(value)[1]];
		const stateName = PROMISE_STATE_NAMES[state];
		if (stateName) name[1] = `(${stateName})`;
	} else if (name[0] !== "Undefined" && value?.prototype?.constructor === value && typeof value === "function") {
		name[0] = "Class";
		name[1] = `(${value.name})`;
	} else if (value === null) {
		name[1] = `(null)`;
	} else if (["symbol", "function"].includes(typeof value) && value?.name) {
		name[1] = `(${value.name})`;
	} else if (typeof value === "boolean") {
		name[1] = `(${value})`;
	} else if (typeof value === "string") {
		name[1] = `(len: ${value.length})`;
	} else if (typeof value === "number" && value !== 0) {
		const expo = value.toExponential();
		if (!expo.endsWith("e+1") && !expo.endsWith("e+0")) name[1] = `(${expo})`;
	} else if (Array.isArray(value)) {
		if (value.length !== 0) name[1] = `(len: ${value.length})`;
	}

	return name.join(" ");
}
/* Makes sure that the properties from "defaults" exist on "object" (objects recursively)
 * @param {object} object Any object to apply the changes to (mutates)
 * @param {object} defaults Defaults object to apply the changes from
 *
 * @returns {object} the object that was passed in the first argument
 *
 * @example
 * const object = {};
 * makeDefaults(object, {
 *   example: 6,
 *   exampleTwo: {
 *     example: 1
 *   }
 * });
 */
export function makeDefaults(object, defaults) {
	if (object === undefined) throw new Error("No object passed to make defaults for");
	if (defaults === undefined) throw new Error("No defaults object passed to make defaults off of");

	for (const key in defaults) {
		if (typeof defaults[key] === "object" && !Array.isArray(defaults[key])) {
			if (typeof object[key] !== "object") object[key] = {};
			makeDefaults(object[key], defaults[key]);
		} else {
			object[key] ??= defaults[key];
		}
	}
	return object;
}

export const EMOJIS = {
	getLoading() {
		return Math.random() < 0.01 ? this.aol : this.loadingDiscordSpinner;
	},
	getFailure() {
		return Math.random() < 0.01 ? this.fuckyoy : this.linuth;
	},
	getSuccess() {
		return "";
	},
	loadingDiscordSpinner: "a:loading:1105495814073229393",
	aol: "a:aol:1108834296359301161",
	linuth: ":linuth:1110531631409811547",
	fuckyoy: ":fuckyoy:1108360628302782564",
};

export const AVATARS = {
	command: "https://cdn.discordapp.com/attachments/1099116247364407337/1112129955053187203/command.png",
};
/**
 * Generates a random number within a specified range
 * @param {number} min The minimum value of the range (inclusive)
 * @param {number} max The maximum value of the range (inclusive)
 * @param {number} [precision=0] The number of decimal places to round the result to
 *
 * @returns {number} A random number within the specified range
 * @throws {Error} If the arguments are invalid or precision is greater than 13
 */
export function rng(min, max, precision = 0) {
	if (typeof min !== "number" || isNaN(min)) {
		throw new Error("Invalid first argument, minimum: expected a number");
	}
	if (typeof max !== "number" || isNaN(max)) {
		throw new Error("Invalid second argument, maximum: expected a number");
	}
	if (typeof precision !== "number" || precision < 0) {
		throw new Error("Invalid third argument, precision: expected a positive number");
	}
	if (precision > 13) {
		throw new Error("Invalid third argument, precision: expected a number < 13");
	}
	if (precision !== 0 && precision % 1 !== 0) {
		throw new Error("Invalid third argument, precision: expected an integer");
	}
	const maxPrecision = Math.max((max.toString().split(".")[1] || "").length, (min.toString().split(".")[1] || "").length);
	const computedPrecision = typeof precision === "number" ? precision : maxPrecision;
	return parseFloat((Math.random() * (max - min) + min).toFixed(computedPrecision));
}
