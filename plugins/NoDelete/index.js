import settings from "./settings.jsx";
import { FluxDispatcher, moment } from "@vendetta/metro/common";
import { storage } from "@vendetta/plugin";
import { before as patchBefore } from "@vendetta/patcher";
import { findByProps, findByStoreName } from "@vendetta/metro";
let MessageStore;
//,deleteable = [];
export default {
	settings,
	onLoad() {
		storage["ignore"]["users"] = ["571661221854707713"];
		try {
			this.onUnload = patchBefore("dispatch", FluxDispatcher, (args) => {
				try {
				if (!MessageStore) MessageStore = findByStoreName("MessageStore");
				const event = args[0];
				if (!event) return;
				if (event?.type === "MESSAGE_DELETE") {
					if (!("guildId" in event)) return;

					if (!event?.id || !event?.channelId) return;
					const message = MessageStore.getMessage(event.channelId, event.id);
					console.log(message, event);
					if (storage["ignore"]["users"].includes(message?.author?.id)) return;
					if (storage["ignore"]["bots"] && message?.author?.bot) return;
					/*if (deleteable.includes(event.id)) {
						deleteable.splice(deleteable.indexOf(event.id), 1);
						return args;
					}
					deleteable.push(event.id);//*/
					let redText = storage["onlyTimestamp"]
						? ""
						: storage["message"]?.trim?.() || "This message was deleted";
					if (storage["timestamps"] || storage["onlyTimestamp"])
						redText += ` (${moment().format(
							storage["ew"] ? "hh:mm:ss.SS a" : "HH:mm:ss.SS"
						)})`;
					console.log("meow", { redText, event });
					const update = [{
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
							message: redText,
						},
					}];
					console.log(update)
					return update;
				}
				} catch (e) {
					console.error(e);
					alert(e.stack)
				}
			});
		} catch (e) {
			alert("NoDelete died\n" + e.stack);
			console.error(e);
		}
	},
};
