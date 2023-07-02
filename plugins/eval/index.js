import * as common from "../../common";
import evaluate from "../../common/evaluate.js";
import { registerCommand } from "@vendetta/commands";
import { findByProps, findByStoreName } from "@vendetta/metro";
import { storage } from "@vendetta/plugin";
import { semanticColors } from "@vendetta/ui";
const { inspect } = findByProps("inspect"),
	authorMods = {
		author: {
			username: "eval",
			avatar: "command",
			avatarURL: common.AVATARS.command,
		},
	},
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
	];
export function triggerAutorun(type, fn) {
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
}
common.makeDefaults(vendetta.plugin.storage, {
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
			trim: 15000, // Number: enabled, specifies end; false: disabled
			fixPromiseProps: true,
			hideSensitive: true,
			sourceEmbed: {
				name: "Code",
				enabled: true,
				codeblock: {
					enabled: true,
					escape: true,
					lang: "js",
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
				lang: "js",
			},
			errors: {
				trim: true,
				stack: true,
			},
		},
		defaults: {
			await: true,
			global: false,
			return: false,
			silent: false,
		},
		command: {
			name: "!eval",
		},
	},
});
triggerAutorun("plugin_after_defaults", (code) => eval(code));

const {
	meta: { resolveSemanticColor },
} = findByProps("colors", "meta");
const ThemeStore = findByStoreName("ThemeStore");

export const EMBED_COLOR = (color) => {
	return parseInt(resolveSemanticColor(ThemeStore.theme, semanticColors.BACKGROUND_SECONDARY).slice(1), 16);
};
/* thanks acquite#0001 (<@581573474296791211>) */

let madeSendMessage,
	UserStore,
	plugin,
	usedInSession = false;
