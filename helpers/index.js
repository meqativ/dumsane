export function cmdDisplays(obj, translations, locale) {
  if (!obj.name || !obj?.description)
    throw new Error(
      `No name(${obj?.name}) or description(${obj?.description}) in the passed command. (command name: ${obj?.name})`
    );

  obj.displayName = translations?.names?.[locale] ?? obj.name;
  obj.displayDescription = translations?.names?.[locale] ?? obj.description;
  if (obj.options) {
    obj.options = obj.options.map((option, optionIndex) => {
			// TODO: Handle subcommands (type 1, 2 probably i forgor)
      if (!option?.name || !option?.description)
        throw new Error(
          `No name(${option?.name}) or description(${option?.description} in the option with index ${optionIndex}`
        );
      option.displayName =
        translations?.options?.[optionIndex]?.names?.[locale] ?? option.name;
      option.displayDescription =
        translations?.options?.[optionIndex]?.descriptions?.[locale] ??
        option.description;
      // TODO: handle choices
      // if (option?.choices)
      return option;
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
  getFailure() {
    return Math.random() < 0.01 ? this?.fuckyoy : this.linuth;
  },
  getSuccess() {
    return "";
  },
};

export const AVATARS = {
	command: "https://cdn.discordapp.com/attachments/1099116247364407337/1112129955053187203/command.png"
}
