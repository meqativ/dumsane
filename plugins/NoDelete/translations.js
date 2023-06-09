export const massive = {
	optionLabels: [
		{
			"en-GB": "Add to NoDelete ignore list",
			uk: "Добавити до списку ігнорування NoDelete",
			ru: "Добавить в список игнорирования NoDelete",
		},
		{
			"en-GB": "Remove from the NoDelete ignore list",
			uk: "Прибрати з списку ігнорування NoDelete",
			ru: "Убрать из списка игнорирования NoDelete",
		},
	],
	toastLabels: [
		{
			"en-GB": "Added ${user} to the ignore list",
			uk: "${user} добавлено до списку ігнорування",
			ru: "${user} добавлены в список игнорирования",
		},
		{
			"en-GB": "Removed ${user} from the ignore list",
			uk: "${user} прибрано зі списку ігнорування",
			ru: "${user} убраны из списка игнорирования",
		},
	],
	thisMessageWasDeleted: {
		"en-GB": "This message was deleted",
		uk: "Це повідомлення було видалено",
		ru: "Это сообщение было удалено",
	},
};

let locale = "undefined";
const defaultLocale = "en-GB";
export function getTranslation(find) {
	let value = massive;

	for (const key of find.split(".")) {
		if (value?.hasOwnProperty(key)) {
			value = value[key];
		} else {
			value = massive;
		}
	}
	if (value === massive) return find;
	return value[locale] ?? value[defaultLocale] ?? find;
}
