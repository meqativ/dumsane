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
	//	<ReactNative.ScrollView style={{ flex: 1 }}>
				<FormRow
					label="Show the time of deletion"
					leading={
						<FormSwitch
							value={storage["timestamps"] ?? false}
							onValueChange={(value) => storage["timestamps"] = value}
						/>
					}
				/>
	//	</ReactNative.ScrollView>
	);
};
