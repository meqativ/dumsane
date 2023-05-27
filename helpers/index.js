export function cmdDisplays(obj, translations, locale) {
	if (!obj?.description || !obj?.name)
		throw new Error(`No name(${obj?.name}) or description${obj?.description} in the command guh`);

	obj.displayName = translations?.names?.[locale] ?? obj.name;
	obj.displayDescription = translations?.names?.[locale] ?? obj.description;
	if (obj.options) {
		obj.options = obj.options.map((option, optionIndex) => {
			option.displayName =
				translations?.options?.[optionIndex]?.names?.[locale] ?? option.name;
			option.displayDescription =
				translations?.options?.[optionIndex]?.descriptions?.[locale] ??
				option.description;
			// TODO: handle choices
			// if (option?.choices)
		});
	}
	return obj;
}

export const EMOJIS = {
	loadingDiscordSpinner: ":loading:1105495814073229393",
	aol: "a:aol:1108834296359301161",
	linuth: ":linuth:1110531631409811547",
	fuckyoy: ":fuckyoy:1108360628302782564",
	getLoading() {
		return Math.random() < 0.01 ? this?.aol : this.loadingDiscordSpinner;
	},
	getFail() {
		return Math.random() < 0.01 ? this?.fuckyoy : this.linuth;
	},
	getSuccess() {
		return ""
	}
};
