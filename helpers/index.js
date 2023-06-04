export function cmdDisplays(obj, translations, locale) {
	if (!obj.name || !obj?.description)
		throw new Error(
			`No name(${obj?.name}) or description(${obj?.description}) in the passed command (command name: ${obj?.name})`
		);

	obj.displayName ??= translations?.names?.[locale] ?? obj.name;
	obj.displayDescription ??= translations?.names?.[locale] ?? obj.description;
	if (obj.options) {
		if (!Array.isArray(obj.options))
			throw new Error(
				`Options is not an array (received: ${typeof obj.options})`
			);
		for (var optionIndex = 0; optionIndex < obj.options.length; optionIndex++) {
			const option = obj.options[optionIndex];
			// TODO: Handle subcommands (type 1, 2 probably i forgor)
			if (!option?.name || !option?.description)
				throw new Error(
					`No name(${option?.name}) or description(${option?.description} in the option with index ${optionIndex}`
				);
			option.displayName ??=
				translations?.options?.[optionIndex]?.names?.[locale] ?? option.name;
			option.displayDescription ??=
				translations?.options?.[optionIndex]?.descriptions?.[locale] ??
				option.description;
			if (option?.choices) {
				if (!Array.isArray(option?.choices))
					throw new Error(
						`Choices is not an array (received: ${typeof option.choices})`
					);
				for (
					var choiceIndex = 0;
					choiceIndex < option.choices.length;
					choiceIndex++
				) {
					const choice = option.choices[choiceIndex];
					if (!choice?.name)
						throw new Error(
							`No name of choice with index ${choiceIndex} in option with index ${optionIndex}`
						);
					choice.displayName ??=
						translations?.options?.[optionIndex]?.choices?.[choiceIndex]
							?.names?.[locale] ?? choice.name;
				}
			}
		}
	}
	return obj;
}

export function mSendMessage(vendetta) {
	const { metro } = vendetta;
	const { receiveMessage } = metro.findByProps("sendMessage", "receiveMessage");
	const { createBotMessage } = metro.findByProps("createBotMessage");
	const Avatars = metro.findByProps("BOT_AVATARS");
	return function (message, mod) {
		if (!message.channelId)
			throw new Error("No channel id to receive the message into (channelId)");
		if (typeof mod !== "undefined" && "author" in mod) {
			if ("avatar" in mod.author && "avatarURL" in mod.author) {
				Avatars.BOT_AVATARS[mod.author.avatar] = mod.author.avatarURL;
				delete mod.author.avatarURL;
			}
		}
		let msg = mod === true ? message : createBotMessage(message);
		if (typeof mod === "object")
			msg = vendetta.metro.findByProps("merge").merge(msg, mod);
		receiveMessage(message.channelId, msg);
		return msg;
	};
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
	command:
		"https://cdn.discordapp.com/attachments/1099116247364407337/1112129955053187203/command.png",
};
