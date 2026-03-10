function slavicNoun(number, $1, $2, $5) {
  let n = Math.abs(number);
  n %= 100;
  if (n >= 5 && n <= 20) return $5;

  n %= 10;
  if (n === 1) return $1;
  if (n >= 2 && n <= 4) return $2;
  return $5;
}
function latinNoun(number, $1, $x) {
  return number === 1 ? $1 : $x;
}
export let massive = {};
massive = {
  settings: {
    titles: {
      settings: {
        "en-GB": "Settings",
        uk: "Налаштування",
        ru: "Настройки",
      },
      filters: {
        "en-GB": "Filters",
        uk: "Фільтри",
        ru: "Фильтры",
      },
    },
    showTimestamps: {
      "en-GB": "Show the time of deletion",
      uk: "Показувати час видалення",
      ru: "Показывать время удаления",
    },
    ewTimestampFormat: {
      "en-GB": "Use 12-hour format",
      uk: "Використовувати 12-годинний формат",
      ru: "Использовать 12-часовой формат",
    },
    youDeletedItWarning: {
      "en-GB": "The messages YOU deleted - are not saved",
      uk: "Повідомлення які видалили ВИ - не зберігаются",
      ru: "Сообщения удаленные ВАМИ - не сохраняются",
    },
    addUsersInfo: {
      "en-GB": () =>
        `To add or remove users from the ignore list, follow these steps:\n` +
        `1. open their profile\n` +
        `2. press the •••\n` +
        `3. press "${massive.optionLabels[0]["en-GB"]}"\n` +
        `4. 🎉`,
      uk: () =>
        `Щоб добавити когось до списку ігнорованих користувачів, виконайте ці дії:\n` +
        `1. відкрите їх профіль\n` +
        `2. натисніть •••\n` +
        `3. натисніть "${massive.optionLabels[0]["uk"]}"\n` +
        `4. 🎉`,
      ru: () =>
        `Чтобы добавить кого-то в список игнорированных пользователей - следуйте этим шагам\n` +
        `1. откройте их профиль\n` +
        `2. нажмите •••\n` +
        `3. нажмите "${massive.optionLabels[0]["ru"]}"\n` +
        `4. 🎉`,
    },
    ignoreBots: {
      "en-GB": "Ignore bots",
      uk: "Ігнорувати ботів",
      ru: "Игнорировать ботов",
    },
    clearUsersLabel: {
      "en-GB": (amount) =>
        `You have ${amount} user${latinNoun(amount, "", "s")} in the ignored users list`,
      uk: (amount) =>
        `Ви маєте ${amount} користувач${slavicNoun(amount, "а", "а", "ів")} у списку ігнорованих користувачів`,
      ru: (amount) =>
        `Вы имеете ${amount} пользовател${slavicNoun(amount, "я", "я", "ей")} в списке игнорированных пользователей`,
    },

    confirmClear: {
      title: {
        "en-GB": "Hold on!",
        uk: "Почекай-но!",
        ru: "Положди-ка!",
      },
      description: {
        "en-GB": (amount) =>
          `This will remove ${amount} user${latinNoun(amount, "", "s")} from the ignored users list.\nDo you you really want to do that?`,
        uk: (amount) =>
          `Це прибере ${amount} користувач${slavicNoun(amount, "а", "а", "ів")} зі списку ігнорованих користувачів.\nВи дійсно хочете продовжити?`,
        ru: (amount) =>
          `Это уберет ${amount} пользовател${slavicNoun(amount, "я", "я", "ей")} из списка игнорированных пользователей.\nВы действительно хотите продолжить?`,
      },
      yes: {
        "en-GB": "Yes",
        uk: "Так",
        ru: "Да",
      },
      no: {
        "en-GB": "Cancel",
        uk: "Відминити",
        ru: "Отменить",
      },
    },
    removeUserButton: {
      "en-GB": "REMOVE",
      uk: "ПРИБРАТИ",
      ru: "УБРАТЬ",
    },
  },
  optionLabels: [
    {
      "en-GB": "Add to NoDelete ignored users list",
      uk: "Добавити до списку ігнорованих користувачів у NoDelete",
      ru: "Добавить в список игнорированных пользователей в NoDelete",
    },
    {
      "en-GB": "Remove from the NoDelete ignore list",
      uk: "Прибрати з списку ігнорованих користувачів у NoDelete",
      ru: "Убрать из списка игнорированных пользователей в NoDelete",
    },
  ],
  toastLabels: [
    {
      "en-GB": "Added {user} to the ignored users list",
      uk: "{user} добавлено до списку ігнорованих користувачів",
      ru: "{user} добавлены в список игнорированных пользователей",
    },
    {
      "en-GB": "Removed {user} from the ignored users list",
      uk: "{user} прибрано зі списку ігнорованих користувачів",
      ru: "{user} убраны из списка игнорированных пользователей",
    },
  ],
  thisMessageWasDeleted: {
    "en-GB": "This message was deleted",
    uk: "Це повідомлення було видалено",
    ru: "Это сообщение было удалено",
  },
};

export const locale = () =>
  vendetta.metro.findByStoreName("LocaleStore").locale;
const defaultLocale = "en-GB";
export function getTranslation(find, fn) {
  let value = massive;

  for (const key of find.split(".")) {
    // biome-ignore lint/suspicious/noPrototypeBuiltins: meow
    if (value?.hasOwnProperty(key)) {
      value = value[key];
    } else {
      value = massive;
    }
  }
  if (value === massive) return find;
  let localized = value[locale()] ?? value[defaultLocale] ?? find;
  if (typeof localized === "function" && !fn) localized = localized();
  return fn ? { make: localized } : localized;
}
