import settings from "./settings.jsx";
import { FluxDispatcher, moment } from "@vendetta/metro/common";
import { storage } from "@vendetta/plugin";
import { before as patchBefore } from "@vendetta/patcher";
import { findByProps, findByStoreName } from "@vendetta/metro";
let MessageStore,
	deleteable = [];

export default {
	settings,
	patches: [
		/*()=>deleteable=[]*/
	],
	onUnload() {
		this.patches.forEach((up) => up()); // unpatch every patch
		this.patches = [];
	},
	onLoad() {
		try {
			this.patches.push(
				patchBefore("dispatch", FluxDispatcher, (args) => {
					try {
						if (!MessageStore) MessageStore = findByStoreName("MessageStore");
						const event = args[0];

						if (!event || event?.type !== "MESSAGE_DELETE") return;
						if (!event?.id || !event?.channelId) return;

						const message = MessageStore.getMessage(event.channelId, event.id);

						if (storage["ignore"]["users"].includes(message?.author?.id))
							return;
						if (storage["ignore"]["bots"] && message?.author?.bot) return;

						if (deleteable.includes(event.id)) {
							deleteable.splice(deleteable.indexOf(event.id), 1);
							return args;
						}
						deleteable.push(event.id);


						let automodMessage =
							storage["message"] || "This message was deleted";
						if (storage["timestamps"])
							automodMessage += ` (${moment().format(
								storage["ew"] ? "hh:mm:ss.SS a" : "HH:mm:ss.SS"
							)})`;

						// overwrite the message delete event with the automod edit fail one
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
								message: automodMessage,
							},
						};
						return args;
					} catch (e) {
						console.error(e);
						alert("[Nodelete → patch] died\n" + e.stack);
					}
				})
			);
		} catch (e) {
			console.error(e);
			alert("[NoDelete] dead\n" + e.stack);
		}
	},
};
