export function cmdDisplays(obj, translations, locale) {
	if (!obj.name || !obj?.description) throw new Error(`No name(${obj?.name}) or description(${obj?.description}) in the passed command (command name: ${obj?.name})`);

	obj.displayName ??= translations?.names?.[locale] ?? obj.name;
	obj.displayDescription ??= translations?.names?.[locale] ?? obj.description;
	if (obj.options) {
		if (!Array.isArray(obj.options)) throw new Error(`Options is not an array (received: ${typeof obj.options})`);
		for (var optionIndex = 0; optionIndex < obj.options.length; optionIndex++) {
			const option = obj.options[optionIndex];
			// TODO: Handle subcommands (type 1, 2 probably i forgor)
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
	if (without.some(($) => (Array.isArray($) ? areArraysEqual($, value) : $ === value))) return replace;
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
	const { metro } = vendetta;
	const { receiveMessage } = metro.findByProps("sendMessage", "receiveMessage");
	const { createBotMessage } = metro.findByProps("createBotMessage");
	const Avatars = metro.findByProps("BOT_AVATARS");
	return function (message, mod) {
		message.channelId ??= metro.findByStoreName("SelectedChannelStore").getChannelId();
		if ([null, undefined].includes(message.channelId)) throw new Error("No channel id to receive the message into (channelId)");
		if (mod !== undefined && "author" in mod) {
			if ("avatar" in mod.author && "avatarURL" in mod.author) {
				Avatars.BOT_AVATARS[mod.author.avatar] = mod.author.avatarURL;
				delete mod.author.avatarURL;
			}
		}
		let msg = mod === true ? message : createBotMessage(message);
		if (typeof mod === "object") msg = vendetta.metro.findByProps("merge").merge(msg, mod);
		receiveMessage(message.channelId, msg);
		return msg;
	};
}

export function prettyTypeof(value, raw) {
	const name = [value?.constructor?.name];
	name[0] ??= "Undefined";
	if (name[0] !== "Undefined" && value?.prototype?.constructor === value && typeof value === "function") {
		console.log("h");
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
		if (!expo.endsWith("e+1")) name[1] = expo;
	}

	return name.join(" ");
}

export function makeDefaults(object, defaults) {
	if (object === undefined) throw new Error("No object passed to make defaults for");
	if (defaults === undefined) throw new Error("No defaults object passed to make defaults off of");

	for (const key of Object.keys(defaults)) {
		if (typeof defaults[key] === "object" && !Array.isArray(defaults[key])) {
			if (typeof object[key] !== "object") object[key] = {};
			makeDefaults(object[key], defaults[key]);
		} else {
			object[key] ??= defaults[key];
		}
	}
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
