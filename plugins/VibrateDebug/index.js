import settings from "./settings.jsx";
import { cmdDisplays } from "../../helpers/index.js";

const {
  logger,
  commands: { registerCommand },
  metro: { findByProps },
  plugin: { storage },
} = vendetta;
const patches = [];

const plugin = {
  settings,
  onUnload: () => patches.every((unpatch) => (unpatch, true)),
};

function exeCute(subcmd, args, ctx) {
  return { content: storage["test"] };
}

plugin.onLoad = () => {
  patches[0] = registerCommand(
    cmdDisplays({
      execute: (a, c) => exeCute("basic", a, c),

      name: "vibrate basic",
      description: "Start a basic vibrating scheme",
      applicationId: "1097969072022487110",
      inputType: "1",
      type: "1",
    })
  );
};

export default plugin;
