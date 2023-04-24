import settings from "./settings.jsx";
const msgStore = vendetta.metro.findByStoreName("MessageStore");
function transformMessagePK(message) {
	if (message?.message_reference?.message_id) return message;
	if (message.id === "1099648298723332176") console.log(message)
	if (!message.embeds?.[0]?.description?.startsWith("**[Reply to:](") && !message.embeds?.[0]?.description?.startsWith("*[(click to see attachment)["))
		return message;
	const matches = message.embeds[0].description.match(
		/channels\/(\d+)\/(\d+)\/(\d+)/
	);
	const e = message.embeds.shift();
	message.message_reference = {
		guild_id: matches[1],
		channel_id: matches[2],
		message_id: matches[3],
	};
	if (vendetta.plugin.storage["fetch_message"] === true){
		delete message.webhook_id;
		delete message.application_id;
		console.log("h")
		message.author.discriminator = 6969;
	//	message.author.bot = false;:
		message.referenced_message = msgStore.getMessage(matches[3]) ?? {
			id: matches[3],
			author: {
				username: e.author.name.substring(0,e.author.name-2),
			},
			content: e.description.substring(e.indexOf(")"), e.description.length)
		};}
	if (message.id === "1099648298723332176") console.log(message)
	return message;
}
export default {
	settings,
	onLoad: function () {
		this.onUnload = vendetta.patcher.before(
			"dispatch",
			vendetta.metro.common.FluxDispatcher,
			([event]) => {
				if (event.type === "LOAD_MESSAGES_SUCCESS") {
					event.messages = event.messages.map(transformMessagePK);
					return [event];
				} else if (event.type === "MESSAGE_CREATE") {
					if (event.optimistic) return;
					event.message = transformMessagePK(event.message);
					return [event];
				}
			}
		);
	},
};
