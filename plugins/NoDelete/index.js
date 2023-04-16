import settings from "./settings.jsx";

const plugin = { settings };
const {	plugin: { storage }, patcher: { before } } = vendetta;

let deleteable = [] //shitcode (idk how to do otherwise)

plugin.onLoad = () => plugin.onUnload = before("dispatch", vendetta.metro.common.FluxDispatcher, (args) => {
	const [dispatched] = args;

	if (dispatched.type === "MESSAGE_DELETE") {
		if (deleteable.includes(dispatched.id)) return (delete deleteable[deleteable.indexOf(dispatched.id)], args);

		deleteable.push(dispatched.id); 
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
				message: (storage["emojis"]) ? "tha messg got delted 💀" : "This message was deleted." + (!storage["timestamps"]) ? "" : ` (${vendetta.metro.common.moment(new Date()).toLocaleString()})`,
			},
		};
		return args;
	}
});

export default plugin;
