const { React, ReactNative } = vendetta.metro.common;
const {
	plugin: { storage },
	storage: { useProxy },
	ui: {
		alerts: { showInputAlert },
		toasts: { showToast },
		components: { Forms },
		assets: { getAssetIDByName: getAsset }
	},
} = vendetta;
if (true || !("schemes" in storage)) storage["schemes"] = [];

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
		margin: 8,
	};

	return (
			<>
		<Button
				style={buttonStyle}
				text="hey"
				color="brand"
				size="small"
				disabled={false}
				onPress={(elem) => showInputAlert({
title: "New scheme",
            initialValue: "",
            placeholder: "Name",
            onConfirm: (name) => {
							schemes.push(name); 
							showToast(`Created ${name}`, getAsset("check"))
							alert(JSON.stringify(storage["schemes"]))
						},
            confirmText: "Create",
            confirmColor: undefined,
            cancelText: "Cancel"
				})}
			/>
		 <ReactNative.ScrollView>
		</ReactNative.ScrollView>
		</>
	);
};
