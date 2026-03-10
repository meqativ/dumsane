import { getUwuifier } from "./uwuifier/index.js";
import Settings from "./settings.jsx";
import { cmdDisplays } from "../../common/index.js";
import { findByProps, findByStoreName } from "@vendetta/metro";
import { before } from '@vendetta/patcher'

const { sendMessage, sendBotMessage } = findByProps("sendBotMessage")
const { getChannelId: getFocusedChannelId } = findByStoreName("SelectedChannelStore");
const patches = [];
export default {
  settings: Settings,
  onUnload() {
		for (const unpatch of patches) unpatch()
  },
  onLoad() {
    const {
      plugin: { storage },
      commands,
    } = vendetta;

    patches.push(commands.registerCommand(
      cmdDisplays({
        execute: (rawArgs) => {
          const args = new Map(rawArgs.map((o) => [o.name, o]));
					const input = args.get("input")?.value;
					const ephemeral = !(args.get("send")?.value ?? true);
					if (typeof input !== "string") throw new Error("No text to uwuify passed");

          const uwuified = getUwuifier().uwuifySentence(input);
					if (ephemeral) {
						sendBotMessage(getFocusedChannelId(), uwuified)
					} else {
						sendMessage(getFocusedChannelId(), {content:uwuified, _uwuified: true}, void 0, {nonce: Date.now().toString()})
					}
        },
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
      })
    ));

		const Messages = findByProps('sendMessage', 'receiveMessage')
		patches.push(before('sendMessage', Messages, args => {
			if (storage["cfg.convert_messages"] && !args[1]?._uwuified) args[1].content = getUwuifier().uwuifySentence(args[1].content)
		}))
  },
};
