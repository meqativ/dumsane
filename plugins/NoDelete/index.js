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
		args[0] = {
			type: "MESSAGE_EDIT_FAILED_AUTOMOD",
			messageData: {
				type: 1,
				message: {
					channelId: dispatched.channelId,
					messageId: dispatched.id,
				},
			},
			errorResponseBody: {
				code: 200000,
				message: `This message was deleted.`,
			},
		};
		return args;
	}
});

export default plugin;
