import { React, ReactNative } from "@vendetta/metro/common";
import { storage } from "@vendetta/plugin";
import { useProxy } from "@vendetta/storage";
import { Forms } from "@vendetta/ui/components";
if (!storage["ignore"]) storage["ignore"] = {
	users: [],
	bots: false
}
if (!("timestamps" in storage)) storage["timestamps"] = false;
if (!("onlyTimestamps" in storage)) storage["onlyTimestamps"] = false;
if (!("ew" in storage)) storage["ew"] = false; // AM/PM


export default (props) => {
	useProxy(storage);
	return (
		<ReactNative.ScrollView style={{ flex: 1 }}>
			{[
				{ type: "switch", label: "Show the time of deletion", propId: "timestamps" },
				{ type: "switch", label: "Use AM/PM", propId: "ew" },
				{ type: "separator" },
				{ type: "switch", label: "Ignore bots" },
				{ type: "text", label: "The plugin does not keep the messages you've deleted", },
			].map((config) => {
				if (config.type === "switch") return (
					<Forms.FormRow
						label={config.label}
						trailing={
							<Forms.FormSwitch
								value={storage[config.propId]}
								onValueChange={(value) => (storage[config.propId] = value)}
							/>
						}
					/>
				);
				if (config.type === "text") return (
					<Forms.FormLabel label={config.label} />
				);
				if (config.type === "separator") return (<Forms.FormDivider/>);
			})}
		</ReactNative.ScrollView>
	);
};
