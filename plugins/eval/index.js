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
/**
 * @typedef {Object} Autorun
 * @property {number} createdAt Autorun creation timestamp
 * @property {string} [name] The name of the autorun
 * @property {string} [description] The description of the autorun
 * @property {boolean} enabled Whether the autorun is enabled
 * @property {!Object} customId The custom ID of the autorun (Must be an object)
 * @property {boolean | 1} [once] Whether the autorun should only run once (1=delete on restart after running, true=just disable after running)
 * @property {string} type The type of the autorun
 * @property {string} code The code to evaluate when the autorun is triggered
 * @property {boolean} [deleting] Whether the autorun is scheduled for deletion on restart
 * @property {boolean} [builtin] Whether the autorun is built into theplugin
 */

/* Adds an autorun
 * @param {string} type Type of the autorun
 * @param {!Object} customId Custom id of the autorun for use in finding and deleting
 * @param {string} code Code to eval when the autorun triggers
 * @param {Object} options Additional options
 *
 * @returns {Object:Autorun} the autorun that was added
 */
export function addAutorun(type, customId, code, options = {}) {
	const {
		autoruns,
		settings: {
			output: {
				error: { stack },
			},
		},
	} = storage;

	if (!BUILTIN_AUTORUN_TYPES.includes(type)) {
		const e = new Error(`Type "${type}" is invalid${stack.enabled ? "" : ". Enable error stack to see valid types"}`);
		throw ((e.valid_types = ["1", "666"]), e);
	}
	if (typeof customId === "object") throw new Error("customId must not be the type of object");
	if (customId === "random") customId = common.rng(0, 1e6, 0);
	if (autoruns.filter(($) => !$.builtin).find((a) => a.customId === customId)) throw new Error(`Custom id "${customId}" is already being used, please use a different one`);
	if (!code || typeof code !== "string") throw new Error("Invalid code passed");
	if (options.once !== undefined && ![true, false, 1].includes(options.once)) throw new Error("options.once must be a boolean or a 1");
	const newAutorun = {
		createdAt: +new Date(),
		name: options?.name,
		description: options?.description,
		enabled: options?.enabled ?? false,
		customId,
		once: options?.once ?? false,
		type,
		code,
	};
	autoruns.push(newAutorun);
	return newAutorun;
}

/* Deletes an autorun
 * @param {Object:Autorun | !Object} autorun Autorun itself or it's customId
 * @returns
 */
export function deleteAutorun(autorun, builtin) {
	let aruns = storage.autoruns;
	if (builtin) aruns = aruns.filter(($) => !$.builtin);
	const autorunFound = aruns.find((a) => (a.customId === (typeof autorun === "object") ? autorun?.customId : autorun));
	if (!autorunFound) {
		const e = new Error("Autorun not found");
		throw ((e.autorun = autorun), (e.autorunFound = autorunFound), e);
	}
	storage.autoruns = aruns.filter(($) => $.customId !== autorunFound.customId);
}

/* Triggers a type of autoruns
 * @param {string} type The type of the autorun group
 * @param {function} fn
 *
 * @returns undefined
 */
