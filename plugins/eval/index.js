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
	},
	AsyncFunction = async function () {}.constructor;

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
			  ).slice(1), // i know
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
					displayName: "!eval",
					description: "Evaluates code",
					options: [
						{
							required: true,
							type: 3,
							name: "code",
							description: "Code to evaluate",
						},
						{
							type: 4,
							name: "type",
							description: "Type of the code",
							choices: [
								{
									name: "sync",
									value: 0,
								},
								{
									name: "async [default]",
									value: 1,
								},
							],
						},
						{
							type: 5,
							name: "return",
							description:
								"Return the returned value? (so it works as a real command, default: false)",
						},
						{
							type: 5,
							name: "global",
							description:
								"Evaluate the code in the global scope? (default: false)",
						},
						{
							type: 5,
							name: "silent",
							description: "Show the output of the evaluation? (default: false)",
						},
					],
					async execute(args, ctx) {
						const messageMods = {
							...authorMods,
							interaction: {
								name: "/eval",
								user: findByStoreName("UserStore").getCurrentUser(),
							},
						};
						const interaction = {
							messageMods,
							...ctx,
							args: new Map(args.map((o) => [o.name, o])),
							plugin: this,
						};
						try {
							const { channel, args } = interaction;
							const Async = args.get("type")?.value;
							const silent = args.get("silent")?.value ?? false;
							const global = args.get("global")?.value ?? false;
							const code = args.get("code")?.value;

							let result, errored;
							const functioner = new (Async ? AsyncFunction : Function)(code);
							console.log(functioner)
							let start = +new Date();
							try {
								result = await (global
									? functioner.bind(interaction)()
									: functioner());
							} catch (e) {
								result = e;
								errored = true;
							}

							let elapsed = +new Date() - start;
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
													description: storage["trimError"]
														? result.stack.split("\n    at next (native)")[0]
														: result.stack,
													footer: {
														text: `type: ${typeof result}${(typeof result === "undefined" && !code.includes("return")) ? "\nhint: use the return keyword": ""}\ntook: ${elapsed}ms`,
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
