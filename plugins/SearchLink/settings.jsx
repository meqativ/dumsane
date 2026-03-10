import { ReactNative } from "@vendetta/metro/common";
import { storage } from "@vendetta/plugin";
import { useProxy } from "@vendetta/storage";
import SettingsBuilder from "../../common/ui/SettingsBuilder";
import { getService, getServiceNames } from "./storage.js";

export default function Settings() {
	useProxy(storage);
	return (
		<ReactNative.ScrollView style={{ flex: 1 }}>
			<SettingsBuilder
				config={[
					{
						label: "Search service (engine) to use by default",
						type: "select_one",
						storage_path: "settings.defaults.engine",
						choices: Object.keys(getServiceNames(storage)).map(
							serviceName => {
								const service = getService(storage,serviceName);
								if (!service) return undefined;	
								return ({
									name: service.name,
									value: serviceName
								})
							}
						).filter(Boolean)
					},
					{
						label: "Send the link as an actual message",
						type: "number",
						storage_path: "settings.defaults.send",
					}
				]}
				storage={storage}
			/>
		</ReactNative.ScrollView>
	);
}
