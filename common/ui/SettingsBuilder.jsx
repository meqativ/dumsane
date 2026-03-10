import { ReactNative } from "@vendetta/metro/common";
import { Forms, Button } from "@vendetta/ui/components";
import { getValueAtPath, setValueAtPath } from "../../common";

const { FormRow, FormSwitch } = Forms;

export default function SettingsBuilder({ config, storage }) {
	return config.map((item, index) => {
		const key = item?.storage_path ?? item?.label ?? item?.id ?? index;

		if (item?.type === "button") {
			return (
				<Button
					key={key}
					style={item?.style ?? undefined}
					text={item?.label ?? "Unnamed"}
					color="brand"
					size="small"
					disabled={false}
					onPress={item?.onPress ?? (() => {})}
				/>
			);
		}

		if (item?.type === "spacer") {
			return <ReactNative.View key={key} style={item?.style} />;
		}

		// TODO: steal proper number input from somewhere (i want a slider)
		if (["number", "toggle"].includes(item?.type)) {
			return (
				<FormRow
					key={key}
					label={item?.label ?? item?.storage_path ?? "Unnamed"}
					style={item?.style ?? undefined}
					trailing={
						"storage_path" in item ? (
							<FormSwitch
								value={getValueAtPath(storage, item.storage_path)}
								onValueChange={(value) => {
									console.log(
										`changing to ${value}, current: ${getValueAtPath(
											storage,
											item.storage_path,
										)}`,
									);
									setValueAtPath(storage, item.storage_path, value);
									item?.onValueChange?.(value);
								}}
							/>
						) : undefined
					}
				/>
			);
		}

		return (
			<FormRow
				key={key}
				label={`${item?.label ?? item?.id ?? "no name"}(unknown type of config entry)`}
				style={item?.style ?? undefined}
			/>
		);
	});
}
