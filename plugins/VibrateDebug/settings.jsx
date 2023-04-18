const { React, ReactNative } = vendetta.metro.common;
const {
	plugin: { storage },
	storage: { useProxy },
} = vendetta;
if (!("test" in storage)) storage["test"] = "";

const Button = vendetta.metro.findByProps(
	"ButtonColors",
	"ButtonLooks",
	"ButtonSizes"
).default;

export default (props) => {
	useProxy(storage);

	const buttonStyle = { margin: 2 };

	return (
		<ReactNative.ScrollView style={{ flex: 1 }}>
			<Button
				style={buttonStyle}
				text="hey"
				color="brand"
				size="big"
				disabled={false}
				onPress={(h) => console.log("pressed", h)}
			/>
			<vendetta.components.TextInput
				onChangeText={(v) => (storage["test"] = v)}
				value={""}
				placeholder="useless placeholder"
				keyboardType="numeric"
				multiline={true}
			/>
		</ReactNative.ScrollView>
	);
};
