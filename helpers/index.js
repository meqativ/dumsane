export function cmdDisplays(obj) {
	if (!("description" in obj) || !("name" in obj))
		throw new Error("No name or description in the command guh");

	obj.displayName = obj.name;
	obj.displayDescription = obj.description;
	if (obj.options) {
		obj.options = obj.options.map((p) => ({
			...p,
			displayName: p.name,
			displayDescription: p.description,
		}));
	}
	return obj;
}