function sendMessage() {
	if (window.sendMessage) return window.sendMessage?.(...arguments);
	if (!madeSendMessage) madeSendMessage = common.mSendMessage(vendetta);
	return madeSendMessage(...arguments);
}
async function execute(rawArgs, ctx) {
	try {
		const { settings, stats } = storage;
		const {
			history,
			defaults,
			output: outputSettings,
		} = settings;
		const { runs } = stats;

		triggerAutorun("command_before", (code) => eval(code));
		UserStore ??= findByStoreName("UserStore");

		if (!usedInSession) {
			usedInSession = true;
			runs["plugin"]++;
			runs["sessionHistory"] = [];
		}
		let currentUser = UserStore.getCurrentUser();
		if (outputSettings["hideSensitive"]) {
			currentUser = {...currentUser};
			evaluate.SENSITIVE_PROPS.USER.forEach((prop) => {
				Object.defineProperty(currentUser, prop, {
					enumerable: false,
				});
			});
		}
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
		};
		Object.defineProperty(interaction, "_args", {
			value: rawArgs,
			enunerable: false,
		});
		triggerAutorun("command_after_interaction_def", (code) => eval(code));
		if (interaction.autocomplete) {
			return; // TODO: figure out what in the world do i need to return here (make history here too)

			triggerAutorun("command_autocomplete_before", (code) => eval(code));
			triggerAutorun("command_autocomplete_after", (code) => eval(code));
		}

		const { channel, args } = interaction,
			code = args.get("code")?.value,
			aweight = args.get("await")?.value ?? defaults["await"],
			silent = args.get("silent")?.value ?? defaults["silent"],
			global = args.get("global")?.value ?? defaults["global"];
		if (typeof code !== "string") throw new Error("No code argument passed");

		triggerAutorun("evaluate_before", (code) => eval(code));
		let { result, errored, start, end, elapsed } = await evaluate(code, aweight, global, {
			interaction,
			plugin,
			util: { sendMessage, common, evaluate, BUILTIN_AUTORUN_TYPES, triggerAutorun },
		});
		triggerAutorun("evaluate_after", (code) => eval(code));

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
				thisEvaluation.result = common.cloneWithout(result, [runs["history"], runs["sessionHistory"], vendetta.plugin.storage], "not saved");

				if (history.saveContext) thisEvaluation.context = common.cloneWithout(interaction, [runs["history"], runs["sessionHistory"], vendetta.plugin.storage], "not saved");
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
			const message = {
				channelId: channel.id,
				content: "",
				embeds: [],
			};
			const outputEmbed = {
				type: "rich",
				color: EMBED_COLOR(errored ? "dissatisfactory" : "satisfactory"),
			};
			message.embeds.push(outputEmbed);

			if (outputSettings["fixPromiseProps"] && result?.constructor?.name === "Promise") result = common.fixPromiseProps(result);

			let processedResult = outputSettings["useToString"] ? result.toString() : inspect(result, outputSettings["inspect"]);

			if (errored) {
				const { stack, trim } = outputSettings["errors"];
				if (stack) processedResult = result.stack;
				if (trim) processedResult = processedResult.split("    at ?anon_0_?anon_0_evaluate")[0];
			}

			if (typeof outputSettings["trim"] === "number" && outputSettings["trim"] < processedResult.length) processedResult = processedResult.slice(0, outputSettings["trim"]);

			if (outputSettings["codeblock"].enabled) {
				const { lang, escape } = outputSettings["codeblock"];
				processedResult = common.codeblock(processedResult, lang, escape);
			}
			if (outputSettings["location"] === 0) {
				message.content = processedResult;
			} else {
				outputEmbed.description = processedResult;
			}

			if (outputSettings["info"].enabled) {
				const { hints, prettyTypeof } = outputSettings.info;
				let info = [prettyTypeof ? common.prettyTypeof(result) : typeof result];
				if (hints) {
					let hint;
					if (result === undefined && !code.includes("return")) hint = "use 'return'";

					if (hint) info.push(`hint: ${hint}`);
				}
				info.push(`took: ${elapsed}ms`);

				if (outputSettings["location"] === 0) {
					outputEmbed.description = info.join("\n");
				} else {
					outputEmbed.footer = { text: info.join("\n") };
				}
			}

			if (outputSettings["sourceEmbed"].enabled) {
				const {
					codeblock: { codeblockEnabled, language, escape },
					name,
				} = outputSettings["sourceEmbed"];

				const embed = {
					type: "rich",
					color: EMBED_COLOR("source"),
					description: code,
					footer: { text: `length: ${code.length}` },
				};
				message.embeds.push(embed);
				if (name) embed.provider = { name };
				if (codeblockEnabled) embed.description = hlp.codeblock(embed.description, language, escape);
				let newlineCount = code.split("").filter(($) => $ === "\n").length;
				if (newlineCount < 0) embed.footer.text += `\nnewlines: ${newlineCount}`;
			}
			sendMessage(message, messageMods);
		}
		if (!errored && args.get("return")?.value) {
			triggerAutorun("command_before_return", (code) => eval(code));
			return result;
		}
		if (errored && silent) {
			console.error(result)
			console.log(result.stack)
			alert("An error ocurred while running your silent & returned eval\n" + result.stack)
		}
	} catch (e) {
		console.error(e);
		console.log(e.stack);
		alert("An uncatched error was thrown while running /eval\n" + e.stack);
	}
	triggerAutorun("command_after", (code) => eval(code));
}
plugin = {
	...vendetta.plugin,
	patches: [],
	onUnload() {
		triggerAutorun("plugin_onUnload", (code) => eval(code));
		this.patches.forEach((up) => up()); // unpatch every patch
		this.patches = [];
	},
	onLoad() {
		try {
			triggerAutorun("plugin_onLoad", (code) => eval(code));
			this.command(execute);
		} catch (e) {
			console.error(e);
			console.log(e.stack);
			alert(`There was an error while loading the plugin "${plugin.name}"\n${e.stack}`);
		}
	},
	command(execute) {
		if (this.commandPatch) {
			this.patches.splice(
				this.patches.findIndex(($) => $ === this.commandPatch),
				1
			)?.();
		}
		const { defaults, command } = storage.settings;
		console.log("meow");
		this.commandPatch = registerCommand(
			common.cmdDisplays({
				execute,
				type: 1,
				inputType: 1,
				applicationId: "-1",
				name: command["name"] ?? "!eval",
				description: "Evaluates code",
				options: [
					{
						required: true,
						type: 3,
						// autocomplete: true,
						name: "code",
						description: "Code to evaluate",
					},
					{
						type: 5,
						name: "silent",
						description: `Show the output of the evaluation? (default: ${defaults["silent"]})`,
					},
					{
						type: 5,
						name: "return",
						description: `Return the returned value? (so it works as a real command, default: ${defaults["return"]})`,
					},
					{
						type: 5,
						name: "global",
						description: `Evaluate the code in the global scope? (default: ${defaults["global"]})`,
					},
					{
						type: 5,
						name: "await",
						description: `await the evaluation? (default: ${defaults["await"]})`,
					},
				],
			})
		);
		this.patches.push(this.commandPatch);
	},
};
export default plugin;
triggerAutorun("plugin_after_exports", (code) => eval(code));
