const { React, ReactNative } = vendetta.metro.common;
const {
	plugin: { storage },
	storage: { useProxy },
	ui: {
		alerts: { showInputAlert },
		toasts: { showToast },
		components: { Forms },
		assets: { getAssetIDByName: getAsset },
		settings: {
			components: { Card },
		},
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
		//paddingTop: 5,
		height: 5,
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
				onPress={(elem) =>
					showInputAlert({
						title: "New scheme",
						initialValue: "",
						placeholder: "Name",
						onConfirm: (name) => {
							storage["schemes"].push({ name });
							showToast(`Created ${name}`, getAsset("check"));
							alert(JSON.stringify(storage["schemes"], 0, 4));
						},
						confirmText: "Create",
						confirmColor: undefined,
						cancelText: "Cancel",
					})
				}
			/>
			<ReactNative.ScrollView>
				{storage["schemes"].map((scheme, i) => {
					const h = {
						toggleValue, // true/false
						index,
						headerLabel,
						descriptionLabel,
						overflowActions, // ••• button actions array
						overflowTitle, // ••• popup title
						actions, // [{icon, onPress}] // icon: asset id
						headerIcon, //either react element or asset id
						toggleType, // "switch", if not uses RN.Pressable
						onToggleChange, // {?pressableState}
					};
					return (
						<Card
							index={i}
							headerLabel={scheme?.name}
							descriptionLabel={scheme?.description}
							headerIcon={"check"}
							toggleType={
								<Button
									style={buttonStyle}
									color="brand"
									text="Run"
									size="small"
									disabled={false}
									onPress={() => scheme?.run?.()}
								/>
							}
						/>
					);
				})}
			</ReactNative.ScrollView>
		</>
	);
};
