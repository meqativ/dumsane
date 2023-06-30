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
	ZWD = "\u200d",
	BUILTIN_AUTORUN_TYPES = [
		"autorun_before",
		"autorun_after",
		"plugin_after_defaults",
		"plugin_after_exports",
		"plugin_onUnload",
		"plugin_onLoad",
		"command_before",
		"command_after_interaction_def",
		"command_before_return",
		"command_after",
		"command_autocomplete_before",
		"command_autocomplete_after",
		"evaluate_before",
		"evaluate_after",
	],
	triggerAutorun = (type, fn) => {
		if (["autorun_before", "autorun_after"].includes(type)) return;
		triggerAutorun("autorun_before", (code) => eval(code));
		const optimizations = storage["settings"]["autoruns"]["optimizations"];
		let autoruns = storage["autoruns"];
		if (optimizations) autoruns = autoruns.filter(($) => $.type === type);
		autoruns = autoruns.filter(($) => $.enabled);
		let index = 0;
		for (const autorun of autoruns) {
			try {
				if (!optimizations && autorun.type !== type) {
					index++;
					continue;
				}
				fn(autorun.code);
				storage["stats"]["autoruns"][autorun.type] ??= 0;
				storage["stats"]["autoruns"][autorun.type]++;
				autorun.runs ??= 0;
				autorun.runs++;
			} catch (e) {
				e.message = `Failed to execute autorun ${autorun.name ?? "No Name"} (${index}${optimizations ? ", optimized" : ""}). ` + e.message;
				console.error(e);
				console.log(e.stack);
			}
			index++;
		}
		triggerAutorun("autorun_after", (code) => eval(code));
	};
