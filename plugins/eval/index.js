import * as hlp from "../../helpers/index.js";
import { registerCommand } from "@vendetta/commands";
import { findByProps, findByStoreName } from "@vendetta/metro";
import { storage } from "@vendetta/plugin";
import { semanticColors } from "@vendetta/ui";
const { inspect } = findByProps("inspect"),
	authorMods = {
		author: {
			username: "eval",
			avatar: "command",
			avatarURL: hlp.AVATARS.command,
		},
	},
	AsyncFunction = (async () => {}).constructor,
	VARIATION_SELECTOR_69 = "󠄴";
hlp.makeDefaults(vendetta.plugin.storage, {
	stats: {
		runs: {
			history: [],
			failed: 0,
			succeeded: 0,
			plugin: 0,
			sessionHistory: [],
		},
	},
	settings: {
		history: {
			enabled: true,
			saveContext: false,
			saveOnError: false,
			checkLatestDupes: true, // not functional
		},
		output: {
			location: 0, // 0: content, 1: embed
			trim: 15000, // Number: enabled, specifies end; Undefined: disabled
			sourceEmbed: true,
			info: {
				enabled: true,
				prettyTypeof: true,
				hints: true,
			},
			useToString: false,
			inspect: {
				showHidden: false,
				depth: 3,
				maxArrayLength: 15,
				compact: 2,
				numericSeparator: true,
				getters: false,
			},
			codeblock: {
				enabled: true,
				escape: true,
				language: "js\n",
			},
			errors: {
				trim: true,
				stack: true,
			},
		},
		defaults: {
			await: true,
			global: false,
			silent: false,
		},
		command: {
			name: "!eval",
			predicate: () => true,
		},
	},
});
const {
	meta: { resolveSemanticColor },
} = findByProps("colors", "meta");
const ThemeStore = findByStoreName("ThemeStore");

export const EMBED_COLOR = (color) => {
	return parseInt(resolveSemanticColor(ThemeStore.theme, semanticColors.BACKGROUND_SECONDARY).slice(1), 16);
};
/* thanks acquite#0001 (<@581573474296791211>) */

/* Hey
 * @param {meow}
 */
let madeSendMessage,
	plugin,
	usedInSession = false;
