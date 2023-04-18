const { React, ReactNative } = vendetta.metro.common;
const {
	plugin: { storage },
	storage: { useProxy },
	ui: {
		components: { Forms },
	},
} = vendetta;
if (!("test" in storage)) storage["test"] = "";

const Button = vendetta.metro.findByProps(
	"ButtonColors",
	"ButtonLooks",
	"ButtonSizes"
).default;
const { FormSection, FormInput, FormRow, FormSwitch, FormText } = Forms;

export default (props) => {
	useProxy(storage);

	const buttonStyle = {
		paddingTop: 5,
		paddingBottom: 5,
		marginBottom: 15,
		marginTop: 15,
	};

	return (
		<ReactNative.ScrollView>
			<Button
				style={buttonStyle}
				text="hey"
				color="brand"
				size="small"
				disabled={false}
				onPress={(h) => alert(storage["test"])}
			/>
			<FormInput
				title={"storage[\"test\"]"}
				value={storage["test"]}
				placeholder="useless placeholder"
				onChange={(v) => (storage["test"] = v)}
				multiline={true}
			/>
		</ReactNative.ScrollView>
	);
};
