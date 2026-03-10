/** biome-ignore-all lint/complexity/useLiteralKeys: <ilik e it> */
import Settings from "./settings.jsx";
import { cmdDisplays } from "../../common/index.js";
import { findByProps } from "@vendetta/metro";
import { before } from "@vendetta/patcher";
import { sendTextMessage as sendText } from "../../common/index.js";
import { storage } from "@vendetta/plugin";
import { commands } from "@vendetta";
import { getUwuifier } from "./uwuifier/index.js";
import { makeDefaults } from "../../common/index.js";
const patches = [];
const DEFAULT_STORAGE = {
	stats: {
		global_counter: 0,
		history: [], // only remembers the last 25, storing this in the hopes of figuring out how to do autocomplete with builtin commands later
	},
	settings: {
		uwuifier: {
			spaces: {
				faces: true,
				actions: true,
				stutters: true
			},
			words: true,
			exclamations: false
		},
		convert_messages: true,
		defaults: {
			send: true
		},
	},
};
export default {
  settings: Settings,
  onUnload() {
    for (const unpatch of patches) unpatch();
  },
  onLoad() {
		makeDefaults(vendetta.plugin.storage, DEFAULT_STORAGE);
    patches.push(
      commands.registerCommand(
        cmdDisplays({
          type: 1,
          applicationId: "-1",
          inputType: 1,
          name: `uwuify`,
          description: "UwUify some text",
          options: [
            {
              type: 3,
              required: true,
              name: "input",
              description: "Text to be UwUified",
            },
            {
              type: 5,
              required: false,
              name: "send",
              description: `Whether to send the uwuified text as an actual message in chat (default: {default_action})`.replaceAll("{default_action}", storage['settings']['defaults']['send']),
            },
          ],
          execute: (rawArgs) => {try{
            const args = new Map(rawArgs.map((o) => [o.name, o]));
            const input = args.get("input")?.value;
            const output = getUwuifier().uwuifySentence(input);
            const ephemeral = !(args.get("send")?.value ?? storage['settings']['defaults']['send']);
						const history = storage['stats']['history']
						history.unshift({
							timestamp: Date.now(),
							input
						})
						if (history.length > 25) history.pop() // this doesn't Limit the history to be under 25, e.g. if someone edits their storage to have 5000 items it will just break the plugin but i dont think it matters much rn
            sendText("currentChannel", output, ephemeral);
					} catch (e) {
						console.error(e);
						console.log(e.stack);
						alert(`There was an error while running the command\n${e.stack}`);
					}
          },
        }),
      ),
    );

    const Messages = findByProps("sendMessage", "receiveMessage");
    patches.push(
      before("sendMessage", Messages, (args) => {
        if (storage['settings']["convert_messages"] && !args[1]?._command_output)
          args[1].content = getUwuifier().uwuifySentence(args[1].content);
      }),
    );
  },
};
