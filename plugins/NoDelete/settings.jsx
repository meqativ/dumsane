import { React, ReactNative } from "@vendetta/metro/common";
import { storage } from "@vendetta/plugin";
import { useProxy } from "@vendetta/storage";
import { showToast } from "@vendetta/metro/common/toasts"
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
					label={`Clear user ignore list (${storage["ignore"]["users"].length})`}
					trailing={<Forms.FormRow.Icon source={getAssetIDByName("ic_trash_24px")} />}
					onPress={() => {
						let success;
						try {
							const ignore = storage?.["ignore"];

							if (ignore && typeof ignore["users"] !== "undefined" && ignore["users"].length !== 0) {
								ignore["users"] = [];
								success = true;
							}
						} catch (e) {
							console.error(e);
							return alert("[NoDelete › clear user ignore list] failed\n" + e.stack);
						}
						if (success) showToast("Successfully cleared");
					}}
				/>
			</Forms.FormSection>
		</ReactNative.ScrollView>
	);
};
