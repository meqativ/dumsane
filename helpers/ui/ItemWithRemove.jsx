import { TouchableOpacity, Text, Image, View } from "@vendetta/ui/components/General";
import { createThemedStylesheet } from "@vendetta/metro/common/stylesheet";
import { semanticColors } from "@vendetta/ui";

const stylesheet = createThemedStylesheet({
	container: {
		flexDirection: "row",
	},
	image: {
		width: 100,
		height: 100,
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
