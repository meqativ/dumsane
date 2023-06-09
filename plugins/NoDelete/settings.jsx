import { React, ReactNative } from "@vendetta/metro/common";
import { storage } from "@vendetta/plugin";
import { useProxy } from "@vendetta/storage";
import { showToast } from "@vendetta/metro/common/toasts";
import { Forms } from "@vendetta/ui/components";
import { getAssetIDByName } from "@ui/assets";

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
			<Forms.FormSection title="Settings" titleStyleType="no_border">
				{[
					{
						type: "switch",
						label: "Show the time of deletion",
						setting: storage["timestamps"],
						onChange(value) {
							return (storage["timestamps"] = value);
						},
					},
					{
						type: "switch",
						label: "Use AM/PM",
						setting: storage["ew"],
						onChange(value) {
							return (storage["ew"] = value);
						},
					},
					{ type: "separator" },
					{
						type: "switch",
						label: "Ignore bots",
						setting: storage["ignore"]["bots"],
						onChange(value) {
							return (storage["ignore"]["bots"] = value);
						},
					},
					{
						type: "text",
						label: "The plugin does not keep the messages you've deleted",
					},
				].map((config) => {
					if (config.type === "switch") {
						return (
							<Forms.FormRow
								label={config.label}
								trailing={<Forms.FormSwitch value={config.setting} onValueChange={config.onChange} />}
							/>
						);
					} else if (config.type === "text") {
						return <Forms.FormLabel label={config.label} />;
					} else if (config.type === "separator") {
						return <Forms.FormDivider />;
					}
				})}
			</Forms.FormSection>
			<Forms.FormSection title="Filters" titleStyleType="no_border">
				<FormRow
					label={`Clear user ignore list ${storage["ignore"]["users"].length}`}
					trailing={<FormRow.Icon source={getAssetIDByName("ic_trash_24px")} />}
					onPress={() => {
						storage["ignore"]["users"] = [];
						showToast("Successfully cleared");
					}}
				/>
			</Forms.FormSection>
		</ReactNative.ScrollView>
	);
};
