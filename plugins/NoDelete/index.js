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

				if (event.type === "MESSAGE_DELETE") {
					if (me || window?.debugpls) console.log("[NoDelete › before]", args);
					if (!statuses[event.id]) {
						let message = "This message was deleted";
						if (storage["timestamps"])
							message += ` (${vendetta.metro.common
								.moment().format("HH:mm:ss.SS")})`;
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
						statuses[event.id] = {
							event: argss[0],
							flag: 1,
						};
						if (me || window?.debugpls)
							console.log("[NoDelete › after]", {
								status: statuses[event.id],
								args,
							});
						return args;
					}

					// received another delete event for the same message
					// happens when you delete a message or when you press dismiss
					const status = statuses[event.id];
					if (status.flag === 1) {
						status.flag = 2;
						return;
					}
					if (status.flag === 2) {
						console.log("[NoDelete › actually]", { status });
						delete statuses[event.id];
						return args;
					}
				}
			}
		);
	},
};

export default plugin;
