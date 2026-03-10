import { reloadUwuifier } from "./uwuifier";
import { ReactNative } from "@vendetta/metro/common";
import { storage } from "@vendetta/plugin";
import { useProxy } from "@vendetta/storage";
import { Forms } from "@vendetta/ui/components";
const { FormRow, FormSwitch } = Forms;
import { Button } from "@vendetta/ui/components";
import { getValueAtPath, setValueAtPath } from "../../common";

export default function Settings() {
	useProxy(storage);
	return (
		<ReactNative.ScrollView style={{ flex: 1 }}>
			{[
				{
					label: "Add faces",
					type: "number",
					storage_path: "settings.uwuifier.spaces.faces",
				},
				{
					label: "Add actions",
					type: "number",
					storage_path: "settings.uwuifier.spaces.actions",
				},
				{
					label: "Add stutters",
					type: "number",
					storage_path: "settings.uwuifier.spaces.stutters",
				},
				{
					label: "Add words",
					type: "number",
					storage_path: "settings.uwuifier.words",
				},
				{
					label: "Add exclamations",
					type: "number",
					storage_path: "settings.uwuifier.exclamations",
				},
				{
					type: "button",
					style: { height: 5, margin: 8 },
					label: "Reload uwuifier (press this after toggling options above)",
					onPress: () => {
						reloadUwuifier(storage);
						vendetta.ui.toasts.showToast(
							`Reloaded uwuifier`,
							vendetta.ui.assets.getAssetIDByName("check"),
						);
					},
				},
				{
					type: "spacer",
					style: {height:5}
				},
				{
					label: "Convert message before sending",
					type: "toggle",
					storage_path: "settings.convert_messages",
				},
			].map((config) => {
				if (config?.type === "button") {
					return (
						<Button
							style={config?.style ?? undefined}
							text={config?.label ?? "Unnamed"}
							color="brand"
							size="small"
							disabled={false}
							onPress={config?.onPress ?? (() => {})}
						/>
					);
				}
				//TODO: steal proper number input from somewhere (i want a slider)
				if (["number", "toggle"].includes(config?.type)) {
					return (
						<FormRow
							label={config?.label ?? config?.storage_path ?? "Unnamed"}
							style={config?.style ?? undefined}
							trailing={
								"storage_path" in config ? (
									<FormSwitch
										value={getValueAtPath(storage, config.storage_path)}
										onValueChange={(value) => {
											console.log(`changing to ${value}, current: ${getValueAtPath(storage, config.storage_path)}`)
											setValueAtPath(storage, config.storage_path, value)
											config?.onValueChange?.(value);
										}}
									/>
								) : undefined
							}
						/>
					);
				}
				return (
					<FormRow
						label={`${config?.label ?? config?.id ?? "no name"}(unknown type of config entry)`}
						style={config?.style ?? undefined}
					/>
				);
			})}
		</ReactNative.ScrollView>
	);
}
