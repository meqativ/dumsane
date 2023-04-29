const { React, ReactNative } = vendetta.metro.common;
const {
	plugin: { storage },
	storage: { useProxy },
	ui: {
		components: { Forms },
	},
} = vendetta;
if (!("timestamps" in storage)) storage["timestamps"] = false;

const { FormRow, FormSwitch } = Forms;

export default () => {
	useProxy(storage);
	return (
		<ReactNative.ScrollView style={{ flex: 1 }}>
			{[
				{ label: "Show the time of deletion", default: false, id: "timestamps" },
				{ label: "Use AM/PM", default: false, id: "dateformat" },
				{ label: "The plugin does not keep the messages you've deleted", },
			].map((config) => {
				return (
					<FormRow
						label={config.label}
						trailing={
							("id" in config) ? (<FormSwitch
								value={storage[config.id] ?? config.default}
								onValueChange={(value) => (storage[config.id] = value)}
							/>) : undefined
						}
					/>
				);
			})}
		</ReactNative.ScrollView>
	);
};