function sendMessage() {
	if (window.sendMessage) return window.sendMessage?.(...arguments);
	if (!madeSendMessage) madeSendMessage = hlp.mSendMessage(vendetta);
	return madeSendMessage(...arguments);
}
async function evaluate(code, aweight, global, that = {}) {
	let result,
		errored = false,
		start = +new Date();
	try {
		const args = [];
		if (!global) args.push(...Object.keys(that));
		args.push(code);
		let evalFunction = new AsyncFunction(...args);
		let i = 0;
		for (var key of Object.keys(that)) {
			args[i] = that[key];
			i++;
		}
		if (aweight) {
			result = await evalFunction(...args);
		} else {
			result = evalFunction(...args);
		}
	} catch (e) {
		result = e;
		errored = true;
	}
	let end = +new Date();
	return { result, errored, start, end, elapsed: end - start };
}
plugin = {
	meta: vendetta.plugin,
	patches: [],
	onUnload() {
		this.patches.forEach((up) => up()); // unpatch every patch
		this.patches = [];
	},
	onLoad() {
		let UserStore;
		try {
			this.command(execute);
			async function execute(rawArgs, ctx) {
				UserStore ??= findByStoreName("UserStore");

				if (!usedInSession) {
					usedInSession = true;
					storage["stats"]["runs"]["plugin"]++;
					storage["stats"]["runs"]["sessionHistory"] = [];
				}
				const currentUser = UserStore.getCurrentUser();
				const messageMods = {
					...authorMods,
					interaction: {
						name: "/" + this.displayName,
						user: currentUser,
					},
				};
				const interaction = {
					messageMods,
					...ctx,
					user: currentUser,
					args: new Map(rawArgs.map((o) => [o.name, o])),
					rawArgs,
					plugin,
				};
				try {
					const { channel, args } = interaction;
					const code = args.get("code")?.value;
					if (typeof code !== "string") throw new Error("No code argument passed");
					const settings = storage["settings"];

					const defaults = settings["defaults"];
					const aweight = args.get("await")?.value ?? defaults["await"];
					const silent = args.get("silent")?.value ?? defaults["silent"];
					const global = args.get("global")?.value ?? defaults["global"];

					const { result, errored, start, end, elapsed } = await evaluate(code, aweight, global, { interaction, util: { sendMessage, hlp, VARIATION_SELECTOR_69, evaluate } });

					const { runs } = storage["stats"],
						history = settings["history"];
					let thisEvaluation;
					if (history.enabled) {
						thisEvaluation = {
							session: runs["plugin"],
							start,
							end,
							elapsed,
							code,
							errored,
						};
						if (!interaction.dontSaveResult) {
							thisEvaluation.result = hlp.cloneWithout(result, [runs["history"], runs["sessionHistory"], vendetta.plugin.storage], "not saved");

							if (history.saveContext) thisEvaluation.context = hlp.cloneWithout(interaction, [runs["history"], runs["sessionHistory"], vendetta.plugin.storage], "not saved");
						}
						(() => {
							if (!history.saveOnError && errored) return runs["failed"]++;
							runs["succeeded"]++;

							//if (history.checkLatestDupes && runs["sessionHistory"].at(-1)?.code === thisEvaluation.code) return;
							runs["history"].push(thisEvaluation);
							runs["sessionHistory"].push(thisEvaluation);
						})();
					}

					if (!silent) {
						const outputSettings = settings["output"];
						let outputStringified = outputSettings["useToString"] ? result.toString() : inspect(result, outputSettings["inspect"]);

						if (errored) {
							const errorSettings = outputSettings["errors"];
							if (errorSettings["stack"]) outputStringified = result.stack;
							if (errorSettings["trim"]) outputStringified = outputStringified.split("    at ?anon_0_?anon_0_evaluate")[0];
						}
						if (typeof outputSettings["trim"] === "number" && outputSettings["trim"] < outputStringified.length) outputStringified = outputStringified.slice(0, outputSettings["trim"]);

						if (outputSettings["codeblock"].enabled) {
							if (outputSettings["codeblock"].escape) outputStringified = outputStringified.replace("```", "`" + VARIATION_SELECTOR_69 + "``");
							outputStringified = "```" + outputSettings["codeblock"].language + outputStringified + "```";
						}

						let infoString;
						if (outputSettings["info"].enabled) {
							let type = outputSettings["info"].prettyTypeof ? hlp.prettyTypeof(result) : "type: " + typeof result;
							if (errored) type = `Error (${type})`;
							const hint = outputSettings["info"]["hints"] ? (result === "undefined" && !code.includes("return") ? "hint: use the return keyword\n" : "") : "";
							infoString = `${type}\n${hint}took: ${elapsed}ms`;
						}
						let sourceFooterString = `length: ${code.length}`;
						let newlineCount = code.split("").filter(($) => $ === "\n").length;
						if (newlineCount < 0) sourceFooterString += `\nnewlines: ${newlineCount}`;
						if (errored) {
							sendMessage(
								{
									channelId: channel.id,
									content: !outputSettings["location"] ? outputStringified : undefined,
									embeds: [
										{
											type: "rich",
											color: EMBED_COLOR("exploded"),
											title: "Error returned",
											description: outputSettings["location"] ? outputStringified : outputSettings["info"].enabled ? infoString : undefined,
											footer: outputSettings["info"].enabled ? (outputSettings["location"] ? { infoString } : undefined) : undefined,
										},

										!outputSettings["sourceEmbed"]
											? undefined
											: {
													type: "rich",
													color: EMBED_COLOR("source"),
													title: "Code",
													description: code,
													footer: {
														text: sourceFooterString,
													},
											  },
									].filter(($) => $ !== void 0),
								},
								messageMods
							);
						}
						if (!errored)
							sendMessage(
								{
									channelId: channel.id,
									content: !outputSettings["location"] ? outputStringified : undefined,
									embeds: [
										{
											type: "rich",
											color: EMBED_COLOR("satisfactory"),
											description: outputSettings["location"] ? outputStringified : outputSettings["info"].enabled ? infoString : undefined,
											footer: outputSettings["info"].enabled ? (outputSettings["location"] ? { infoString } : undefined) : undefined,
										},
										!outputSettings["sourceEmbed"]
											? undefined
											: {
													type: "rich",
													color: EMBED_COLOR("source"),
													title: "Code",
													description: code,
													footer: {
														text: sourceFooterString,
													},
											  },
									].filter(($) => $ !== void 0),
								},
								messageMods
							);
					}
					if (!errored && args.get("return")?.value) return result;
				} catch (e) {
					console.error(e);
					console.log(e.stack);
					alert("An uncatched error was thrown while running /eval\n" + e.stack);
				}
			}
		} catch (e) {
			console.error(e);
			console.log(e.stack);
			alert(`There was an error while loading the plugin "${plugin.meta.name}"\n${e.stack}`);
		}
	},
	command(execute) {
		if (this.commandPatch) {
			this.patches.splice(
				this.patches.findIndex(($) => $ === this.commandPatch),
				1
			)?.();
		}
		this.commandPatch = registerCommand(
			hlp.cmdDisplays({
				execute,
				predicate: storage["settings"]["command"].predicate ?? (() => true),
				type: 1,
				inputType: 1,
				applicationId: "-1",
				name: storage["settings"]["command"].name ?? "!eval",
				description: "Evaluates code",
				options: [
					{
						required: true,
						type: 3,
						name: "code",
						description: "Code to evaluate",
					},
					{
						type: 5,
						name: "silent",
						description: `Show the output of the evaluation? (default: ${storage["settings"]["defaults"]["silent"] ?? true})`,
					},
					{
						type: 5,
						name: "return",
						description: `Return the returned value? (so it works as a real command, default: ${storage["settings"]["defaults"]["return"]})`,
					},
					{
						type: 5,
						name: "global",
						description: `Evaluate the code in the global scope? (default: ${storage["settings"]["defaults"]["global"] ?? false})`,
					},
					{
						type: 5,
						name: "await",
						description: `await the evaluation? (default: ${storage["settings"]["defaults"]["await"] ?? true})`,
					},
				],
			})
		);
		this.patches.push(this.commandPatch);
	},
};
export default plugin;
