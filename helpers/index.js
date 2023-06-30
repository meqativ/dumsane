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
export function generateStr(chars, length = 27) {
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
		} else if (typeof item1 === "object" && typeof item2 === "object") {
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
export function mSendMessage(vendetta) {
	const {
		metro: {
			findByProps,
			findByStoreName,
			common: {
				lodash: { merge },
			},
		},
	} = vendetta;
	const { sendMessage, receiveMessage } = findByProps("sendMessage", "receiveMessage");
	const { createBotMessage } = findByProps("createBotMessage");
	const Avatars = findByProps("BOT_AVATARS");
	const { getChannelId: getFocusedChannelId } = findByStoreName("SelectedChannelStore");

	return function (message, mod) {
		message.channelId ??= getFocusedChannelId();
		if ([null, undefined].includes(message.channelId)) throw new Error("No channel id to receive the message into (channelId)");
		let msg = message;
		if (message.reallySend) {
			if (typeof mod === "object") msg = merge(msg, mod);

			return sendMessage(message.channelId, msg);
		}

		if (mod !== true) msg = createBotMessage(msg);
		if (typeof mod === "object") {
			msg = merge(msg, mod);
			if ("author" in mod)
				(function processAvatarURL() {
					const author = mod.author;
					if (["avatar", "avatarURL"].every((prop) => prop in author)) {
						Avatars.BOT_AVATARS[author.avatar] = author.avatarURL;
						delete author.avatarURL;
					}
				})();
		}
		receiveMessage(msg.channel_id, msg);
		return msg;
	};
}

/* Calls and awaits a promise function, and returns a [result, error] array
 * @param {function} promise A function that returns a promise
 * @param {...any} [args] Arguments to pass to the function
 *
 * @returns {Array}
 *
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

const SANE_PROPERTY_NAMES = ["_deferredState", "_state", "_value", "_deferreds"];
/* Returns an object with the properties of a Promise but with the proper key names (hermes polyfill specific)
 * Basically UNDOes https://github.com/then/promise/blob/master/src/core.js#L16
 * @param {Promise} promise A promise object with improper key names
 * @param {boolean=false} mutate Whether to add the proper keys on the passed object itself instead of creating a new one
 * @param {boolean=false} removeOldKeys Whether to remove the old keys from the promise
 *
 * @returns {(Promise|object)}
 */
export function fixPromiseProps(insanePromise, mutate = false, removeOldKeys = false) {
	const insanePromiseKeys = Object.getOwnPropertyNames(insanePromise);
	if (insanePromiseKeys.length !== 4 || insanePromiseKeys.every((name, i) => SANE_PROPERTY_NAMES[i] === name)) throw new Error("The passed promise is already proper or isn't a promise");

	let sanePromise = {};
	if (mutate) sanePromise = insanePromise;

	SANE_PROPERTY_NAMES.forEach((name, i) => {
		sanePromise[name] = insanePromise[insanePromiseKeys[i]];
		if (mutate && removeOldKeys) delete sanePromise[insanePromiseKeys[i]];
	});
	Object.setPrototypeOf(sanePromise, insanePromise.__proto__);
	return sanePromise;
}
const PROMISE_STATE_NAMES = {
	0: "pending",
	1: "fulfilled",
	2: "rejected",
	3: "adopted",
};
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
		name[1] = "null";
	} else if (["symbol", "function"].includes(typeof value) && value?.name) {
		name[1] = `(${value.name})`;
	} else if (typeof value === "boolean") {
		name[1] = `${value}`;
	} else if (typeof value === "string") {
		name[1] = value.length;
	} else if (typeof value === "number" && value !== 0) {
		const expo = value.toExponential();
		if (!expo.endsWith("e+1") && !expo.endsWith("e+0")) name[1] = expo;
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
	loadingDiscordSpinner: "a:loading:1105495814073229393",
	aol: "a:aol:1108834296359301161",
	linuth: ":linuth:1110531631409811547",
	fuckyoy: ":fuckyoy:1108360628302782564",
	getLoading() {
		return Math.random() < 0.01 ? this?.aol : this.loadingDiscordSpinner;
	},
	getFailure() {
		return Math.random() < 0.01 ? this?.fuckyoy : this.linuth;
	},
	getSuccess() {
		return "";
	},
};

export const AVATARS = {
	command: "https://cdn.discordapp.com/attachments/1099116247364407337/1112129955053187203/command.png",
};
