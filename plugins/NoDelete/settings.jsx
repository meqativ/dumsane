const { React, ReactNative } = vendetta.metro.common;
const {
	plugin: { storage },
	storage: { useProxy },
	ui: {
		components: { Forms },
	},
} = vendetta;

const { FormRow, FormSection, FormSwitch } = Forms;

export default (props) => {
	useProxy(storage);
	return (
		<ReactNative.ScrollView style={{ flex: 1 }}>
			{[
				{ label: "Show the time of deletion", default: false, id: "timestamps" },
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