hlp.makeDefaults(vendetta.plugin.storage, {
	autoruns: [
		{
			enabled: false,
			type: "plugin_onLoad",
			name: "example autorun (plugin_onLoad)",
			description: "Example autorun, for more autorun types >> return util.BUILTIN_AUTORUN_TYPES",
			code: `/* eval()s this code when the plugin starts up */` + `alert("plugin_onLoad")`,
		},
	],
	stats: {
		runs: {
			history: [],
			failed: 0,
			succeeded: 0,
			plugin: 0,
			sessionHistory: [],
		},
		autoruns: {},
	},
	settings: {
		history: {
			enabled: true,
			saveContext: false,
			saveOnError: false,
			checkLatestDupes: true, // not functional
		},
		autoruns: {
			enabled: true,
			optimization: false,
		},
		output: {
			location: 0, // 0: content, 1: embed
			trim: 15000, // Number: enabled, specifies end; Undefined: disabled
			fixPromiseProps: true,
			sourceEmbed: {
				enabled: true,
				codeblock: {
					enabled: true,
					escape: true,
					language: "js",
				},
			},
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
				language: "js",
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
if (storage.settings.output.sourceEmbed.codeblock.language.endsWith("\n"))
	storage.settings.output.sourceEmbed.codeblock.language = storage.settings.output.sourceEmbed.codeblock.language.split(0, storage.settings.output.sourceEmbed.codeblock.language.length - 1);
if (storage.settings.output.codeblock.language.endsWith("\n"))
	storage.settings.output.codeblock.language = storage.settings.output.codeblock.language.split(0, storage.settings.output.codeblock.language.length - 1);
// some of the lines of code ever

triggerAutorun("plugin_after_defaults", (code) => eval(code));

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

/* Evaluates code
 * @param {string} code Code to evaluate
 * @param {boolean} aweight Whether to await the evaluation
 * @param {boolean} global Whether to assign the next argument as the "this" for the evaluation
 * @param {any} [that]
 */
async function evaluate(code, aweight, global, that = {}) {
	triggerAutorun("evaluate_before", (code) => eval(code));
	let result,
		errored = false,
		start = +new Date();
	try {
		const args = [];
		if (!global) args.push(...Object.keys(that));
		args.push(code);
		let evalFunction = new AsyncFunction(...args);
		Object.keys(that).forEach((name, index) => {
			args[index] = that[name];
		});
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

	const res = { result, errored, start, end, elapsed: end - start };
	triggerAutorun("evaluate_after", (code) => eval(code));
	return res;
}
plugin = {
	meta: vendetta.plugin,
	patches: [],
	onUnload() {
		triggerAutorun("plugin_onUnload", (code) => eval(code));
		this.patches.forEach((up) => up()); // unpatch every patch
		this.patches = [];
	},
	onLoad() {
		triggerAutorun("plugin_onLoad", (code) => eval(code));
		let UserStore;
		try {
			this.command(execute);
			async function execute(rawArgs, ctx) {
				triggerAutorun("command_before", (code) => eval(code));
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
				triggerAutorun("command_after_interaction_def", (code) => eval(code));
				if (interaction.autocomplete) {
					return; // TODO: figure out what in the world do i need to return here

					triggerAutorun("command_autocomplete_before", (code) => eval(code));
					triggerAutorun("command_autocomplete_after", (code) => eval(code));
				}
				try {
					const { channel, args } = interaction;
					const code = args.get("code")?.value;
					if (typeof code !== "string") throw new Error("No code argument passed");
					const settings = storage["settings"];

					const defaults = settings["defaults"];
					const aweight = args.get("await")?.value ?? defaults["await"];
					const silent = args.get("silent")?.value ?? defaults["silent"];
					const global = args.get("global")?.value ?? defaults["global"];

					let { result, errored, start, end, elapsed } = await evaluate(code, aweight, global, {
						interaction,
						util: { sendMessage, hlp, ZWD, evaluate, BUILTIN_AUTORUN_TYPES, triggerAutorun },
					});

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
						if (outputSettings.fixPromiseProps && result?.constructor?.name === "Promise") result = hlp.fixPromiseProps(result);
						let outputStringified = outputSettings["useToString"] ? result.toString() : inspect(result, outputSettings["inspect"]);

						if (errored) {
							const errorSettings = outputSettings["errors"];
							if (errorSettings["stack"]) outputStringified = result.stack;
							if (errorSettings["trim"]) outputStringified = outputStringified.split("    at ?anon_0_?anon_0_evaluate")[0];
						}
						if (typeof outputSettings["trim"] === "number" && outputSettings["trim"] < outputStringified.length) outputStringified = outputStringified.slice(0, outputSettings["trim"]);

						if (outputSettings["codeblock"].enabled) {
							const { escape, language } = outputSettings["codeblock"];
							if (escape) outputStringified = outputStringified.replaceAll("```", "`" + ZWD + "``");
							outputStringified = "```" + language + "\n" + outputStringified + "```";
						}

						let infoString;
						if (outputSettings["info"].enabled) {
							let type = outputSettings["info"].prettyTypeof ? hlp.prettyTypeof(result) : "type: " + typeof result;
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
											description: outputSettings["location"] ? outputStringified : outputSettings["info"].enabled ? infoString : undefined,
											footer: outputSettings["info"].enabled ? (outputSettings["location"] ? { text: infoString } : undefined) : undefined,
										},

										!outputSettings["sourceEmbed"]?.enabled
											? undefined
											: {
													type: "rich",
													color: EMBED_COLOR("source"),
													provider: { name: "Code" },
													description: ((code) => {
														const { enabled, escape, language } = outputSettings["sourceEmbed"].codeblock;
														if (enabled) {
															if (escape) code = code.replaceAll("```", "`" + ZWD + "``");
															code = "```" + language + "\n" + code + "```";
														}
														return code;
													})(code),
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
											footer: outputSettings["info"].enabled ? (outputSettings["location"] ? { text: infoString } : undefined) : undefined,
										},
										!outputSettings["sourceEmbed"]?.enabled
											? undefined
											: {
													type: "rich",
													color: EMBED_COLOR("source"),
													title: "Code",
													description: ((code) => {
														const { enabled, escape, language } = outputSettings["sourceEmbed"].codeblock;
														if (enabled) {
															if (escape) code = code.replaceAll("```", "`" + ZWD + "``");
															code = "```" + language + "\n" + code + "```";
														}
														return code;
													})(code),
													footer: {
														text: sourceFooterString,
													},
											  },
									].filter(($) => $ !== void 0),
								},
								messageMods
							);
					}

					if (!errored && args.get("return")?.value) {
						triggerAutorun("command_before_return", (code) => eval(code));
						return result;
					}
				} catch (e) {
					console.error(e);
					console.log(e.stack);
					alert("An uncatched error was thrown while running /eval\n" + e.stack);
				}
				triggerAutorun("command_after", (code) => eval(code));
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
triggerAutorun("plugin_after_exports", (code) => eval(code));
