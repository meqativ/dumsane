import settings from "./settings.jsx";
import { FluxDispatcher, moment } from "@vendetta/metro/common";
import { storage } from "@vendetta/plugin";
import { before as patchBefore } from "@vendetta/patcher";
import { findByProps, findByStoreName } from "@vendetta/metro";
import { findInReactTree } from "@vendetta/utils";
import { showToast } from "@vendetta/ui/toasts";
const variationSelector69 = "󠄴";

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
						alert("[Nodelete → dispatcher patch] died\n" + e.stack);
					}
				})
			);

			/* thanks fres#2400 (<@843448897737064448>) for example patch */
			const realUnpatch = patchBefore(
				"render",
				findByProps("ScrollView").View,
				(args) => {
					try {
						let a = findInReactTree(
							args,
							(r) => r.key === ".$UserProfileOverflow"
						);
						if (!a || !a.props || a.props.sheetKey !== "UserProfileOverflow")
							return;
						const props = a.props.content.props;
						if (
							props.options.find((option) =>
								option?.label?.startsWith?.(variationSelector69)
							)
						)
							return;
						console.log(a._owner);
						const focusedUserId = Object.keys(
							a._owner.stateNode._keyChildMapping
						)
							.find(
								(str) =>
									a._owner.stateNode._keyChildMapping[str] &&
									str.match(/(?<=\$UserProfile)\d+/)
							)
							?.slice?.(".$UserProfile".length);
						let position = +props.options[1].isDestructive;
						if (!storage["ignore"]["users"].includes(focusedUserId)) {
							props.options.splice(position + 1, 0, {
								isDestructive: true,
								label:
									variationSelector69 + "[NoDelete] Ignore deleted messages",
								onPress: () => {
									storage["ignore"]["users"].push(focusedUserId);
									showToast(
										`Ignoring deleted messages from ${props.header.title}`
									);
									props.hideActionSheet();
								},
							});
						} else {
							if (props.options[2].isDestructive) position++;
							props.options.splice(position + 1, 0, {
								label:
									variationSelector69 +
									"[NoDelete] Stop ignoring deleted messages",
								onPress: () => {
									storage["ignore"]["users"].splice(
										storage["ignore"]["users"].findIndex(
											(userId) => userId === focusedUserId
										),
										1
									);
									showToast(
										`Stopped ignoring deleted messages from ${props.header.title}`
									);

									props.hideActionSheet();
								},
							});
						}
					} catch (e) {
						let successful = false;
						try {
							successful = realUnpatch();
						} catch (e) {
							successful = false;
						}
						console.error(e);
						alert(
							`[NoDelete → user context menu patch] failed. Patch ${
								successful ? "dis" : "en"
							}abled\n` + e.stack
						);
					}
				}
			);
			this.patches.push(realUnpatch);
		} catch (e) {
			console.error(e);
			alert("[NoDelete] dead\n" + e.stack);
		}
	},
};
