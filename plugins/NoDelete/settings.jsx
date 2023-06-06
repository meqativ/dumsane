import { React, ReactNative } from "@vendetta/metro/common";
import { storage } from "@vendetta/plugin";
import { useProxy } from "@vendetta/storage";
import { Forms } from "@vendetta/ui/components";

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
			{[
				{
					type: "switch",
					label: "Show the time of deletion",
					setting: storage["timestamps"],
					onChange(value) {
						return (this.setting = value);
					},
				},
				{
					type: "switch",
					label: "Use AM/PM",
					setting: storage["ew"],
					onChange(value) {
						return (this.setting = value);
					},
				},
				{ type: "separator" },
				{
					type: "switch",
					label: "Ignore bots",
					setting: storage["ignore"]["bots"],
					onChange(value) {
						return (this.setting = value);
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
							trailing={
								<Forms.FormSwitch
									value={config.setting}
									onValueChange={config.onChange}
								/>
							}
						/>
					);
				} else if (config.type === "text") {
					return <Forms.FormLabel label={config.label} />;
				} else if (config.type === "separator") {
					return <Forms.FormDivider />;
				}
			})}
		</ReactNative.ScrollView>
	);
};
