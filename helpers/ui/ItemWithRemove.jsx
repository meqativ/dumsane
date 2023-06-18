import { TouchableOpacity, Text, Image, View } from "@vendetta/ui/components/General";
import { createThemedStyleSheet } from "@vendetta/metro/common/stylesheet";
import { semanticColors } from "@vendetta/ui";

const stylesheet = createThemedStyleSheet({
	container: {
		flexDirection: "row",
		alignItems: "center",
	},
	image: {
		marginLeft: 5,
		marginRight: 5,
		width: 25,
		height: 25,
		borderRadius: 100,
	},
	label: {
		color: semanticColors.HEADER_PRIMARY,
	},
	labelRemove: {
		color: semanticColors.TEXT_WARNING,
	},
});

export default ({ imageSource, onImagePress, label, labelRemove = "REMOVE", onRemove }) => {
	return (
		<>
			<View style={stylesheet.container}>
				<TouchableOpacity onPress={onRemove}>
					<Text style={stylesheet.labelRemove}>{labelRemove}</Text>
				</TouchableOpacity>
				<TouchableOpacity onPress={onImagePress}>
					<Image style={[stylesheet.image]} source={imageSource} />
				</TouchableOpacity>
				<Text style={stylesheet.label}>{label}</Text>
			</View>
		</>
	);
};