export function triggerAutorun(type, fn) {
	if (storage.settings.autoruns.enabled === false) return;
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

			if (autorun.once === true) {
				autorun.enabled = false;
			} else if (autorun.once === 1) {
				autorun.deleting = true;
				autorun.enabled = false;
			}
		} catch (e) {
			e.message = `Failed to execute autorun ${autorun.name ?? "No Name"} (${index}${optimizations ? ", optimized" : ""}). ` + e.message;
			console.error(e);
			console.log(e.stack);
		}
		index++;
	}
	triggerAutorun("autorun_after", (code) => eval(code));
}
common.makeDefaults(storage, {
	autoruns: [
		{
			createdAt: +new Date(),
			name: "example autorun", // NOTE:settings: capitalize the first letter against their will
			description: "Example autorun, for more autorun types >> return util.BUILTIN_AUTORUN_TYPES",
			enabled: false,
			customId: 0,
			once: false,
			type: "plugin_onLoad",
			code: `alert("plugin_onLoad\nto disable this popup, run: /"+plugin.storage.settings.command.name+" code:plugin.storage.autoruns.find(a => a.name === \"example autorun\").enabled = false")`,
		},
		{
			builtin: true, // NOTE:settings: only show these with nerd mode on
			createdAt: +new Date(),
			name: "Filter 'deleting' autoruns",
			description: undefined, // NOTE:settings: in this case don't show the description element in ui at all
			enabled: true,
			customId: 0,
			once: false,
			type: "plugin_onLoad",
			code: "storage.autoruns = storage.autoruns.filter($=>!$?.deleting)",
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
			saveContext: false, // save the "interaction" and "plugin" variables passed to the evaluation
			saveOnError: false, // whether to save the "interaction" & "plugin" variables
			checkLatestDupes: true, // not functional 🔥, basically prevents from saving multiple /!eval's with the same args 'n output
		},
		autoruns: {
			enabled: true, // whether to run autoruns at all
			optimization: false, // false make proper index number in error messag (faulty code prop related)
		},
		output: {
			location: 0, // location for the output string itself. 0: content, 1: embed
			trim: 15000, // Number: enabled, specifies end; false: disabled
			fixPromiseProps: true, // makes the output not have minified prop names in await: false
			hideSensitive: true, // hide sensitive props (only does for interaction.user
			sourceEmbed: {
				name: "Code", // title of the embed
				enabled: true, // show the source code embed in the output message
				codeblock: {
					enabled: true, // use codeblock in the output
					escape: true, // escape all ``'s so it can't be f#cked up
					lang: "js", // language to use in the codeblock
				},
			},
			info: {
				enabled: true,
				prettyTypeof: true, // use the pretty typeof function i made
				hints: true,
			},
			useToString: false, // (value).toString() instead of inpect(value)
			inspect: {
				// this is passed as a whole to the inspect function's second argument. https://nodejs.org/api/util.html#:~:text=or%20Object.-,options,-%3CObject%3E
				showHidden: false,
				depth: 3,
				maxArrayLength: 15,
				compact: 2,
				numericSeparator: true,
				getters: false,
			},
			codeblock: {
				// same as in the codeblock settings in sourceEmbed
				enabled: true,
				escape: true,
				lang: "js",
			},
			errors: {
				trim: true, // try remove unnecesary stack
				stack: true, // show stack
			},
		},
		defaults: {
			// defult choices for the arguments if no value is passed
			await: true,
			global: false,
			return: false,
			silent: false,
		},
		command: {
			name: "!eval",
			// command name
			// /!eval code:...
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
	usedInSession = false; // TODO: get rid of this
function sendMessage() {
	if (window.sendMessage) return window.sendMessage?.(...arguments);
	if (!madeSendMessage) madeSendMessage = common.mSendMessage(vendetta);
	return madeSendMessage(...arguments);
}
const tini = (number) => (number < 100 ? `${number}ms` : `${number / 1000}s`);
async function execute(rawArgs, ctx) {
	try {
		const ranAt = +new Date();
		const { settings, stats } = storage;
		const { history, defaults, output: outputSettings } = settings;
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
			const _ = currentUser;
			currentUser = { ...currentUser };
			Object.defineProperty(currentUser, "_", {
				value: _,
				enumerable: false,
			});
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
			triggerAutorun("command_autocomplete_before", (code) => eval(code));
			triggerAutorun("command_autocomplete_after", (code) => eval(code));
			return; // TODO: figure out what in the world do i need to return here (make history work)
			// NOTE: the chat bar shows the name instead of value, so we gotta improvise
			// when you change the name in the chat bar it treats it as
			// autocomplete item: {
			//   value: code,
			//   name: "/* [${time!== today?00.00${year!==currentYear ? `.${year}` : ""}: ""} 00:00:00] */\n"+code
			// }
		}

		const { channel, args } = interaction,
			code = args.get("code")?.value,
			aweight = args.get("await")?.value ?? defaults["await"],
			silent = args.get("silent")?.value ?? defaults["silent"],
			global = args.get("global")?.value ?? defaults["global"];
		if (typeof code !== "string") throw new Error("No code argument passed");
		const evalEnv = {
			interaction,
			plugin,
			util: { addAutorun, deleteAutorun, sendMessage, common, evaluate, BUILTIN_AUTORUN_TYPES, triggerAutorun },
		};

		triggerAutorun("evaluate_before", (code) => eval(code));
		let { result, errored, timings } = await evaluate(code, aweight, global, evalEnv);
		triggerAutorun("evaluate_after", (code) => eval(code));

		let thisEvaluation = {};
		if (history.enabled) {
			thisEvaluation = {
				_v: 0,
				session: runs["plugin"], // NOTE:settings: use this for time separators (like in discord message lists)
				code,
				errored,
			};
			Object.defineProperty(thisEvaluation, "_v", {
				enumerable: false,
			});
			if (!interaction.dontSaveResult) {
				const filter = [window, runs["history"], runs["sessionHistory"], vendetta.plugin.storage];
				try {
					thisEvaluation.result = common.cloneWithout(result, filter, "not saved");

					if (history.saveContext) thisEvaluation.context = common.cloneWithout({ interaction, plugin }, filter, "not saved"); // NOTE:settings: use this to show channel and server
				} catch (error) {
					// TODO: fix circular
					error.message = "Not saved because of: " + error.message;
					thisEvaluation.result = error;
				}
			}
			(() => {
				if (errored) return runs["failed"]++;
				runs["succeeded"]++;
				if (!history.saveOnError) return;
				//if (history.checkLatestDupes && runs["sessionHistory"].at(-1)?.code === thisEvaluation.code) return;
				runs["history"].push(thisEvaluation);
				runs["sessionHistory"].push(thisEvaluation);
			})();
		}

		if (!silent) {
			thisEvaluation.timing = { command: ranAt, evaluate: timings, process: [+new Date()] };
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
			thisEvaluation.processedResult = processedResult;
			if (errored) {
				const { stack, trim } = outputSettings["errors"];
				if (stack && result.stack !== undefined && typeof result.stack === "string") processedResult = result.stack;
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
				let rows = [["", prettyTypeof ? common.prettyTypeof(result) : typeof result]];
				if (hints) {
					let hint;
					if (result === undefined && !code.includes("return")) hint = `"return" the value to be shown here`;
					if (["ReferenceError", "TypeError", undefined].includes(result?.constructor?.name)) {
						if (code.includes("interaction.plugin.meta")) hint = `use the "plugin" env variable`;
						if (code.includes("util.hlp") && !code.includes("util.common")) hint = `"util.hlp" was renamed to "util.common"`;
					}
					if (hint) rows.push(["hint", hint]);
				}
				rows.push(["took", tini(timings[1] - timings[0])]);
				outputEmbed.rawOutputInfoRows = rows;
				if (outputSettings["location"] === 0) {
					outputEmbed.description = common.processRows(rows);
				} else {
					outputEmbed.footer = { text: common.processRows(rows) };
				}
			}

			if (outputSettings["sourceEmbed"].enabled) {
				const {
					codeblock: { enabled: wrap, language, escape },
					name,
				} = outputSettings["sourceEmbed"];

				const sourceEmbed = {
					type: "rich",
					color: EMBED_COLOR("source"),
				};
				message.embeds.push(sourceEmbed);

				if (typeof name === "object" && "name" in name) sourceEmbed.provider = name; // NOTE: idk if this storage entry saves properly after you restar (think makeDefaults)
				if (typeof name === "string") sourceEmbed.title = name;
				if (wrap) sourceEmbed.description = common.codeblock(code, language, escape);
				if (true) {
					// outputSettings.sourceEmbed.info
					const rows = [["length", code.length]];
					sourceEmbed.rawSourceInfoRows = rows;
					let lineCount = code.split("\n").length; // here lied a peanut brain moment
					if (lineCount < 0) rows.push(["lines", lineCount]);

					sourceEmbed.footer = {
						text: common.processRows(rows),
					};
				}
			}
			const sent = sendMessage(message, messageMods);
			thisEvaluation.timing.process[1] = +new Date();

			if (outputSettings["info"].enabled) {
				const msgMods = {
					...messageMods,
					id: sent.id,
					edited_timestamp: Date.now(),
				};
				const {
					timing: { process },
				} = thisEvaluation;
				outputEmbed.rawOutputInfoRows.push(["processed", tini(process[1] - process[0])]);

				if (outputSettings["location"] === 0) {
					outputEmbed.description = common.processRows(outputEmbed.rawOutputInfoRows);
				} else {
					outputEmbed.footer.text = common.processRows(outputEmbed.rawOutputInfoRows);
				}
				sendMessage(message, msgMods);
			}
		}
		if (!errored && args.get("return")?.value) {
			triggerAutorun("command_before_return", (code) => eval(code));
			return result;
		}
		if (errored && silent) {
			console.error(result);
			console.log(result.stack);
			alert("An error ocurred while running your silent & returned eval\n" + result.stack);
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
	// TODO: settings, // if you pr this - you are the main maintainer of it. ping me in Exyl's server's bot channel for me to open dms with you
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
