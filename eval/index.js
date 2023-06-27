(function (exports, commands, metro, plugin$2, ui) {
	'use strict';

	function cmdDisplays(obj, translations, locale) {
	  if (!obj?.name || !obj?.description)
	    throw new Error(`No name(${obj?.name}) or description(${obj?.description}) in the passed command (command name: ${obj?.name})`);
	  obj.displayName ??= translations?.names?.[locale] ?? obj.name;
	  obj.displayDescription ??= translations?.names?.[locale] ?? obj.description;
	  if (obj.options) {
	    if (!Array.isArray(obj.options))
	      throw new Error(`Options is not an array (received: ${typeof obj.options})`);
	    for (var optionIndex = 0; optionIndex < obj.options.length; optionIndex++) {
	      const option = obj.options[optionIndex];
	      if (!option?.name || !option?.description)
	        throw new Error(`No name(${option?.name}) or description(${option?.description} in the option with index ${optionIndex}`);
	      option.displayName ??= translations?.options?.[optionIndex]?.names?.[locale] ?? option.name;
	      option.displayDescription ??= translations?.options?.[optionIndex]?.descriptions?.[locale] ?? option.description;
	      if (option?.choices) {
	        if (!Array.isArray(option?.choices))
	          throw new Error(`Choices is not an array (received: ${typeof option.choices})`);
	        for (var choiceIndex = 0; choiceIndex < option.choices.length; choiceIndex++) {
	          const choice = option.choices[choiceIndex];
	          if (!choice?.name)
	            throw new Error(`No name of choice with index ${choiceIndex} in option with index ${optionIndex}`);
	          choice.displayName ??= translations?.options?.[optionIndex]?.choices?.[choiceIndex]?.names?.[locale] ?? choice.name;
	        }
	      }
	    }
	  }
	  return obj;
	}
	function generateStr(chars) {
	  let length = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 27;
	  if (typeof chars !== "string")
	    throw new Error("Passed chars isn't a string");
	  if (chars?.length <= 0)
	    throw new Error("Invalid chars length");
	  let result = "";
	  for (let i = 0; i < length; i++)
	    result += chars[Math.floor(Math.random() * chars.length)];
	  return result;
	}
	function areArraysEqual(arr1, arr2) {
	  if (arr1.length !== arr2.length)
	    return false;
	  for (let i = 0; i < arr1.length; i++) {
	    const item1 = arr1[i];
	    const item2 = arr2[i];
	    if (Array.isArray(item1) && Array.isArray(item2)) {
	      if (!areArraysEqual(item1, item2))
	        return false;
	    } else if (typeof item1 === "object" && typeof item2 === "object") {
	      if (!areArraysEqual(Object.values(item1), Object.values(item2)))
	        return false;
	    } else if (item1 !== item2) {
	      return false;
	    }
	  }
	  return true;
	}
	function cloneWithout(value, without, replace) {
	  if (typeof value !== "object")
	    return value;
	  if (without.some(function($) {
	    return Array.isArray($) ? Array.isArray(value) ? areArraysEqual($, value) : false : $ === value;
	  }))
	    return replace;
	  const newObj = Array.isArray(value) ? [] : {};
	  for (const key in value) {
	    if (Array.isArray(value[key])) {
	      newObj[key] = cloneWithout(value[key], without, replace);
	    } else if (without.includes(value[key])) {
	      newObj[key] = replace;
	    } else {
	      newObj[key] = cloneWithout(value[key], without, replace);
	    }
	  }
	  return newObj;
	}
	function mSendMessage(vendetta) {
	  const { metro } = vendetta;
	  const { receiveMessage } = metro.findByProps("sendMessage", "receiveMessage");
	  const { createBotMessage } = metro.findByProps("createBotMessage");
	  const Avatars = metro.findByProps("BOT_AVATARS");
	  return function(message, mod) {
	    message.channelId ??= metro.findByStoreName("SelectedChannelStore").getChannelId();
	    if ([
	      null,
	      void 0
	    ].includes(message.channelId))
	      throw new Error("No channel id to receive the message into (channelId)");
	    if (mod !== void 0 && "author" in mod) {
	      if ("avatar" in mod.author && "avatarURL" in mod.author) {
	        Avatars.BOT_AVATARS[mod.author.avatar] = mod.author.avatarURL;
	        delete mod.author.avatarURL;
	      }
	    }
	    let msg = mod === true ? message : createBotMessage(message);
	    if (typeof mod === "object")
	      msg = vendetta.metro.findByProps("merge").merge(msg, mod);
	    receiveMessage(message.channelId, msg);
	    return msg;
	  };
	}
	function prettyTypeof(value) {
	  const name = [
	    value?.constructor?.name
	  ];
	  name[0] ??= "Undefined";
	  if (name[0] !== "Undefined" && value?.prototype?.constructor === value && typeof value === "function") {
	    name[0] = "Class";
	    name[1] = `(${value.name})`;
	  } else if (value === null) {
	    name[1] = "null";
	  } else if ([
	    "symbol",
	    "function"
	  ].includes(typeof value) && value?.name) {
	    name[1] = `(${value.name})`;
	  } else if (typeof value === "boolean") {
	    name[1] = `${value}`;
	  } else if (typeof value === "string") {
	    name[1] = value.length;
	  } else if (typeof value === "number" && value !== 0) {
	    const expo = value.toExponential();
	    if (!expo.endsWith("e+1") && !expo.endsWith("e+0"))
	      name[1] = expo;
	  }
	  return name.join(" ");
	}
	function makeDefaults(object, defaults) {
	  if (object === void 0)
	    throw new Error("No object passed to make defaults for");
	  if (defaults === void 0)
	    throw new Error("No defaults object passed to make defaults off of");
	  for (const key in defaults) {
	    if (typeof defaults[key] === "object" && !Array.isArray(defaults[key])) {
	      if (typeof object[key] !== "object")
	        object[key] = {};
	      makeDefaults(object[key], defaults[key]);
	    } else {
	      object[key] ??= defaults[key];
	    }
	  }
	  return object;
	}
	const EMOJIS = {
	  loadingDiscordSpinner: "a:loading:1105495814073229393",
	  aol: "a:aol:1108834296359301161",
	  linuth: ":linuth:1110531631409811547",
	  fuckyoy: ":fuckyoy:1108360628302782564",
	  getLoading() {
	    return Math.random() < 0.01 ? this?.aol : this.loadingDiscordSpinner;
	  },
	  getFailure() {
	    return Math.random() < 0.01 ? this?.fuckyoy : this.linuth;
	  },
	  getSuccess() {
	    return "";
	  }
	};
	const AVATARS = {
	  command: "https://cdn.discordapp.com/attachments/1099116247364407337/1112129955053187203/command.png"
	};

	var hlp = /*#__PURE__*/Object.freeze({
		__proto__: null,
		AVATARS: AVATARS,
		EMOJIS: EMOJIS,
		areArraysEqual: areArraysEqual,
		cloneWithout: cloneWithout,
		cmdDisplays: cmdDisplays,
		generateStr: generateStr,
		mSendMessage: mSendMessage,
		makeDefaults: makeDefaults,
		prettyTypeof: prettyTypeof
	});

	const { inspect } = metro.findByProps("inspect"), authorMods = {
	  author: {
	    username: "eval",
	    avatar: "command",
	    avatarURL: AVATARS.command
	  }
	}, AsyncFunction = async function() {
	}.constructor, VARIATION_SELECTOR_69 = "\u{E0134}";
	makeDefaults(vendetta.plugin.storage, {
	  stats: {
	    runs: {
	      history: [],
	      failed: 0,
	      succeeded: 0,
	      plugin: 0,
	      sessionHistory: []
	    }
	  },
	  settings: {
	    history: {
	      enabled: true,
	      saveContext: false,
	      saveOnError: false,
	      checkLatestDupes: true
	    },
	    output: {
	      location: 0,
	      trim: 15e3,
	      sourceEmbed: true,
	      info: {
	        enabled: true,
	        prettyTypeof: true,
	        hints: true
	      },
	      useToString: false,
	      inspect: {
	        showHidden: false,
	        depth: 3,
	        maxArrayLength: 15,
	        compact: 2,
	        numericSeparator: true,
	        getters: false
	      },
	      codeblock: {
	        enabled: true,
	        escape: true,
	        language: "js\n"
	      },
	      errors: {
	        trim: true,
	        stack: true
	      }
	    },
	    defaults: {
	      await: true,
	      global: false,
	      silent: false
	    },
	    command: {
	      name: "!eval",
	      predicate: function() {
	        return true;
	      }
	    }
	  }
	});
	const { meta: { resolveSemanticColor } } = metro.findByProps("colors", "meta");
	const ThemeStore = metro.findByStoreName("ThemeStore");
	const EMBED_COLOR = function(color) {
	  return parseInt(resolveSemanticColor(ThemeStore.theme, ui.semanticColors.BACKGROUND_SECONDARY).slice(1), 16);
	};
	let madeSendMessage, plugin, usedInSession = false;
	function sendMessage() {
	  if (window.sendMessage)
	    return window.sendMessage?.(...arguments);
	  if (!madeSendMessage)
	    madeSendMessage = mSendMessage(vendetta);
	  return madeSendMessage(...arguments);
	}
	async function evaluate(code, aweight, global) {
	  let that = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : {};
	  let result, errored = false, start = +new Date();
	  try {
	    const args = [];
	    if (!global)
	      args.push(...Object.keys(that));
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
	  return {
	    result,
	    errored,
	    start,
	    end,
	    elapsed: end - start
	  };
	}
	plugin = {
	  meta: vendetta.plugin,
	  patches: [],
	  onUnload() {
	    this.patches.forEach(function(up) {
	      return up();
	    });
	    this.patches = [];
	  },
	  onLoad() {
	    let UserStore;
	    try {
	      this.command(execute);
	      async function execute(rawArgs, ctx) {
	        UserStore ??= metro.findByStoreName("UserStore");
	        if (!usedInSession) {
	          usedInSession = true;
	          plugin$2.storage["stats"]["runs"]["plugin"]++;
	          plugin$2.storage["stats"]["runs"]["sessionHistory"] = [];
	        }
	        const currentUser = UserStore.getCurrentUser();
	        const messageMods = {
	          ...authorMods,
	          interaction: {
	            name: "/" + this.displayName,
	            user: currentUser
	          }
	        };
	        const interaction = {
	          messageMods,
	          ...ctx,
	          user: currentUser,
	          args: new Map(rawArgs.map(function(o) {
	            return [
	              o.name,
	              o
	            ];
	          })),
	          rawArgs,
	          plugin
	        };
	        try {
	          const { channel, args } = interaction;
	          const code = args.get("code")?.value;
	          if (typeof code !== "string")
	            throw new Error("No code argument passed");
	          const settings = plugin$2.storage["settings"];
	          const defaults = settings["defaults"];
	          const aweight = args.get("await")?.value ?? defaults["await"];
	          const silent = args.get("silent")?.value ?? defaults["silent"];
	          const global = args.get("global")?.value ?? defaults["global"];
	          const { result, errored, start, end, elapsed } = await evaluate(code, aweight, global, {
	            interaction,
	            util: {
	              sendMessage,
	              hlp,
	              VARIATION_SELECTOR_69,
	              evaluate
	            }
	          });
	          const { runs } = plugin$2.storage["stats"], history = settings["history"];
	          let thisEvaluation;
	          if (history.enabled) {
	            thisEvaluation = {
	              session: runs["plugin"],
	              start,
	              end,
	              elapsed,
	              code,
	              errored
	            };
	            if (!interaction.dontSaveResult) {
	              thisEvaluation.result = cloneWithout(result, [
	                runs["history"],
	                runs["sessionHistory"],
	                vendetta.plugin.storage
	              ], "not saved");
	              if (history.saveContext)
	                thisEvaluation.context = cloneWithout(interaction, [
	                  runs["history"],
	                  runs["sessionHistory"],
	                  vendetta.plugin.storage
	                ], "not saved");
	            }
	            (function() {
	              if (!history.saveOnError && errored)
	                return runs["failed"]++;
	              runs["succeeded"]++;
	              runs["history"].push(thisEvaluation);
	              runs["sessionHistory"].push(thisEvaluation);
	            })();
	          }
	          if (!silent) {
	            const outputSettings = settings["output"];
	            let outputStringified = outputSettings["useToString"] ? result.toString() : inspect(result, outputSettings["inspect"]);
	            if (errored) {
	              const errorSettings = outputSettings["errors"];
	              if (errorSettings["stack"])
	                outputStringified = result.stack;
	              if (errorSettings["trim"])
	                outputStringified = outputStringified.split("    at ?anon_0_?anon_0_evaluate")[0];
	            }
	            if (typeof outputSettings["trim"] === "number" && outputSettings["trim"] < outputStringified.length)
	              outputStringified = outputStringified.slice(0, outputSettings["trim"]);
	            if (outputSettings["codeblock"].enabled) {
	              if (outputSettings["codeblock"].escape)
	                outputStringified = outputStringified.replace("```", "`" + VARIATION_SELECTOR_69 + "``");
	              outputStringified = "```" + outputSettings["codeblock"].language + outputStringified + "```";
	            }
	            let infoString;
	            if (outputSettings["info"].enabled) {
	              let type = outputSettings["info"].prettyTypeof ? prettyTypeof(result) : "type: " + typeof result;
	              if (errored)
	                type = `Error (${type})`;
	              const hint = outputSettings["info"]["hints"] ? result === "undefined" && !code.includes("return") ? "hint: use the return keyword\n" : "" : "";
	              infoString = `${type}
${hint}took: ${elapsed}ms`;
	            }
	            let sourceFooterString = `length: ${code.length}`;
	            let newlineCount = code.split("").filter(function($) {
	              return $ === "\n";
	            }).length;
	            if (newlineCount < 0)
	              sourceFooterString += `
newlines: ${newlineCount}`;
	            if (errored) {
	              sendMessage({
	                channelId: channel.id,
	                content: !outputSettings["location"] ? outputStringified : void 0,
	                embeds: [
	                  {
	                    type: "rich",
	                    color: EMBED_COLOR("exploded"),
	                    title: "Error returned",
	                    description: outputSettings["location"] ? outputStringified : outputSettings["info"].enabled ? infoString : void 0,
	                    footer: outputSettings["info"].enabled ? outputSettings["location"] ? {
	                      infoString
	                    } : void 0 : void 0
	                  },
	                  !outputSettings["sourceEmbed"] ? void 0 : {
	                    type: "rich",
	                    color: EMBED_COLOR("source"),
	                    title: "Code",
	                    description: code,
	                    footer: {
	                      text: sourceFooterString
	                    }
	                  }
	                ].filter(function($) {
	                  return $ !== void 0;
	                })
	              }, messageMods);
	            }
	            if (!errored)
	              sendMessage({
	                channelId: channel.id,
	                content: !outputSettings["location"] ? outputStringified : void 0,
	                embeds: [
	                  {
	                    type: "rich",
	                    color: EMBED_COLOR("satisfactory"),
	                    description: outputSettings["location"] ? outputStringified : outputSettings["info"].enabled ? infoString : void 0,
	                    footer: outputSettings["info"].enabled ? outputSettings["location"] ? {
	                      infoString
	                    } : void 0 : void 0
	                  },
	                  !outputSettings["sourceEmbed"] ? void 0 : {
	                    type: "rich",
	                    color: EMBED_COLOR("source"),
	                    title: "Code",
	                    description: code,
	                    footer: {
	                      text: sourceFooterString
	                    }
	                  }
	                ].filter(function($) {
	                  return $ !== void 0;
	                })
	              }, messageMods);
	          }
	          if (!errored && args.get("return")?.value)
	            return result;
	        } catch (e) {
	          console.error(e);
	          console.log(e.stack);
	          alert("An uncatched error was thrown while running /eval\n" + e.stack);
	        }
	      }
	    } catch (e) {
	      console.error(e);
	      console.log(e.stack);
	      alert(`There was an error while loading the plugin "${plugin.meta.name}"
${e.stack}`);
	    }
	  },
	  command(execute) {
	    var _this = this;
	    if (this.commandPatch) {
	      this.patches.splice(this.patches.findIndex(function($) {
	        return $ === _this.commandPatch;
	      }), 1)?.();
	    }
	    this.commandPatch = commands.registerCommand(cmdDisplays({
	      execute,
	      predicate: plugin$2.storage["settings"]["command"].predicate ?? function() {
	        return true;
	      },
	      type: 1,
	      inputType: 1,
	      applicationId: "-1",
	      name: plugin$2.storage["settings"]["command"].name ?? "!eval",
	      description: "Evaluates code",
	      options: [
	        {
	          required: true,
	          type: 3,
	          name: "code",
	          description: "Code to evaluate"
	        },
	        {
	          type: 5,
	          name: "silent",
	          description: `Show the output of the evaluation? (default: ${plugin$2.storage["settings"]["defaults"]["silent"] ?? true})`
	        },
	        {
	          type: 5,
	          name: "return",
	          description: `Return the returned value? (so it works as a real command, default: ${plugin$2.storage["settings"]["defaults"]["return"]})`
	        },
	        {
	          type: 5,
	          name: "global",
	          description: `Evaluate the code in the global scope? (default: ${plugin$2.storage["settings"]["defaults"]["global"] ?? false})`
	        },
	        {
	          type: 5,
	          name: "await",
	          description: `await the evaluation? (default: ${plugin$2.storage["settings"]["defaults"]["await"] ?? true})`
	        }
	      ]
	    }));
	    this.patches.push(this.commandPatch);
	  }
	};
	var plugin$1 = plugin;

	exports.EMBED_COLOR = EMBED_COLOR;
	exports.default = plugin$1;

	Object.defineProperty(exports, '__esModule', { value: true });

	return exports;

})({}, vendetta.commands, vendetta.metro, vendetta.plugin, vendetta.ui);
