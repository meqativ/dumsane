
import settings from "./settings.jsx";
const {
	plugin: { storage },
} = vendetta;
let statuses = {};
/*
 * message_id: <0|1>
 * 0 - received
 * 1 - dismissed
 */
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
					if (me || window?.debugpls) console.log("[NoDelete › before]", args);

				if (event.type === "MESSAGE_DELETE") {
					if (typeof statuses[event.id] === "undefined") {
						let message = "This message was deleted";
						if (storage["timestamps"])
							message += ` (${vendetta.metro.common
								.moment(new Date())
								.toLocaleString()})`;

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
						statuses[event.id] = 0;
					if (me || window?.debugpls) console.log("[NoDelete › after]", {status: statuses[event.id], args});
					} else if (statuses[event.id] === 0) {
						statuses[event.id] = 1;
						return []
					} else if (statuses[event.id] === 1) {
						delete statuses[event.id];
					}

					return args;
				}
			}
		);
	},
};

export default plugin;
