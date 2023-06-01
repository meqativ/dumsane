import { generateBasicScheme, parseScheme } from "../schemeUtils.js";
import * as hlp from "../../../helpers/index.js";
import { findByStoreName } from "@vendetta/metro";
import {
  vibrate,
  authorMods,
  PLUGIN_FORUM_POST_URL,
	EMBED_COLOR,
  sendMessage,
} from "../index.js";

export const command = {
  exeCute: async (interaction) => {
    const messageMods = {
      ...authorMods,
      interaction: {
        name: "/vibrate start",
        user: findByStoreName("UserStore").getCurrentUser(),
      },
    };
    try {
      const { args, channel } = interaction;

      if (
        !(
          args.get("scheme") ||
          args.get("duration") ||
          args.get("repeat") ||
          args.get("gap")
        )
      ) {
        return await sendMessage(
          {
            channel_id: channel.id,
            embeds: [
              {
								color: EMBED_COLOR(),
                type: "rich",
                title: `<${hlp.EMOJIS.getFailure()}> Please provide a \`scheme\` or choose \`duration\`, \`repeat\` and/or \`gap\``,
              },
            ],
          },
          messageMods
        );
      }
      const generatedScheme =
        args.get("scheme")?.value ||
        generateBasicScheme(
          args.get("duration").value,
          args.get("repeat")?.value,
          args.get("gap")?.value
        );
      vibrate({
        scheme: generatedScheme,
        parseCB: async (vibration) => {
          return await sendMessage(
            {
              channelId: channel.id,
              embeds: [
                {
								color: EMBED_COLOR(),
                  type: "rich",
                  title: `<:vibrating:1095354969965731921> Parsing vibration…`,
                  footer: {
                    text: `ID: ${vibration.id}\n(if you stop now, it will stop after parsing)`,
                  },
                },
              ],
            },
            messageMods
          );
        },
				parseFailCB: async (vibration) => {
          return await sendMessage(
            {
              channelId: channel.id,
              embeds: [
                {
								color: EMBED_COLOR(),
                  type: "rich",
                  title: `<${hlp.EMOJIS.getFailure()}> An error ocurred while parsing the scheme`,
                  description: `\`\`\`js\n${vibration.scheme.toString()}\`\`\``,
                },
              ],
            },
            {
              ...messageMods,
              id: vibration.parseCallbackOutput.id,
              edited_timestamp: Date.now().toString(),
            }
          );
				},	
        startCB: async (vibration) => {
          return await sendMessage(
            {
              channelId: channel.id,
              embeds: [
                {
								color: EMBED_COLOR(),
                  type: "rich",
                  title: `<:vibrating:1095354969965731921> Playing vibration`,
                  footer: { text: `ID: ${vibration.id}` },
                },
              ],
            },
            {
              ...messageMods,
              edited_timestamp: Date.now().toString(),
              id: vibration.parseCallbackOutput.id,
            }
          );
        },
        errorCB: async (vibration) => {
          return await sendMessage(
            {
              channelId: channel.id,
              embeds: [
                {
								color: EMBED_COLOR(),
                  type: "rich",
                  title: `${hlp.EMOJIS.getFailure()} An error ocurred while playing the vibration`,
                  description: `\`\`\`${vibration.error.message}\`\`\``,
                },
              ],
            },
            {
              ...messageMods,
              edited_timestamp: Date.now().toString(),
              id: vibration.startCallbackOutput.id,
            }
          );
        },
        finishCB: async (vibration) => {
          const replyId = vibration.startCallbackOutput.id;
          sendMessage(
            {
              channelId: channel.id,
              embeds: [
                {
								color: EMBED_COLOR(),
                  type: "rich",
                  title: `<:still:1095977283212296194> ${
                    vibration.stopped ? "Stopp" : "Finish"
                  }ed playing`,
                  footer: { text: `ID: ${vibration.id}` },
                },
              ],
            },
            {
              ...messageMods,
              type: 19,
              message_reference: {
                channel_id: channel.id,
                message_id: replyId,
                guild_id: interaction?.guild?.id,
              },
              referenced_message: findByStoreName("MessageStore").getMessage(
                channel.id,
                replyId
              ),
            }
          );
        },
      });
    } catch (e) {
      console.error(e);
      sendMessage(
        {
          channelId: channel.id,
          content: `\`\`\`js\n${e.stack}\`\`\``,
          embeds: [
            {
								color: EMBED_COLOR(),
              type: "rich",
              title: `<${hlp.EMOJIS.getFailure()}> An error ocurred while running the command`,
              description: `Send a screenshot of this error and explain how you came to it, here: ${PLUGIN_FORUM_POST_URL}, to hopefully get this error solved!`,
            },
          ],
        },
        messageMods
      );
    }
  },
};
