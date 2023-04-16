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
	console.log("[NoDelete]", props)
	return (
		<ReactNative.ScrollView style={{ flex: true }}>
			<FormSection title="NoDelete settings">
				<FormRow
					label="Time of deletion"
					trailing={
						<FormSwitch
							value={storage["timestamps"] ?? false}
							onValueChange={(value) => (storage["timestamps"] = value)}
						/>
					}
				/>
				<FormRow
					label="Use emojis"
					trailing={
						<FormSwitch
							value={storage["emojis"] ?? false}
							onValueChange={(value) => (storage["emojis"] = value)}
						/>
					}
				/>
			</FormSection>
		</ReactNative.ScrollView>
	);
};
