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
	  for (let i1 = 0; i1 < length; i1++)
	    result += chars[Math.floor(Math.random() * chars.length)];
	  return result;
	}
	function areArraysEqual(arr1, arr2) {
	  if (arr1.length !== arr2.length)
	    return false;
	  for (let i1 = 0; i1 < arr1.length; i1++) {
	    const item1 = arr1[i1];
	    const item2 = arr2[i1];
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
	  const { metro: { findByProps, findByStoreName, common: { lodash: { merge } } } } = vendetta;
	  const { sendMessage, receiveMessage } = findByProps("sendMessage", "receiveMessage");
	  const { createBotMessage } = findByProps("createBotMessage");
	  const Avatars = findByProps("BOT_AVATARS");
	  const { getChannelId: getFocusedChannelId } = findByStoreName("SelectedChannelStore");
	  return function(message, mod) {
	    message.channelId ??= getFocusedChannelId();
	    if ([
	      null,
	      void 0
	    ].includes(message.channelId))
	      throw new Error("No channel id to receive the message into (channelId)");
	    let msg = message;
	    if (message.reallySend) {
	      if (typeof mod === "object")
	        msg = merge(msg, mod);
	      return sendMessage(message.channelId, msg);
	    }
	    if (mod !== true)
	      msg = createBotMessage(msg);
	    if (typeof mod === "object") {
	      msg = merge(msg, mod);
	      if ("author" in mod)
	        (function processAvatarURL() {
	          const author = mod.author;
	          if ([
	            "avatar",
	            "avatarURL"
	          ].every(function(prop) {
	            return prop in author;
	          })) {
	            Avatars.BOT_AVATARS[author.avatar] = author.avatarURL;
	            delete author.avatarURL;
	          }
	        })();
	    }
	    receiveMessage(msg.channel_id, msg);
	    return msg;
	  };
	}
	async function awaitPromise(promiseFn) {
	  for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	    args[_key - 1] = arguments[_key];
	  }
	  let output = [
	    null,
	    null
	  ];
	  try {
	    output[0] = await promiseFn(...args);
	  } catch (error) {
	    output[1] = error;
	  }
	  return output;
	}
	function fixPromiseProps(insanePromise, mutate, removeOldKeys) {
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
		awaitPromise: awaitPromise,
		cloneWithout: cloneWithout,
		cmdDisplays: cmdDisplays,
		fixPromiseProps: fixPromiseProps,
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
	}.constructor, VARIATION_SELECTOR_69 = "\u{E0134}", BUILTIN_AUTORUN_TYPES = [
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
	  "evaluate_after"
	], triggerAutorun = function(type, fn) {
	  if ([
	    "autorun_before",
	    "autorun_after"
	  ].includes(type))
	    return;
	  triggerAutorun("autorun_before", function(code) {
	    return eval(code);
	  });
	  const optimizations = plugin$2.storage["settings"]["autoruns"]["optimizations"];
	  let autoruns = plugin$2.storage["autoruns"];
	  if (optimizations)
	    autoruns = autoruns.filter(function($) {
	      return $.type === type;
	    });
	  autoruns = autoruns.filter(function($) {
	    return $.enabled;
	  });
	  let index = 0;
	  for (const autorun of autoruns) {
	    try {
	      if (!optimizations && autorun.type !== type) {
	        index++;
	        continue;
	      }
	      fn(autorun.code);
	      plugin$2.storage["stats"]["autoruns"][autorun.type] = (plugin$2.storage["stats"]["autoruns"][autorun.type] ?? 0) + 1;
	      autorun.runs ??= 0;
	      autorun.runs++;
	    } catch (e) {
	      e.message = `Failed to execute autorun ${autorun.name ?? "No Name"} (${index}${optimizations ? ", optimized" : ""}). ` + e.message;
	      console.error(e);
	      console.log(e.stack);
	    }
	    index++;
	  }
	  triggerAutorun("autorun_after", function(code) {
	    return eval(code);
	  });
	};
	makeDefaults(vendetta.plugin.storage, {
	  autoruns: [
	    {
	      enabled: false,
	      type: "plugin_onLoad",
	      name: "example autorun (plugin_onLoad)",
	      description: "Example autorun, for more autorun types >> return utils.BUILTIN_AUTORUN_TYPES",
	      code: `/* eval()s this code when the plugin starts up */alert("plugin_onLoad")`
	    }
	  ],
	  stats: {
	    runs: {
	      history: [],
	      failed: 0,
	      succeeded: 0,
	      plugin: 0,
	      sessionHistory: []
	    },
	    autoruns: {}
	  },
	  settings: {
	    history: {
	      enabled: true,
	      saveContext: false,
	      saveOnError: false,
	      checkLatestDupes: true
	    },
	    autoruns: {
	      enabled: true,
	      optimization: false
	    },
	    output: {
	      location: 0,
	      trim: 15e3,
	      sourceEmbed: {
	        enabled: true,
	        codeblock: {
	          enabled: true,
	          escape: true,
	          language: "js\n"
	        }
	      },
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
	triggerAutorun("plugin_after_defaults", function(code) {
	  return eval(code);
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
	  triggerAutorun("evaluate_before", function(code) {
	    return eval(code);
	  });
	  let result, errored = false, start = +new Date();
	  try {
	    const args2 = [];
	    if (!global)
	      args2.push(...Object.keys(that));
	    args2.push(code);
	    let evalFunction = new AsyncFunction(...args2);
	    let i = 0;
	    for (var key of Object.keys(that)) {
	      args2[i] = that[key];
	      i++;
	    }
	    if (aweight) {
	      result = await evalFunction(...args2);
	    } else {
	      result = evalFunction(...args2);
	    }
	  } catch (e) {
	    result = e;
	    errored = true;
	  }
	  let end = +new Date();
	  const res = {
	    result,
	    errored,
	    start,
	    end,
	    elapsed: end - start
	  };
	  triggerAutorun("evaluate_after", function(code) {
	    return eval(code);
	  });
	  return res;
	}
	plugin = {
	  meta: vendetta.plugin,
	  patches: [],
	  onUnload() {
	    triggerAutorun("plugin_onUnload", function(code) {
	      return eval(code);
	    });
	    this.patches.forEach(function(up) {
	      return up();
	    });
	    this.patches = [];
	  },
	  onLoad() {
	    triggerAutorun("plugin_onLoad", function(code) {
	      return eval(code);
	    });
	    let UserStore;
	    try {
	      this.command(execute);
	      async function execute(rawArgs, ctx) {
	        triggerAutorun("command_before", function(code) {
	          return eval(code);
	        });
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
	        triggerAutorun("command_after_interaction_def", function(code) {
	          return eval(code);
	        });
	        if (interaction.autocomplete) {
	          return;
	          triggerAutorun("command_autocomplete_before", function(code) {
	            return eval(code);
	          });
	          triggerAutorun("command_autocomplete_after", function(code) {
	            return eval(code);
	          });
	        }
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
	              evaluate,
	              BUILTIN_AUTORUN_TYPES,
	              triggerAutorun
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
	              let type2 = outputSettings["info"].prettyTypeof ? prettyTypeof(result) : "type: " + typeof result;
	              if (errored)
	                type2 = `Error (${type2})`;
	              const hint = outputSettings["info"]["hints"] ? result === "undefined" && !code.includes("return") ? "hint: use the return keyword\n" : "" : "";
	              infoString = `${type2}
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
	                  !outputSettings["sourceEmbed"]?.enabled ? void 0 : {
	                    type: "rich",
	                    color: EMBED_COLOR("source"),
	                    title: "Code",
	                    description: function(code2) {
	                      const { enabled, escape, language } = outputSettings["sourceEmbed"].codeblock;
	                      if (enabled) {
	                        if (escape)
	                          code2 = code2.replace("```", "`" + VARIATION_SELECTOR_69 + "``");
	                        code2 = "```" + language + code2 + "```";
	                      }
	                      return code2;
	                    }(code),
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
	                  !outputSettings["sourceEmbed"]?.enabled ? void 0 : {
	                    type: "rich",
	                    color: EMBED_COLOR("source"),
	                    title: "Code",
	                    description: function(code2) {
	                      const { enabled, escape, language } = outputSettings["sourceEmbed"].codeblock;
	                      if (enabled) {
	                        if (escape)
	                          code2 = code2.replace("```", "`" + VARIATION_SELECTOR_69 + "``");
	                        code2 = "```" + language + code2 + "```";
	                      }
	                      return code2;
	                    }(code),
	                    footer: {
	                      text: sourceFooterString
	                    }
	                  }
	                ].filter(function($) {
	                  return $ !== void 0;
	                })
	              }, messageMods);
	          }
	          if (!errored && args.get("return")?.value) {
	            triggerAutorun("command_before_return", function(code) {
	              return eval(code);
	            });
	            return result;
	          }
	        } catch (e) {
	          console.error(e);
	          console.log(e.stack);
	          alert("An uncatched error was thrown while running /eval\n" + e.stack);
	        }
	        triggerAutorun("command_after", function(code) {
	          return eval(code);
	        });
	      }
	    } catch (e) {
	      console.error(e);
	      console.log(e.stack);
	      alert(`There was an error while loading the plugin "${plugin.meta.name}"
${e.stack}`);
	    }
	  },
	  command(execute2) {
	    var _this = this;
	    if (this.commandPatch) {
	      this.patches.splice(this.patches.findIndex(function($) {
	        return $ === _this.commandPatch;
	      }), 1)?.();
	    }
	    this.commandPatch = commands.registerCommand(cmdDisplays({
	      execute: execute2,
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
	triggerAutorun("plugin_after_exports", function(code) {
	  return eval(code);
	});

	exports.EMBED_COLOR = EMBED_COLOR;
	exports.default = plugin$1;

	Object.defineProperty(exports, '__esModule', { value: true });

	return exports;

})({}, vendetta.commands, vendetta.metro, vendetta.plugin, vendetta.ui);
