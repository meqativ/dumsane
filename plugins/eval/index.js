import * as hlp from "../../helpers/index.js";
import { registerCommand } from "@vendetta/commands";
import { findByProps, findByStoreName } from "@vendetta/metro";
import { storage } from "@vendetta/plugin";
import { semanticColors } from "@vendetta/ui";
const authorMods = {
	author: {
		username: "eval",
		avatar: "command",
		avatarURL: hlp.AVATARS.command,
	},
};

if (!("stats" in storage)) storage["stats"] = {};
{
	const stats = storage["stats"];
	if (!("runs" in stats))
		stats.runs = {
			failed: 0,
			succeeded: 0,
		};
}
const {
	meta: { resolveSemanticColor },
} = findByProps("colors", "meta");
const ThemeStore = findByStoreName("ThemeStore");

export const EMBED_COLOR = (color) => {
	parseInt(
		color === "exploded"
			? resolveSemanticColor(
					ThemeStore.theme,
					semanticColors.BACKGROUND_SECONDARY
			  ).slice(1)
			: resolveSemanticColor(
					ThemeStore.theme,
					semanticColors.BACKGROUND_SECONDARY
			  ).slice(1),
		16
	);
};
/* thanks acquite#0001 (<@581573474296791211>) */
let madeSendMessage;
function sendMessage() {
	if (window.sendMessage) return window.sendMessage?.(...arguments);
	if (!madeSendMessage) madeSendMessage = hlp.mSendMessage(vendetta);
	return madeSendMessage(...arguments);
}
const plugin = {
	meta: vendetta.plugin,
	onLoad() {
		"use strict";
		try {
			this.onUnload = registerCommand(
				hlp.cmdDisplays({
					type: 1,
					inputType: 1,
					applicationId: "-1",
					name: "!eval",
					displayName: "eval",
					description: "Evaluates code",
					options: [
						{
							required: true,
							type: 3,
							name: "code",
							description: "The code to evaluate",
							min_length: 1,
						},
						{
							type: 4,
							name: "type",
							description: "How to handle the evaluation",
							choices: [
								{
									name: "no await & show output",
									value: 0,
								},
								{
									name: "await & no output",
									value: 1,
								},
								{
									name: "no await & no output",
									value: 2,
								},
								{
									name: "await & output [default]",
									value: -1,
								},
							],
						},
						{
							type: 5,
							name: "return",
							description:
								"Whether to return the returned value so it works as a real slash command (default: false)",
						},
					],
					execute: async (args, ctx) => {
						const interaction = {
							...ctx,
							args: new Map(args.map((o) => [o.name, o])),
							plugin: this,
						};
						const messageMods = {
							...authorMods,
							interaction: {
								name: "/eval",
								user: findByStoreName("UserStore").getCurrentUser(),
							},
						};
						try {
							const { channel, args } = interaction;
							const ignorePromise = [0, 2].includes(args.get("type")?.value);
							const silent = [1, 2].includes(args.get("type")?.value);
							const code = args.get("code")?.value;
							window.currentEvalInteraction = interaction;
							let result, errored;

							let start = +new Date();
							try {
								result = (0, eval)(code);
								if (result instanceof Promise && !ignorePromise) {
									result = await result;
								}
							} catch (e) {
								result = e;
								errored = true;
							}
							
							let elapsed = +new Date() - start;
							window.currentEvalInteraction = undefined
							console.log("[eval › evaluate() result]", {
								result,
								errored,
								elapsed,
							});

							if (!silent) {
								if (errored) {
									sendMessage(
										{
											channelId: channel.id,
											embeds: [
												{
													type: "rich",
													color: EMBED_COLOR("exploded"),
													description: result.stack.split(
														"\n    at next (native)"
													)[0],
													footer: {
														text: `type: ${typeof result}\ntook: ${elapsed}ms`,
													},
												},
											],
										},
										{ ...messageMods, rawCode: code }
									);
								}
								if (!errored)
									sendMessage(
										{
											channelId: channel.id,
											content: `\`\`\`js\n${vendetta.metro
												.findByProps("inspect")
												.inspect(result)}\`\`\``,
											embeds: [
												{
													type: "rich",
													color: EMBED_COLOR("satisfactory"),
													footer: {
														text: `type: ${typeof result}\ntook: ${elapsed}ms`,
													},
												},
											],
										},
										{ ...messageMods, rawCode: code }
									);
							}
							if (!errored && args.get("return")?.value) return result;
						} catch (e) {
							console.error(e);
							alert(
								"An uncatched error was thrown while running /eval\n" + e.stack
							);
						}
					},
				})
			);
		} catch (e) {
			console.error(e);
			alert(
				`There was an error while loading the plugin "${plugin.meta.name}"\n${e.stack}`
			);
		}
	},
};
export default plugin;
