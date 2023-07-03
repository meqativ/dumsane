(function (exports, commands, metro, plugin$2, ui) {
	'use strict';

	function mSendMessage(vendetta) {
	  const { metro: { findByProps, findByStoreName, common: { lodash: { merge } } } } = vendetta;
	  const Send = findByProps("_sendMessage");
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
	    if (message.really) {
	      if (typeof mod === "object")
	        msg = merge(msg, mod);
	      const args = [
	        msg,
	        {}
	      ];
	      args[0].tts ??= false;
	      for (const key of [
	        "allowedMentions",
	        "messageReference"
	      ]) {
	        if (key in args[0]) {
	          args[1][key] = args[0][key];
	          delete args[0][key];
	        }
	      }
	      const overwriteKey = "overwriteSendMessageArg2";
	      if (overwriteKey in args[0]) {
	        args[1] = args[0][overwriteKey];
	        delete args[0][overwriteKey];
	      }
	      return Send._sendMessage(message.channelId, ...args);
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
	    Send.receiveMessage(msg.channel_id, msg);
	    return msg;
	  };
	}

	const ZWD = "\u200D", Promise_UNMINIFIED_PROPERTY_NAMES = [
	  "_deferredState",
	  "_state",
	  "_value",
	  "_deferreds"
	], PROMISE_STATE_NAMES = {
	  0: "pending",
	  1: "fulfilled",
	  2: "rejected",
	  3: "adopted"
	};
	function codeblock(text) {
	  let language = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "", escape = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : false;
	  if (!text)
	    throw new Error("No text to wrap in a codeblock provided");
	  if (escape)
	    text = text.replaceAll("```", `\`${ZWD}\`\``);
	  return `\`\`\`${language}
${text}
\`\`\``;
	}
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
	function generateRandomString(chars) {
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
	function fixPromiseProps(improperPromise) {
	  let mutate = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false, removeOldKeys = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : false;
	  const originalKeys = Object.getOwnPropertyNames(improperPromise);
	  if (originalKeys.length !== 4 || originalKeys.every(function(name, i) {
	    return Promise_UNMINIFIED_PROPERTY_NAMES[i] === name;
	  }))
	    throw new Error("The passed promise is already proper or isn't a promise");
	  let properPromise = {};
	  if (mutate)
	    properPromise = improperPromise;
	  Promise_UNMINIFIED_PROPERTY_NAMES.forEach(function(name, i) {
	    properPromise[name] = improperPromise[originalKeys[i]];
	    if (mutate && removeOldKeys)
	      delete properPromise[originalKeys[i]];
	  });
	  Object.setPrototypeOf(properPromise, improperPromise.__proto__);
	  return properPromise;
	}
	function prettyTypeof(value) {
	  const name = [
	    value?.constructor?.name
	  ];
	  name[0] ??= "Undefined";
	  if (name[0] === "Promise" && Object.getOwnPropertyNames(value).length === 4) {
	    const state = value["_state"] ?? value[Object.getOwnPropertyNames(value)[1]];
	    const stateName = PROMISE_STATE_NAMES[state];
	    if (stateName)
	      name[1] = `(${stateName})`;
	  } else if (name[0] !== "Undefined" && value?.prototype?.constructor === value && typeof value === "function") {
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
	    name[1] = value;
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
	  getLoading() {
	    return Math.random() < 0.01 ? this.aol : this.loadingDiscordSpinner;
	  },
	  getFailure() {
	    return Math.random() < 0.01 ? this.fuckyoy : this.linuth;
	  },
	  getSuccess() {
	    return "";
	  },
	  loadingDiscordSpinner: "a:loading:1105495814073229393",
	  aol: "a:aol:1108834296359301161",
	  linuth: ":linuth:1110531631409811547",
	  fuckyoy: ":fuckyoy:1108360628302782564"
	};
	const AVATARS = {
	  command: "https://cdn.discordapp.com/attachments/1099116247364407337/1112129955053187203/command.png"
	};

	var common = /*#__PURE__*/Object.freeze({
		__proto__: null,
		AVATARS: AVATARS,
		EMOJIS: EMOJIS,
		PROMISE_STATE_NAMES: PROMISE_STATE_NAMES,
		Promise_UNMINIFIED_PROPERTY_NAMES: Promise_UNMINIFIED_PROPERTY_NAMES,
		ZWD: ZWD,
		areArraysEqual: areArraysEqual,
		awaitPromise: awaitPromise,
		cloneWithout: cloneWithout,
		cmdDisplays: cmdDisplays,
		codeblock: codeblock,
		fixPromiseProps: fixPromiseProps,
		generateRandomString: generateRandomString,
		mSendMessage: mSendMessage,
		makeDefaults: makeDefaults,
		prettyTypeof: prettyTypeof
	});

	const AsyncFunction = async function() {
	}.constructor;
	async function evaluate(code) {
	  let aweight = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : true, global = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : false, that = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : {};
	  if (!code)
	    throw new Error("No code to evaluate");
	  let result, errored = false, start = +new Date();
	  try {
	    const args = [];
	    if (!global)
	      args.push(...Object.keys(that));
	    args.push(code);
	    let evalFunction = new AsyncFunction(...args);
	    Object.keys(that).forEach(function(name, index) {
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
	  const res = {
	    result,
	    errored,
	    start,
	    end,
	    elapsed: end - start
	  };
	  return res;
	}
	evaluate.SENSITIVE_PROPS = {
	  USER: [
	    "email",
	    "phone",
	    "mfaEnabled",
	    "hasBouncedEmail"
	  ]
	};

	const { inspect } = metro.findByProps("inspect"), authorMods = {
	  author: {
	    username: "eval",
	    avatar: "command",
	    avatarURL: AVATARS.command
	  }
	}, BUILTIN_AUTORUN_TYPES = [
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
	];
	function triggerAutorun(type, fn) {
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
	      plugin$2.storage["stats"]["autoruns"][autorun.type] ??= 0;
	      plugin$2.storage["stats"]["autoruns"][autorun.type]++;
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
	}
	makeDefaults(vendetta.plugin.storage, {
	  autoruns: [
	    {
	      enabled: false,
	      type: "plugin_onLoad",
	      name: "example autorun (plugin_onLoad)",
	      description: "Example autorun, for more autorun types >> return util.BUILTIN_AUTORUN_TYPES",
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
	      fixPromiseProps: true,
	      hideSensitive: true,
	      sourceEmbed: {
	        name: "Code",
	        enabled: true,
	        codeblock: {
	          enabled: true,
	          escape: true,
	          lang: "js"
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
	        lang: "js"
	      },
	      errors: {
	        trim: true,
	        stack: true
	      }
	    },
	    defaults: {
	      await: true,
	      global: false,
	      return: false,
	      silent: false
	    },
	    command: {
	      name: "!eval"
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
	let madeSendMessage, UserStore, plugin, usedInSession = false;
	function sendMessage() {
	  if (window.sendMessage)
	    return window.sendMessage?.(...arguments);
	  if (!madeSendMessage)
	    madeSendMessage = mSendMessage(vendetta);
	  return madeSendMessage(...arguments);
	}
	async function execute(rawArgs, ctx) {
	  try {
	    const { settings, stats } = plugin$2.storage;
	    const { history, defaults, output: outputSettings } = settings;
	    const { runs } = stats;
	    triggerAutorun("command_before", function(code) {
	      return eval(code);
	    });
	    UserStore ??= metro.findByStoreName("UserStore");
	    if (!usedInSession) {
	      usedInSession = true;
	      runs["plugin"]++;
	      runs["sessionHistory"] = [];
	    }
	    let currentUser = UserStore.getCurrentUser();
	    if (outputSettings["hideSensitive"]) {
	      currentUser = {
	        ...currentUser
	      };
	      evaluate.SENSITIVE_PROPS.USER.forEach(function(prop) {
	        Object.defineProperty(currentUser, prop, {
	          enumerable: false
	        });
	      });
	    }
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
	      }))
	    };
	    Object.defineProperty(interaction, "_args", {
	      value: rawArgs,
	      enunerable: false
	    });
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
	    const { channel, args } = interaction, code = args.get("code")?.value, aweight = args.get("await")?.value ?? defaults["await"], silent = args.get("silent")?.value ?? defaults["silent"], global = args.get("global")?.value ?? defaults["global"];
	    if (typeof code !== "string")
	      throw new Error("No code argument passed");
	    triggerAutorun("evaluate_before", function(code) {
	      return eval(code);
	    });
	    let { result, errored, start, end, elapsed } = await evaluate(code, aweight, global, {
	      interaction,
	      plugin,
	      util: {
	        sendMessage,
	        common,
	        evaluate,
	        BUILTIN_AUTORUN_TYPES,
	        triggerAutorun
	      }
	    });
	    triggerAutorun("evaluate_after", function(code) {
	      return eval(code);
	    });
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
	          window,
	          runs["history"],
	          runs["sessionHistory"],
	          vendetta.plugin.storage
	        ], "not saved");
	        if (history.saveContext)
	          thisEvaluation.context = cloneWithout(interaction, [
	            window,
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
	      const message = {
	        channelId: channel.id,
	        content: "",
	        embeds: []
	      };
	      const outputEmbed = {
	        type: "rich",
	        color: EMBED_COLOR(errored ? "dissatisfactory" : "satisfactory")
	      };
	      message.embeds.push(outputEmbed);
	      if (outputSettings["fixPromiseProps"] && result?.constructor?.name === "Promise")
	        result = fixPromiseProps(result);
	      let processedResult = outputSettings["useToString"] ? result.toString() : inspect(result, outputSettings["inspect"]);
	      if (errored) {
	        const { stack, trim } = outputSettings["errors"];
	        if (stack && result.stack !== void 0 && typeof result.stack === "string")
	          processedResult = result.stack;
	        if (trim)
	          processedResult = processedResult.split("    at ?anon_0_?anon_0_evaluate")[0];
	      }
	      if (typeof outputSettings["trim"] === "number" && outputSettings["trim"] < processedResult.length)
	        processedResult = processedResult.slice(0, outputSettings["trim"]);
	      if (outputSettings["codeblock"].enabled) {
	        const { lang, escape } = outputSettings["codeblock"];
	        processedResult = codeblock(processedResult, lang, escape);
	      }
	      if (outputSettings["location"] === 0) {
	        message.content = processedResult;
	      } else {
	        outputEmbed.description = processedResult;
	      }
	      if (outputSettings["info"].enabled) {
	        const { hints, prettyTypeof: prettyTypeof$1 } = outputSettings.info;
	        let info = [
	          prettyTypeof$1 ? prettyTypeof(result) : typeof result
	        ];
	        if (hints) {
	          let hint;
	          if (result === void 0 && !code.includes("return"))
	            hint = "use 'return'";
	          if (hint)
	            info.push(`hint: ${hint}`);
	        }
	        info.push(`took: ${elapsed}ms`);
	        if (outputSettings["location"] === 0) {
	          outputEmbed.description = info.join("\n");
	        } else {
	          outputEmbed.footer = {
	            text: info.join("\n")
	          };
	        }
	      }
	      if (outputSettings["sourceEmbed"].enabled) {
	        const { codeblock: { codeblockEnabled, language, escape }, name } = outputSettings["sourceEmbed"];
	        const embed = {
	          type: "rich",
	          color: EMBED_COLOR("source"),
	          description: code,
	          footer: {
	            text: `length: ${code.length}`
	          }
	        };
	        message.embeds.push(embed);
	        if (name)
	          embed.provider = {
	            name
	          };
	        if (codeblockEnabled)
	          embed.description = hlp.codeblock(embed.description, language, escape);
	        let newlineCount = code.split("").filter(function($) {
	          return $ === "\n";
	        }).length;
	        if (newlineCount < 0)
	          embed.footer.text += `
newlines: ${newlineCount}`;
	      }
	      sendMessage(message, messageMods);
	    }
	    if (!errored && args.get("return")?.value) {
	      triggerAutorun("command_before_return", function(code) {
	        return eval(code);
	      });
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
	  triggerAutorun("command_after", function(code) {
	    return eval(code);
	  });
	}
	plugin = {
	  ...vendetta.plugin,
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
	    try {
	      triggerAutorun("plugin_onLoad", function(code) {
	        return eval(code);
	      });
	      this.command(execute);
	    } catch (e) {
	      console.error(e);
	      console.log(e.stack);
	      alert(`There was an error while loading the plugin "${plugin.name}"
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
	    const { defaults: defaults2, command } = plugin$2.storage.settings;
	    console.log("meow");
	    this.commandPatch = commands.registerCommand(cmdDisplays({
	      execute: execute2,
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
	          description: "Code to evaluate"
	        },
	        {
	          type: 5,
	          name: "silent",
	          description: `Show the output of the evaluation? (default: ${defaults2["silent"]})`
	        },
	        {
	          type: 5,
	          name: "return",
	          description: `Return the returned value? (so it works as a real command, default: ${defaults2["return"]})`
	        },
	        {
	          type: 5,
	          name: "global",
	          description: `Evaluate the code in the global scope? (default: ${defaults2["global"]})`
	        },
	        {
	          type: 5,
	          name: "await",
	          description: `await the evaluation? (default: ${defaults2["await"]})`
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
	exports.triggerAutorun = triggerAutorun;

	Object.defineProperty(exports, '__esModule', { value: true });

	return exports;

})({}, vendetta.commands, vendetta.metro, vendetta.plugin, vendetta.ui);
