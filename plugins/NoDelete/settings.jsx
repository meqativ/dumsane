import { React, ReactNative } from "@vendetta/metro/common";
import { storage } from "@vendetta/plugin";
import { useProxy } from "@vendetta/storage";
import { showConfirmationAlert } from "@vendetta/ui/alerts";
import { Forms } from "@vendetta/ui/components";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { getTranslation } from "./translations.js";
// make sure settings exist
storage["ignore"] ??= {
	users: [],
	bots: false,
};
storage["timestamps"] ??= false;
storage["onlyTimestamps"] ??= false;
storage["ew"] ??= false; // AM/PM

export default (props) => {
	useProxy(storage);
	return (
		<ReactNative.ScrollView style={{ flex: 1 }}>
			<Forms.FormSection title={getTranslation("settings.titles.settings")} titleStyleType="no_border">
				<Forms.FormRow
					label={getTranslation("settings.showTimestamps")}
					trailing={
						<Forms.FormSwitch value={storage["timestamps"]} onValueChange={(v) => (storage["timestamps"] = v)} />
					}
				/>
				<Forms.FormRow
					label={getTranslation("settings.ewTimestampFormat")}
					trailing={<Forms.FormSwitch value={storage["ew"]} onValueChange={(v) => (storage["ew"] = v)} />}
				/>
				<Forms.FormDivider />
				<Forms.FormRow
					label={
						getTranslation("settings.youDeletedItWarning")
					}
				/>
			</Forms.FormSection>
			<Forms.FormSection title={getTranslation("settings.titles.filters")}>
				<Forms.FormRow
					label={getTranslation("settings.ignoreBots")}
					trailing={
						<Forms.FormSwitch
							value={storage["ignore"]["bots"]}
							onValueChange={(value) => (storage["ignore"]["bots"] = value)}
						/>
					}
				/>
				<Forms.FormRow
					label={
						getTranslation("settings.clearUsersLabel", true)?.make?.(storage["ignore"]["users"].length) 
					}
					trailing={<Forms.FormRow.Icon source={getAssetIDByName("ic_trash_24px")} />}
					onPress={() => {
						const ignore = storage["ignore"];
						if (ignore["users"].length !== 0)
							showConfirmationAlert({
								title: getTranslation("settings.confirmClear.title"),
								content:
									getTranslation("settings.confirmClear.description", true)?.make?.(ignore["users"].length),
								confirmText: getTranslation("settings.confirmClear.yes"),
								cancelText: getTranslation("settings.confirmClear.no"),
								confirmColor: "brand",
								onConfirm: () => {
									ignore["users"] = [];
								},
							});
					}}
				/>
				<Forms.FormDivider />
				<Forms.FormRow
					label={
						getTranslation("settings.addUsersInfo")
					}
				/>
			</Forms.FormSection>
		</ReactNative.ScrollView>
	);
};
