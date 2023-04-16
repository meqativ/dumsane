/*
{
	type: "MESSAGE_EDIT_FAILED_AUTOMOD",
	messageData: {
		type: 1,
		message: {
			channelId: "",
			messageId: "",
			content: "",
			allowed_mentions: undefined,
		},
	},
	errorResponseBody: {
		code: 200000,
		message: "",
	}, :wq
};

{
	type: "MESSAGE_DELETE",
	id: "",
	channelId: "",
};
*/
const plugin = {};
const {
	patcher: { before },
} = vendetta;

plugin.onLoad = () => plugin.onUnload = before("dispatch", vendetta.metro.common.FluxDispatcher, (args) => {
	const [dispatched] = args;
	if (dispatched.type === "MESSAGE_DELETE") {
		console.log("[ Vendetta › NoDelete ]", "🅰️ deleted msg", args)
		args[0] = {
			type: "MESSAGE_EDIT_FAILED_AUTOMOD",
			messageData: {
				type: 1,
				message: {
					channelId: dispatched.channelId,
					messageId: dispatched.id,
					content: "abob",
				},
			},
			errorResponseBody: {
				code: 200000,
				message: `This message was deleted. (it's showing what was before the edit)`,
			},
		};
		return args;
	}
});

export default plugin;
