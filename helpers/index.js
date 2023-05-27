export function cmdDisplays(obj, translations, locale) {
	if (!("description" in obj) || !("name" in obj))
		throw new Error("No name or description in the command guh");

	obj.displayName = translations?.names?.[locale] ?? obj.name;
	obj.displayDescription = translations?.names?.[locale] ?? obj.description;
	if (obj.options) {
		obj.options = obj.options.map((option, optionIndex) => {
			option.displayName = translations?.options?.[optionIndex]?.names?.[locale] ?? option.name;
			option.displayDescription = translations?.options?.[optionIndex]?.descriptions?.[locale] ?? option.description;
			// TODO: handle choices
			// if (option?.choices)
		});
	}
	return obj;
}
