import { findByProps } from "@vendetta/metro";
import { before } from "@vendetta/patcher";
import { showToast } from "@vendetta/ui/toasts";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { showConfirmationAlert } from "@vendetta/ui/alerts";
import { _chosenLocale, Messages } from "@vendetta/metro/common/i18n";
const ActionSheet = findByProps("hideActionSheet");
const installPlugin = {
	"en-GB": "Install as a Plugin",
	uk: "Встановити як Плагін",
	ru: "Установить как Плагин",
};
export default {
	onLoad() {
		this.onUnload = before("openLazy", ActionSheet, (args) => {
			if (args[1] !== "LongPressUrl") return;
			const {
				header: { title: url },
				options,
			} = args[2];

			if (url.endsWith(".json") || url.endsWith(".json/") || url.includes("vd-plugins.github.io/proxy")) return;
			let id = url;
			if (!id.endsWith("/")) id += "/";
			const plugins = vendetta.plugins.plugins;

			options.push({
				label: installPlugin[_chosenLocale] ?? installPlugin["en-GB"],
				onPress: () =>
					vendetta.plugins
						.installPlugin(id)
						.then(() => {
							if (!plugins[id]) return;
							showToast(plugins[id].manifest.name, getAssetIDByName("Check"));
							showConfirmationAlert({
								title: plugins[id].manifest.name,
								confirmText: Messages.ENABLE,
								cancelText: Messages.CANCEL,
								confirmColor: "brand",
								onConfirm: () => {
									try {
										vendetta.plugins.startPlugin(id);
										showToast(plugins[id].manifest.name, getAssetIDByName("ic_activity_24px"));
									} catch (e) {
										console.log(e.stack);
										alert(e.stack);
										showToast(id, getAssetIDByName("Small"));
									}
								},
							});
						})
						.catch((e) => {
							showToast(e.message, getAssetIDByName("Small"));
						}),
			});

			return args;
		});
	},
};
