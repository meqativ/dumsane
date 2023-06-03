import settings from "./settings.jsx";
import { FluxDispatcher, moment } from "@vendetta/metro/common";
import { storage } from "@vendetta/plugin";
import { before as patchBefore } from "@vendetta/patcher";

let deleteable = [];

export default {
	settings,
	onLoad() {
		try {
			plugin.onUnload = patchBefore(
				"dispatch",
				FluxDispatcher,
				(args) => {
					const event = args[0];
					if (!event) return;

					if (event?.type === "MESSAGE_DELETE") {
						if (!event?.id || !event?.channelId)
						if (deleteable.includes(event?.id)) {
							deleteable.slice(deleteable.indexOf(event.id),0);
							return args;
						}
						deleteable.push(event.id);

						let message = storage["message"]?.trim?.() || "This message was deleted";
						if (storage["timestamps"])
							message += ` (${moment()
								.format(storage["ew"] ? "hh:mm:ss.SS a" : "HH:mm:ss.SS")})`;
						args[0] =
							{
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
						return args;
					}
				}
			);
		} catch (e) {
			alert("NoDelete died\n"+e.stack);
			console.error(e);
		}
	},
};

