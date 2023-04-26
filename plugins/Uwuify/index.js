import Uwuifier from "./uwuifier/index.js";
import Settings from "./settings.jsx";
import { cmd } from "../VibrateDebug/helpers.js";
let uwuifier = new Uwuifier();
const pluwugin = {
  reloadUwuifier,
  patches: [],
  startMessageTransfoworming(storage) {
    /*	TODO	
		 *	patches[1] = msg patch*/
  },
  reloadUwuifier(storage) {
    uwuifier = new Uwuifier({
      spaces: {
        faces: !storage["cfg.spaces.faces"] ? 0 : 0.5,
        actions: !storage["cfg.spaces.actions"] ? 0 : 0.075,
        stutters: !storage["cfg.spaces.stutters"] ? 0 : 0.1,
      },
      words: !storage["cfg.words"] ? 0 : 1,
      exclamations: !storage["cfg.exclamations"] ? 0 : 1,
    });
  },
  settings(props) {
    return Settings(props, this);
  },
  onUnload() {
    this.patches.every((p) => (p(), true));
  },
  onLoad() {
    const {
      plugin: { storage },
      commands,
      logger,
    } = vendetta;

    this.patches[0] = commands.registerCommand(
      cmd({
        execute: (optionsA, context) => {
          const options = new Map(
            optionsA.map((option) => [option.name, option])
          );

          const uwuified = uwuifier.uwuifySentence(options.get("text").value);
          return { content: !options.get("epheneral")?.value ? uwuified : "h".repeat(6969) }; //	TODO: handle epheneral properly
        },
        type: 1,
        applicationId: "-1",
        inputType: 1,
        name: "uwuify",
        description: "UwUifies your text",
        options: [
          {
            type: 3,
            required: true,
            name: "text",
            description: "",
          },
          {
            type: 5,
            required: false,
            name: "ephemeral",
            description: "Whether to send it here as a message from you, or an ephemeral message.",
          },
        ],
      })
    );

    if (storage["uwuify_messages"]) startMessageTransfoworming(storage);
  },
};
