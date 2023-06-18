import * as hlp from "../../helpers/index.js";
import { findByStoreName, findByProps } from "@vendetta/metro";
import { after as patchAfter } from "@vendetta/patcher";
import { showToast } from "@vendetta/ui/toasts";
import { storage } from "@vendetta/plugin";
let plugin = {}, RelationshipStore;

hlp.makeDefaults(storage, {
	blockedWebhooks: [{name: "Example", id: "0", avatarURL: "https://github.com/meqativ.png"}],
})
plugin = {
	meta: vendetta.plugin,
	patches: [],
	onUnload() {
		this.patches.forEach((up) => up()); // unpatch every patch
		this.patches = [];
	},
	onLoad() {
		try {
			RelationshipStore ??= findByStoreName("RelationshipStore");

			patchAfter("isBlocked", RelationshipStore, (args, result) => {
				if (storage.blockedWebhooks.some(webhook => webhook.id === args[0])) return true;
				return result
			})
			window.blockedWebhooks = storage.blockedWebhooks

		} catch (e) {
			console.error(e);
			console.log(e.stack);
			alert(`There was an error while loading the plugin "${plugin.meta.name}"\n${e.stack}`);
		}
	},
};

export default plugin;
