import settings from "./settings.jsx";
import * as common from "../../common";
import { FluxDispatcher, moment } from "@vendetta/metro/common";
import { storage } from "@vendetta/plugin";
import { before as patchBefore } from "@vendetta/patcher";
import { findByProps, findByStoreName } from "@vendetta/metro";
import { findInReactTree } from "@vendetta/utils";
import { showToast } from "@vendetta/ui/toasts";
import { getTranslation, massive } from "./translations.js";
//import { dispatcherPatch } from "./patches/dispatcher.js";
//import { contextMenuPatch } from "./patches/contextMenu.js"

common.makeDefaults(storage, {
	ignore: {
		users: [],
		channels: [],
		bots: false,
	},
	timestamps: false,
	ew: false,
	onlyTimestamps: false,
});
let MessageStore,
	deleteable = [];


export default {
	settings,
	patches: [
		//()=>deleteable=[]
	],
	onUnload() {
		this.patches.forEach((up) => up()); // unpatch every patch
		this.patches = [];
	},
	onLoad() {
		//		this.patches.push(
		//			dispatcherPatch(),
		//			contextMenuPatch()
		//		);

		try {
			this.patches.push(
				patchBefore("dispatch", FluxDispatcher, (args) => {
					try {
						if (!MessageStore) MessageStore = findByStoreName("MessageStore");
						const event = args[0];

						if (!event || event?.type !== "MESSAGE_DELETE") return;
						if (!event?.id || !event?.channelId) return;

						const message = MessageStore.getMessage(event.channelId, event.id);

						if (storage["ignore"]["users"].includes(message?.author?.id)) return;
						if (storage["ignore"]["bots"] && message?.author?.bot) return;

						if (deleteable.includes(event.id)) {
							deleteable.splice(deleteable.indexOf(event.id), 1);
							return args;
						}
						deleteable.push(event.id);

						let automodMessage = getTranslation("thisMessageWasDeleted");
						if (storage["timestamps"]) automodMessage += ` (${moment().format(storage["ew"] ? "hh:mm:ss.SS a" : "HH:mm:ss.SS")})`;

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

			/* thanks fres#2400 (<@843448897737064448>) for example patch
			 * add ignore user button
			 */
			const contextMenuUnpatch = patchBefore("render", findByProps("ScrollView").View, (args) => {
				try {
					let a = findInReactTree(args, (r) => r.key === ".$UserProfileOverflow");
					if (!a || !a.props || a.props.sheetKey !== "UserProfileOverflow") return;
					const props = a.props.content.props;
					const _labels = massive.optionLabels.map(Object.values).flat();
					if (props.options.some((option) => _labels.includes(option?.label))) return;

					const focusedUserId = Object.keys(a._owner.stateNode._keyChildMapping)
						.find((str) => a._owner.stateNode._keyChildMapping[str] && str.match(/(?<=\$UserProfile)\d+/))
						?.slice?.(".$UserProfile".length);

					let optionPosition = props.options.findLastIndex((option) => option.isDestructive);
					if (!storage["ignore"]["users"].includes(focusedUserId)) {
						props.options.splice(optionPosition + 1, 0, {
							isDestructive: true,
							label: getTranslation("optionLabels.0"), // START IGNORING
							onPress: () => {
								storage["ignore"]["users"].push(focusedUserId);
								showToast(getTranslation("toastLabels.0").replaceAll("${user}", props.header.title));

								props.hideActionSheet();
							},
						});
					} else {
						props.options.splice(optionPosition + 1, 0, {
							label: getTranslation("optionLabels.1"), // STOP IGNORING
							onPress: () => {
								storage["ignore"]["users"].splice(
									storage["ignore"]["users"].findIndex((userId) => userId === focusedUserId),
									1
								);
								showToast(getTranslation("toastLabels.1").replaceAll("${user}", props.header.title));

								props.hideActionSheet();
							},
						});
					}
				} catch (e) {
					console.error(e);
					let successful = false;
					try {
						successful = contextMenuUnpatch();
					} catch (e) {
						successful = false;
					}
					alert(`[NoDelete → context menu patch] failed. Patch ${successful ? "dis" : "en"}abled\n` + e.stack);
				}
			});
			this.patches.push(contextMenuUnpatch);
		} catch (e) {
			console.error(e);
			alert("[NoDelete] dead\n" + e.stack);
		}
	},
};
