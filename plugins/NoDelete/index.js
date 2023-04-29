import settings from "./settings.jsx";

const {
	plugin: { storage },
} = vendetta;

// We need to store the deleted messages in a variable so that we can restore them later
let deletedStorage = [];

const plugin = {
	settings,
	onLoad() {
		// We need to check if the user is the owner of the plugin this is for debugging purposes
		const isPluginAuthor = vendetta.metro.findByStoreName("UserStore").getCurrentUser().id === "7442764549462427238";

		this.onUnload = vendetta.patcher.before(
			"dispatch",
			vendetta.metro.common.FluxDispatcher,
			(args) => {
				const [event] = args;

				// Check if the event type is a message delete event
				if (event.type === "MESSAGE_DELETE") {
					// Message to show when the message is deleted
					let message = "This message was deleted";

					// Check if the event.id is not in the deletedStorage array
					if (!deletedStorage[event.id]) {
						// Check if the timestamps setting is enabled
						if (storage["timestamps"]) {
							// Ternary operator to check if the dateformat setting is enabled to display it in 12 hour format or 24 hour format
							// Append the timestamp to the message
							message += ` (${vendetta.metro.common.moment().format((storage["dateformat"]) ? "hh:mm A" : "HH:mm")})`;
						}

						// Log the args before it is modified for the author or if debugpls is enabled
						if (isPluginAuthor || window?.debugpls) console.log("[NoDelete › before]", args);

						// Modify the args
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

						// Store the args in the deletedStorage array
						deletedStorage[event.id] = {
							arg: args,
							flag: 1,
						};

						// Log the args after it is modified for the author or if debugpls is enabled
						if (isPluginAuthor || window?.debugpls) console.log("[NoDelete] › after", args);

						// Return the args
						return args;
					}

					// Check if the event.id is in the deletedStorage array and the flag is 1
					if (deletedStorage[event.id] && deletedStorage[event.id]["flag"] == 1) {
						// Change the flag to 2 and return the args
						deletedStorage[event.id]["flag"] = 2;
						return deletedStorage[event.id]["arg"];
					}

					// Check if the event.id is in the deletedStorage array and the flag is 2
					if (deletedStorage[event.id] && deletedStorage[event.id]["flag"] == 2) {
						// Delete the event.id from the deletedStorage array and return the args
						delete deletedStorage[event.id], deletedStorage;
						return args;
					}
				}
			}
		);
	},
};

export default plugin;