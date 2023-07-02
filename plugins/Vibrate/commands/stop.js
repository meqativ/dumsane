import * as common from "../../../common";
import {
	vibrations,
	vibrate,
	authorMods,
	PLUGIN_FORUM_POST_URL,
	sendMessage,
	EMBED_COLOR,
} from "../index.js";
import { findByStoreName, findByProps } from "@vendetta/metro";
export const command = {
	exeCute: async (interaction) => {
		const { channel, args } = interaction;
		const messageMods = {
			...authorMods,
			interaction: {
				name: "/vibrate stop",
				user: findByStoreName("UserStore").getCurrentUser(),
			},
		};

		try {
			const id = args.get("id").value;
			if (vibrations.findIndex((v) => v.id === id) === -1) {
				await sendMessage(
					{
						channelId: channel.id,
						embeds: [
							{
								color: EMBED_COLOR(),
								type: "rich",
								title: `<${common.EMOJIS.getFailure()}> Vibration with id \`${id}\` not found`,
							},
						],
					},
					messageMods
				);
				return;
			}
			const vibration = vibrations[vibrations.findIndex((v) => v.id === id)];
			vibration.stopping = true;
			vibration.startCallbackOutput = sendMessage(
				{
					channelId: channel.id,
					embeds: [
						{
							color: EMBED_COLOR(),
							type: "rich",
							title: `<${common.EMOJIS.getLoading()}> Stopping vibration…`,
							footer: { text: `ID: ${vibration.id}` },
						},
					],
				},
				messageMods
			);
		} catch (e) {
			console.error(e);
			sendMessage(
				{
					color: EMBED_COLOR(),
					channelId: channel.id,
					content: `\`\`\`js\n${e.stack}\`\`\``,
					embeds: [
						{
							type: "rich",
							title: `<${common.EMOJIS.getFailure()}> An error ocurred while running the command`,
							description: `Send a screenshot of this error and explain how you came to it, here: ${PLUGIN_FORUM_POST_URL}, to hopefully get this error solved!`,
						},
					],
				},
				messageMods
			);
		}
	},
};
