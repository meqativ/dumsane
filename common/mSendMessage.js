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
	const Send = findByProps("_sendMessage");
	const { createBotMessage } = findByProps("createBotMessage");
	const Avatars = findByProps("BOT_AVATARS");
	const { getChannelId: getFocusedChannelId } = findByStoreName("SelectedChannelStore");
	return function (message, mod) {
		message.channelId ??= getFocusedChannelId();
		if ([null, undefined].includes(message.channelId)) throw new Error("No channel id to receive the message into (channelId)");
		let msg = message;
		if (message.really) {
			if (typeof mod === "object") msg = merge(msg, mod);
			const args = [msg, {}];
			args[0].tts ??= false;
			for (const key of ["allowedMentions", "messageReference"]) {
				if (key in args[0]) {
					args[1][key] = args[0][key];
					delete args[0][key];
				}
			}
			const overwriteKey = "overwriteSendMessageArg2"
			if (overwriteKey in args[0]) {
				// so that you can use the keys i may have missed in the for loop above
				args[1] = args[0][overwriteKey];
				delete args[0][overwriteKey];
			}
			return Send._sendMessage(message.channelId, ...args);
		}
		if (mod !== true) msg = createBotMessage(msg);
		if (typeof mod === "object") {
			msg = merge(msg, mod);
			if (typeof mod.author === "object")
				(function processAvatarURL() {
					const author = mod.author;
					if (typeof author.avatarURL === "string") {
						Avatars.BOT_AVATARS[author.avatar ?? author.avatarURL] = author.avatarURL;
						author.avatar ??= author.avatarURL
						delete author.avatarURL;
					}
				})();
		}
		Send.receiveMessage(msg.channel_id, msg);
		return msg;
	};
}
