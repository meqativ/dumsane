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
				{ label: "Fetch message (recommended)", default: true, id: "fetch_msg" },
			].map((config) => {
				if (!(config.id in storage)) storage[config.id] = config.default;
				return (
					<FormRow
						label={config.label}
						trailing={
							("id" in config) ? (<FormSwitch
								value={storage[config.id]}
								onValueChange={(value) => (storage[config.id] = value)}
							/>) : undefined
						}
					/>
				);
			})}
		</ReactNative.ScrollView>
	);
};
