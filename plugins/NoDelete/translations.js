export const massive = {
	optionLabels: [
		{
			"en-GB": "[NoDelete] Ignore deleted messages",
			uk: "[NoDelete] Ігнорувати видалені повідомлення",
			ru: "[NoDelete] Игнорировать удаленные сообщения",
		},
		{
			"en-GB": "[NoDelete] Stop ignoring deleted messages",
			uk: "[NoDelete] Припинити ігнорування видалених повідомленнь",
			ru: "[NoDelete] Прекратить игнорирование удаленных сообщений",
		},
	],
	toastLabels: [
		{
			"en-GB": "Enabled ignoring deleted messages from ${user}",
			uk: "Увімкнено ігнорування видалених повідомлень від ${user}",
			ru: "Включено игнорирование удаленных сообщений от ${user}",
		},
		{
			"en-GB": "Disabled ignoring deleted messages from ${user}",
			uk: "Вимкнено ігнорування видалених повідомлень від ${user}",
			ru: "Выключено игнорирование удаленных сообщений от ${user}",
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
