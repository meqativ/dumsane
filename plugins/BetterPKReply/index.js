import settings from "./settings.jsx";
const msgStore = vendetta.metro.findByStoreName("MessageStore");
function transformMessagePK(msg) {
	if (message?.message_reference?.message_id) return msg;
	if (!message.embeds?.[0]?.description?.startsWith("**[Reply to:]("))
		return msg;
	const matches = message.embeds[0].description.match(
		/channels\/(\d+)\/(\d+)\/(\d+)/
	);
	message.embeds.shift();
	message.message_reference = {
		guild_id: matches[1],
		channel_id: matches[2],
		message_id: matches[3],
	};
	if (vendetta.plugin.storage["fetch_message"] === true)
		message.referenced_message = msgStore.getMessage(matches[3]);
	return msg;
}
export default {
	settings,
	onLoad: function () {
		this.onUnload = vendetta.patcher.before(
			"dispatch",
			vendetta.metro.common.FluxDispatcher,
			([event]) => {
				if (event.type === "LOAD_MESSAGES_SUCCES") {
					event.messages = event.messages.map(transformMessagePK);
					return [event];
				} else if (event.type === "MESSAGE_CREATE") {
					event.message = transformMessagePK(event.message);
					return [event];
				}
			}
		);
	},
};
