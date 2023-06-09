import { React, ReactNative } from "@vendetta/metro/common";
import { storage } from "@vendetta/plugin";
import { useProxy } from "@vendetta/storage";
import { showConfirmationAlert } from "@vendetta/ui/alerts";
import { Forms } from "@vendetta/ui/components";
import { getAssetIDByName } from "@vendetta/ui/assets";

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
						label: "Show the time of deletion",
						setting: storage["timestamps"],
						onChange(value) {
							return (storage["timestamps"] = value);
						},
					},
					{
						label: "Use AM/PM",
						setting: storage["ew"],
						onChange(value) {
							return (storage["ew"] = value);
						},
					},
				].map((config) => {
					return (
						<Forms.FormRow
							label={config.label}
							trailing={<Forms.FormSwitch value={config.setting} onValueChange={config.onChange} />}
						/>
					);
				})}
				<Forms.FormLabel label={"The plugin does not keep the messages you've deleted"} />
			</Forms.FormSection>
			<Forms.FormSection title="Filters">
				<Forms.FormRow
					label={"Ignore bots"}
					trailing={
						<Forms.FormSwitch
							value={storage["ignore"]["bots"]}
							onValueChange={(value) => (storage["ignore"]["bots"] = value)}
						/>
					}
				/>
				<Forms.FormRow
					label={`You have ${storage["ignore"]["users"].length} user${
						storage["ignore"]["users"] === 1 ? "" : "s"
					} ignored`}
					trailing={<Forms.FormRow.Icon source={getAssetIDByName("ic_trash_24px")} />}
					onPress={() => {
						const ignore = storage?.["ignore"];
						if (ignore && typeof ignore["users"] !== "undefined" && ignore["users"].length !== 0)
							showConfirmationAlert({
								title: "Are you sure?",
								content: `This will clear all users (${ignore["users"].length}) you have added to the ignore list. Do you want to proceed?`,
								confirmText: "Yes",
								cancelText: "Cancel",
								confirmColor: "brand",
								onConfirm: () => {
									ignore["users"] = [];
								},
							});
					}}
				/>
			</Forms.FormSection>
		</ReactNative.ScrollView>
	);
};
