
import settings from "./settings.jsx";
const {
	plugin: { storage },
} = vendetta;
let deleteable = []; // shitcode (idk how to do otherwise)

const plugin = {
	settings,
	onLoad() {
		const me =
			vendetta.metro.findByStoreName("UserStore").getCurrentUser().id ===
			"7442764549462427238";

		this.onUnload = vendetta.patcher.before(
			"dispatch",
			vendetta.metro.common.FluxDispatcher,
			(args) => {
				const [event] = args;

				if (event.type === "MESSAGE_DELETE") {
					if (deleteable.includes(event.id)) {
						delete deleteable[deleteable.indexOf(event.id)], args;
						return args;
					}
					deleteable.push(event.id);

					let message = "This message was deleted";
					if (storage["timestamps"])
						message += ` (${vendetta.metro.common
							.moment().format((storage["ew"])?"hh:mm:ss.SS a":"HH:mm:ss.SS")})`;
					if (me || window?.debugpls) console.log("[NoDelete › before]", args);
					args[0] = {
						type: "MESSAGE_EDIT_FAILED_AUTOMOD",
						messageData: {
							type: 1,
							message: {
								channelId: event.channelId,
								messageId: event.id,
							},
						},
						errorResponseBody: {
							code: 200000,
							message,
						},
					};
					if (me || window?.debugpls) console.log("[NoDelete] › after", args);
					return args;
				}
			}
		);
	},
};

export default plugin;
