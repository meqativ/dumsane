import Settings from "./settings.jsx";
import { cmdDisplays } from "../../common/index.js";
import { findByProps } from "@vendetta/metro";
import { before } from '@vendetta/patcher'
import { sendTextMessage as sendText  } from "../../common/index.js";
import { storage } from "@vendetta/plugin";
import { commands } from "@vendetta";
import { getUwuifier } from "./uwuifier/index.js";
const patches = [];

export default {
  settings: Settings,
  onUnload() {
		for (const unpatch of patches) unpatch()
  },
  onLoad() {
    patches.push(commands.registerCommand(
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
            description: "Whether to send the message as you or show it as an ephemeral message from clyde",
          },
        ],
        execute: (rawArgs) => {
          const args = new Map(rawArgs.map((o) => [o.name, o]));
					const input = args.get("input")?.value;
					const output = getUwuifier().uwuifySentence(input);
					const ephemeral = !(args.get("send")?.value ?? true);

					sendText("currentChannel", output, ephemeral);
        },
      })
    ));

		const Messages = findByProps('sendMessage', 'receiveMessage')
		patches.push(before('sendMessage', Messages, args => {
			if (storage["cfg.convert_messages"] && !args[1]?._command_output) args[1].content = getUwuifier().uwuifySentence(args[1].content)
		}))
  },
};
