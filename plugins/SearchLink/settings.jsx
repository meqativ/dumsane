import { ReactNative } from "@vendetta/metro/common";
import { storage } from "@vendetta/plugin";
import { useProxy } from "@vendetta/storage";
import { getService, getServiceNames } from "./storage.js";
import renderSimpleSettings from "../../common/ui/SettingsBuilder.jsx";

export default function Settings() {
	useProxy(storage);
	return (
		<ReactNative.ScrollView style={{ flex: 1 }}>
			{renderSimpleSettings(storage, [
				{
					label: "Search service (engine) to use by default",
					type: "select_one",
					storage_path: "settings.defaults.engine",
					choices: getServiceNames(storage)
						.map((serviceName) => {
							const service = getService(storage, serviceName);
							if (!service) return undefined;
							return {
								name: service.name,
								value: serviceName,
							};
						})
						.filter(Boolean),
				},
				{
					label: "Send the link as an actual message",
					type: "number",
					storage_path: "settings.defaults.send",
				},
			])}
		</ReactNative.ScrollView>
	);
}
