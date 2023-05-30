import settings from "./settings.jsx";
let deleteable = [];

const plugin = {
	settings,
	onLoad() {
		try {
			const {
				plugin: { storage },
			} = vendetta;
			const plugin = this;
			const { FluxDispatcher } = vendetta.metro.common;
			const getCurrentUser =
				vendetta.metro.findByStoreName("UserStore").getCurrentUser;

			this?.onUnload?.();
			let currentUser = getCurrentUser();
			if (!currentUser) {
				FluxDispatcher.subscribe("CONNECTION_OPEN", run);
			} else {
				this.run("meow");
			}
			function run(unsub) {
				try {
					if (unsub !== "meow") FluxDispatcher.unsubscribe(run);
					if (!currentUser) currentUser = getCurrentUser();

					const me = currentUser.id === "744276454946242723";

					plugin.onUnload = vendetta.patcher.before(
						"dispatch",
						vendetta.metro.common.FluxDispatcher,
						(args) => {
							const log =
								window?.debugpls === true ||
								(me === true && window?.debugpls !== false);

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
										.moment()
										.format(storage["ew"] ? "hh:mm:ss.SS a" : "HH:mm:ss.SS")})`;
								if (log) console.log("[NoDelete › before]", args);
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
								if (log) console.log("[NoDelete › after]", args);
								return args;
							}
						}
					);
				} catch (e) {
					alert(e.stack);
					console.error(e);
				}
			}
		} catch (e) {
			alert(e.stack);
			console.error(e);
		}
	},
};

export default plugin;
