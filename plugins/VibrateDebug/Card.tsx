const { ReactNative: RN, stylesheet } = vendetta.metro.common;
const { getAssetIDByName } = vendetta.ui.assets;
const { Forms } = vendetta.ui.components;

const { FormRow, FormSwitch, FormRadio } = Forms;
const { hideActionSheet } = vendetta.metro.findByProps(
	"openLazy",
	"hideActionSheet"
);
const { showSimpleActionSheet } = vendetta.metro.findByProps(
	"showSimpleActionSheet"
);

// TODO: These styles work weirdly. iOS has cramped text, Android with low DPI probably does too. Fix?
const styles = stylesheet.createThemedStyleSheet({
	card: {
		backgroundColor: vendetta.ui.semanticColors?.BACKGROUND_SECONDARY,
		borderRadius: 5,
	},
	header: {
		padding: 0,
		backgroundColor: vendetta.ui.semanticColors?.BACKGROUND_TERTIARY,
		borderTopLeftRadius: 5,
		borderTopRightRadius: 5,
	},
	actions: {
		flexDirection: "row-reverse",
		alignItems: "center",
	},
	icon: {
		width: 22,
		height: 22,
		marginLeft: 5,
		tintColor: vendetta.ui.semanticColors?.INTERACTIVE_NORMAL,
	},
});

interface Action {
	icon: string;
	onPress: () => void;
}

interface OverflowAction extends Action {
	label: string;
	isDestructive?: boolean;
}

export interface CardWrapper<T> {
	item: T;
	index: number;
}

interface CardProps {
	index?: number;
	headerLabel: string | React.ComponentType;
	headerIcon?: string;
	button: object;
	onToggleChange?: (v: boolean) => void;
	descriptionLabel?: string | React.ComponentType;
	actions?: Action[];
	overflowTitle?: string;
	overflowActions?: OverflowAction[];
}

export default function Card(props: CardProps) {
	let pressableState = true;

	return (
		<RN.View style={[styles.card, { marginTop: props.index !== 0 ? 10 : 0 }]}>
			<FormRow
				style={styles.header}
				label={props.headerLabel}
				leading={
					props.headerIcon && (
						<FormRow.Icon source={getAssetIDByName(props.headerIcon)} />
					)
				}
				trailing={
					props.button 
				}
			/>
			<FormRow
				label={props.descriptionLabel}
				trailing={
					<RN.View style={styles.actions}>
						{props.overflowActions && (
							<RN.TouchableOpacity
								onPress={() =>
									showSimpleActionSheet({
										key: "CardOverflow",
										header: {
											title: props.overflowTitle,
											icon: props.headerIcon && (
												<FormRow.Icon
													style={{ marginRight: 8 }}
													source={getAssetIDByName(props.headerIcon)}
												/>
											),
											onClose: () => hideActionSheet(),
										},
										options: props.overflowActions?.map((i) => ({
											...i,
											icon: getAssetIDByName(i.icon),
										})),
									})
								}
							>
								<RN.Image
									style={styles.icon}
									source={getAssetIDByName("ic_more_24px")}
								/>
							</RN.TouchableOpacity>
						)}
						{props.actions?.map(({ icon, onPress }) => (
							<RN.TouchableOpacity onPress={onPress}>
								<RN.Image style={styles.icon} source={getAssetIDByName(icon)} />
							</RN.TouchableOpacity>
						))}
					</RN.View>
				}
			/>
		</RN.View>
	);
}
