import { React, ReactNative } from "@vendetta/metro/common";
import { storage } from "@vendetta/plugin";
import { useProxy } from "@vendetta/storage";
import { reloadUwuifier } from "./uwuifier/index.js";
import {
	ScrollView,
	Stack,
	TableRowGroup,
	TableSwitchRow,
	TextInput,
} from "../../common/ui/TableComponents.js";
import { findByProps } from "@vendetta/metro";

const { View, Text } = ReactNative;
const { Slider } = findByProps("Slider") || {};
const { Card } = findByProps("Card") || {};

const updateStorage = (path, finalVal) => {
	const keys = path.split(".");
	let current = storage;
	for (let i = 0; i < keys.length - 1; i++) {
		current = current[keys[i]];
	}
	current[keys[keys.length - 1]] = finalVal;

	if (path.startsWith("settings.uwuifier"))
		setTimeout(() => reloadUwuifier(storage), 0);
};

const SettingCardSlider = ({ label, path, max = 1 }) => {
	const keys = path.split(".");
	let initialVal = storage;
	for (const key of keys) initialVal = initialVal[key];

	const [localText, setLocalText] = React.useState(String(initialVal));

	const handleTextChange = (text) => {
		setLocalText(text);
		if (text === "" || text.endsWith(".") || text.endsWith("0")) return;
		const parsed = parseFloat(text);
		if (!Number.isNaN(parsed)) {
			updateStorage(path, parsed);
		}
	};

	const handleSliderChange = (val) => {
		const rounded = parseFloat(val.toFixed(3));
		setLocalText(String(rounded));
		updateStorage(path, rounded);
	};

	const content = (
		<View style={{ padding: 0, gap: 12 }}>
			<View
				style={{
					flexDirection: "row",
					justifyContent: "space-between",
					alignItems: "center",
				}}
			>
				<Text
					variant="heading-md/semibold"
					style={{ color: "#dbdee1", flexShrink: 1 }}
				>
					{label}
				</Text>
				<View style={{ width: 80 }}>
					<TextInput
						placeholder="0.0"
						value={localText}
						onChangeText={handleTextChange}
						keyboardType="numeric"
						size="sm"
					/>
				</View>
			</View>
			{Slider && (
				<Slider
					value={parseFloat(localText) || 0}
					minimumValue={0}
					maximumValue={max}
					step={0.005}
					onValueChange={handleSliderChange}
				/>
			)}
		</View>
	);

	if (Card) {
		return <Card>{content}</Card>;
	}

	return (
		<View
			style={{
				backgroundColor: "#2b2d31",
				borderRadius: 16,
				overflow: "hidden",
			}}
		>
			{content}
		</View>
	);
};

export default function Settings() {
	useProxy(storage);

	return (
		<ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 12 }}>
			<Stack spacing={12}>
				<TableRowGroup title="Modifier frequency">
					<Stack spacing={8}>
						<SettingCardSlider
							label="Faces :3"
							path="settings.uwuifier.spaces.faces"
						/>
						<SettingCardSlider
							label="Actions *paws at you*"
							path="settings.uwuifier.spaces.actions"
						/>
						<SettingCardSlider
							label="S-stutters"
							path="settings.uwuifier.spaces.stutters"
						/>
						<SettingCardSlider label="words" path="settings.uwuifier.words" />
						<SettingCardSlider
							label="Exclamations!!!!?"
							path="settings.uwuifier.exclamations"
						/>
					</Stack>
				</TableRowGroup>
				<TableRowGroup title="Other">
					<TableSwitchRow
						label="Convert message before sending"
						value={storage.settings.convert_messages}
						onValueChange={(v) => {
							updateStorage("settings.convert_messages", v);
						}}
					/>
				</TableRowGroup>
			</Stack>
		</ScrollView>
	);
}
