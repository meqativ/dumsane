(function (exports, commands, metro, common, plugin, ui) {
	'use strict';

	function cmdDisplays(obj, translations, locale) {
	  if (!obj.name || !obj?.description)
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
	function mSendMessage(vendetta) {
	  const { metro } = vendetta;
	  const { receiveMessage } = metro.findByProps("sendMessage", "receiveMessage");
	  const { createBotMessage } = metro.findByProps("createBotMessage");
	  const Avatars = metro.findByProps("BOT_AVATARS");
	  return function(message, mod) {
	    if (!message.channelId)
	      throw new Error("No channel id to receive the message into (channelId)");
	    if (typeof mod !== "undefined" && "author" in mod) {
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

	function generateBasicScheme() {
	  let duration = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 200, repeat = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 1, gap = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 0;
	  return Array.from({
	    length: repeat
	  }, function() {
	    return `vibrate(duration = ${duration})`;
	  }).join(gap > 0 ? `
wait(time = ${gap})
` : "\n");
	}
	function stfu(number, or) {
	  return number < 0 ? or ?? 0 : number;
	}
	function schemesError(e) {
	  e.error = true;
	  e.toString = function() {
	    var _this = this;
	    const at = `${this.line} | `;
	    const character = this.character + at.length;
	    let top, bottom;
	    if (this.lines) {
	      top = this.lines.splice(this.line - 3, this.line - 1).reduce(function(a, l, i) {
	        return a + `${i + _this.line - 3} | ${l}
`;
	      }, "");
	      bottom = "\n" + this.lines.slice(this.line, this.line + 3).reduce(function(a, l, i) {
	        return a + `${i + _this.line + 1} | ${l}
`;
	      }, "");
	    }
	    return top + (`${at}${this.codeline}
` + " ".repeat(stfu(character - 1)) + (this.message.length < 25 ? "^" + "-".repeat(stfu(at.length - character, 1)) + " " : "\u2191\n" + " ".repeat(stfu(character - 1 - 5))) + "Syntax Error: " + this.message) + bottom;
	  };
	  return e;
	}
	function parseScheme(scheme, debug) {
	  if (typeof scheme !== "string")
	    throw new Error("passed scheme isn't a string");
	  const outputKeys = [];
	  const rawLines = scheme.split(/\r?\n|\r/);
	  for (var line = 0; line < rawLines.length; line++) {
	    const rawLine = rawLines[line].trimEnd();
	    const [rawKey, comment] = rawLine.split(";");
	    const key = {
	      name: void 0,
	      rawName: void 0,
	      comment,
	      args: [],
	      rawArgs: void 0
	    };
	    if (debug)
	      key.line = line;
	    if (!debug && rawKey.length === 0)
	      continue;
	    if (debug)
	      key.rawName = rawKey;
	    outputKeys.push(key);
	    if (rawKey.length === 0)
	      continue;
	    const argsStart = rawKey.indexOf("(");
	    const argsEnd = rawKey.indexOf(")");
	    if (rawKey.trimEnd().substring(0, argsEnd).length > rawKey.trimEnd().length) {
	      return schemesError({
	        message: "Unnecessary symbols after funk brackets",
	        character: argsEnd + 1,
	        codeline: rawKey,
	        line,
	        lines: rawLines
	      });
	    }
	    let keyRawName;
	    if (argsStart === 0)
	      keyRawName = rawKey.substring(0, argsStart);
	    else if (argsEnd === 0)
	      keyRawName = rawKey.substring(0, argsEnd);
	    else
	      keyRawName = rawKey.substring(0, argsStart !== -1 ? argsStart : 0);
	    if (keyRawName.length === 0 && (argsStart === 0 || argsEnd === 0))
	      return schemesError({
	        message: "No funk name",
	        character: 1,
	        codeline: rawKey,
	        line,
	        lines: rawLines
	      });
	    key.name = keyRawName.trim();
	    if (argsStart === -1 && argsEnd === -1)
	      return schemesError({
	        message: 'No arg brackets ("(", ")")',
	        character: keyRawName.length || 1,
	        codeline: rawKey,
	        line,
	        lines: rawLines
	      });
	    if (argsStart === -1) {
	      return schemesError({
	        message: 'No opening arg bracket ("(")',
	        character: argsEnd !== -1 ? argsEnd + 1 : 0,
	        codeline: rawKey,
	        line,
	        lines: rawLines
	      });
	    }
	    if (argsEnd === -1) {
	      return schemesError({
	        message: 'No closing arg bracket (")")',
	        character: argsStart !== -1 ? argsStart + 1 : 0,
	        codeline: rawKey,
	        line,
	        lines: rawLines
	      });
	    }
	    const rawArgs = rawKey.substring(argsStart + 1, argsEnd).split(",");
	    if (debug)
	      key.rawArgs = rawArgs;
	    for (var argIndex = 0; argIndex < rawArgs.length; argIndex++) {
	      const rawArg = rawArgs[argIndex];
	      const arg = {
	        name: void 0,
	        rawName: void 0,
	        equalsUsed: void 0,
	        value: void 0,
	        rawValue: void 0
	      };
	      if (!debug && rawArg.length === 0) {
	        if (argIndex !== 0)
	          return schemesError({
	            message: "Empty argument",
	            character: keyRawName.length + rawArgs.splice(0, argIndex).reduce(function(a, e) {
	              return a + e.length + 1;
	            }, 1),
	            codeline: rawKey,
	            line,
	            lines: rawLines
	          });
	        break;
	      }
	      key.args.push(arg);
	      if (debug)
	        arg.equalsUsed = rawArg.indexOf("=") !== -1;
	      if (debug)
	        arg.rawName = split[0];
	      const split = rawArg.split("=");
	      if (split.length === 2 && [
	        split[0],
	        split[1]
	      ].every(function($) {
	        return $ === "";
	      })) {
	        return schemesError({
	          message: "Empty argument name",
	          character: keyRawName.length + rawArgs.splice(0, argIndex).reduce(function(a, e) {
	            return a + e.length + 1;
	          }, 1) + rawArg.indexOf("="),
	          codeline: rawKey,
	          line,
	          lines: rawLines
	        });
	      }
	      if (!split[1])
	        split[1] = "true";
	      arg.name = split[0].trim();
	      const rawArgValue = split[1];
	      if (debug)
	        arg.rawValue;
	      const argValue = rawArgValue.trim();
	      const intParse = parseInt(argValue);
	      if (!Number.isNaN(intParse))
	        arg.value = intParse;
	      else if (argValue === "true")
	        arg.value = true;
	      else if (argValue === "false")
	        arg.value = false;
	      else
	        arg.value = argValue;
	    }
	  }
	  return outputKeys;
	}

	const command$1 = {
	  exeCute: async function(interaction) {
	    const messageMods = {
	      ...authorMods,
	      interaction: {
	        name: "/vibrate start",
	        user: metro.findByStoreName("UserStore").getCurrentUser()
	      }
	    };
	    try {
	      const { args, channel: channel1 } = interaction;
	      if (!(args.get("scheme") || args.get("duration") || args.get("repeat") || args.get("gap"))) {
	        return await sendMessage({
	          channelId: channel1.id,
	          embeds: [
	            {
	              color: EMBED_COLOR(),
	              type: "rich",
	              title: `<${EMOJIS.getFailure()}> Please provide a \`scheme\` or choose \`duration\`, \`repeat\` and/or \`gap\``
	            }
	          ]
	        }, messageMods);
	      }
	      const generatedScheme = args.get("scheme")?.value || generateBasicScheme(args.get("duration").value, args.get("repeat")?.value, args.get("gap")?.value);
	      vibrate({
	        scheme: generatedScheme,
	        parseCB: async function(vibration) {
	          return await sendMessage({
	            channelId: channel1.id,
	            embeds: [
	              {
	                color: EMBED_COLOR(),
	                type: "rich",
	                title: `<:vibrating:1095354969965731921> Parsing vibration\u2026`,
	                footer: {
	                  text: `ID: ${vibration.id}
(if you stop now, it will stop after parsing)`
	                }
	              }
	            ]
	          }, messageMods);
	        },
	        parseFailCB: async function(vibration) {
	          return await sendMessage({
	            channelId: channel1.id,
	            embeds: [
	              {
	                color: EMBED_COLOR(),
	                type: "rich",
	                title: `<${EMOJIS.getFailure()}> An error ocurred while parsing the scheme`,
	                description: `\`\`\`js
${vibration.scheme.toString()}\`\`\``
	              }
	            ]
	          }, {
	            ...messageMods,
	            id: vibration.parseCallbackOutput.id,
	            edited_timestamp: Date.now().toString()
	          });
	        },
	        startCB: async function(vibration) {
	          return await sendMessage({
	            channelId: channel1.id,
	            embeds: [
	              {
	                color: EMBED_COLOR(),
	                type: "rich",
	                title: `<:vibrating:1095354969965731921> Playing vibration`,
	                footer: {
	                  text: `ID: ${vibration.id}`
	                }
	              }
	            ]
	          }, {
	            ...messageMods,
	            edited_timestamp: Date.now().toString(),
	            id: vibration.parseCallbackOutput.id
	          });
	        },
	        errorCB: async function(vibration) {
	          return await sendMessage({
	            channelId: channel1.id,
	            embeds: [
	              {
	                color: EMBED_COLOR(),
	                type: "rich",
	                title: `${EMOJIS.getFailure()} An error ocurred while playing the vibration`,
	                description: `\`\`\`${vibration.error.message}\`\`\``
	              }
	            ]
	          }, {
	            ...messageMods,
	            edited_timestamp: Date.now().toString(),
	            id: vibration.startCallbackOutput.id
	          });
	        },
	        finishCB: async function(vibration) {
	          const replyId = vibration.startCallbackOutput.id;
	          sendMessage({
	            channelId: channel1.id,
	            embeds: [
	              {
	                color: EMBED_COLOR(),
	                type: "rich",
	                title: `<:still:1095977283212296194> ${vibration.stopped ? "Stopp" : "Finish"}ed playing`,
	                footer: {
	                  text: `ID: ${vibration.id}`
	                }
	              }
	            ]
	          }, {
	            ...messageMods,
	            type: 19,
	            message_reference: {
	              channel_id: channel1.id,
	              message_id: replyId,
	              guild_id: interaction?.guild?.id
	            },
	            referenced_message: metro.findByStoreName("MessageStore").getMessage(channel1.id, replyId)
	          });
	        }
	      });
	    } catch (e) {
	      console.error(e);
	      sendMessage({
	        channelId: channel.id,
	        content: `\`\`\`js
${e.stack}\`\`\``,
	        embeds: [
	          {
	            color: EMBED_COLOR(),
	            type: "rich",
	            title: `<${EMOJIS.getFailure()}> An error ocurred while running the command`,
	            description: `Send a screenshot of this error and explain how you came to it, here: ${PLUGIN_FORUM_POST_URL}, to hopefully get this error solved!`
	          }
	        ]
	      }, messageMods);
	    }
	  }
	};

	const command = {
	  exeCute: async function(interaction) {
	    const { channel, args } = interaction;
	    const messageMods = {
	      ...authorMods,
	      interaction: {
	        name: "/vibrate stop",
	        user: metro.findByStoreName("UserStore").getCurrentUser()
	      }
	    };
	    try {
	      const id = args.get("id").value;
	      if (vibrations.findIndex(function(v) {
	        return v.id === id;
	      }) === -1) {
	        await sendMessage({
	          channelId: channel.id,
	          embeds: [
	            {
	              color: EMBED_COLOR(),
	              type: "rich",
	              title: `<${EMOJIS.getFailure()}> Vibration with id \`${id}\` not found`
	            }
	          ]
	        }, messageMods);
	        return;
	      }
	      const vibration = vibrations[vibrations.findIndex(function(v) {
	        return v.id === id;
	      })];
	      vibration.stopping = true;
	      vibration.startCallbackOutput = sendMessage({
	        channelId: channel.id,
	        embeds: [
	          {
	            color: EMBED_COLOR(),
	            type: "rich",
	            title: `<${EMOJIS.getLoading()}> Stopping vibration\u2026`,
	            footer: {
	              text: `ID: ${vibration.id}`
	            }
	          }
	        ]
	      }, messageMods);
	    } catch (e) {
	      console.error(e);
	      sendMessage({
	        color: EMBED_COLOR(),
	        channelId: channel.id,
	        content: `\`\`\`js
${e.stack}\`\`\``,
	        embeds: [
	          {
	            type: "rich",
	            title: `<${EMOJIS.getFailure()}> An error ocurred while running the command`,
	            description: `Send a screenshot of this error and explain how you came to it, here: ${PLUGIN_FORUM_POST_URL}, to hopefully get this error solved!`
	          }
	        ]
	      }, messageMods);
	    }
	  }
	};

	const PLUGIN_FORUM_POST_URL = "||not proxied||", APP_ID = "1113021888109740083", authorMods = {
	  author: {
	    username: "Vibrate",
	    avatar: "command",
	    avatarURL: AVATARS.command
	  }
	};
	if (!("stats" in plugin.storage))
	  plugin.storage["stats"] = {};
	{
	  const stats = plugin.storage["stats"];
	  if (!("localRuns" in stats))
	    stats.localRuns = 0;
	  if (!("publicRuns" in stats))
	    stats.publicRuns = 0;
	  if (!("lastVibration" in stats))
	    stats.lastVibration = {
	      scheme: generateBasicScheme(150, 5)
	    };
	}
	const { meta: { resolveSemanticColor } } = metro.findByProps("colors", "meta");
	const ThemeStore = metro.findByStoreName("ThemeStore");
	const EMBED_COLOR = function() {
	  return parseInt(resolveSemanticColor(ThemeStore.theme, ui.semanticColors.BACKGROUND_SECONDARY).slice(1), 16);
	};
	let madeSendMessage;
	function sendMessage() {
	  if (window.sendMessage)
	    return window.sendMessage?.(...arguments);
	  if (!madeSendMessage)
	    madeSendMessage = mSendMessage(vendetta);
	  return madeSendMessage(...arguments);
	}
	const { triggerHaptic } = metro.findByProps("triggerHaptic");
	const selectPlatform = common.ReactNative.Platform.select;
	const wait = function(ms) {
	  return new Promise(function(res) {
	    return setTimeout(res, ms);
	  });
	};
	let vibrationIDIncremental = 0;
	const vibrations = [];
	async function vibrate(options) {
	  try {
	    if (typeof options === "undefined")
	      options = {};
	    if (!options?.scheme)
	      throw new Error("No scheme provided");
	    const vibration = {
	      id: vibrationIDIncremental++,
	      meta: {
	        rawScheme: options.scheme
	      },
	      stopping: false,
	      stopped: false,
	      ios: !!selectPlatform({
	        ios: true
	      })
	    };
	    if (options?.parseCB)
	      vibration.parseCallbackOutput = await options.parseCB(vibration);
	    vibration.scheme = parseScheme(vibration.meta.rawScheme, options?.debug);
	    vibrations.push(vibration);
	    console.log("VIBRATION", vibration);
	    if (vibration.scheme.error === true) {
	      vibration.errored = true;
	      if (options?.parseFailCB)
	        vibration.errorCallbackOutput = await options.parseFailCB(vibration);
	    }
	    if (!vibration.errored && options?.startCB)
	      vibration.startCallbackOutput = await options.startCB?.(vibration);
	    if (!vibration.errored) {
	      plugin.storage["localRuns"]++;
	      for (var funk of vibration.scheme) {
	        if (!funk.name)
	          continue;
	        const duration = funk.args.find(function(arg) {
	          return arg.name === "duration";
	        })?.value;
	        switch (funk.name) {
	          case "vibrate":
	            if (vibration.ios) {
	              triggerHaptic();
	              const interval = setInterval(triggerHaptic, 1);
	              await wait(duration ?? 400);
	              clearInterval(interval);
	            } else {
	              common.ReactNative.Vibration.vibrate(duration ?? 400);
	              await wait(duration ?? 400);
	            }
	            break;
	          case "wait":
	            await wait(duration ?? 5);
	            break;
	          default:
	            vibration.errored = true;
	            vibration.stopping = true;
	            vibration.error = {
	              message: "Unknown funk: " + funk.name
	            };
	            if (options?.errorCB)
	              vibration.errorCallbackOutput = options.errorCB(vibration);
	        }
	        if (vibration.stopping === true) {
	          vibration.stopped = true;
	          break;
	        }
	        if (vibration.errored)
	          break;
	      }
	    }
	    vibrations.splice(vibrations.findIndex(function(v) {
	      return v.id === vibration.id;
	    }), 1);
	    return vibration.errored ? vibration.errorCallbackOutput : options?.finishCB?.(vibration);
	  } catch (e) {
	    console.error(e);
	    alert("An error ocurred at vibrate()\n" + e.stack);
	  }
	}
	var index = {
	  meta: vendetta.plugin,
	  patches: [],
	  onUnload() {
	    this.patches.forEach(function(up) {
	      return up();
	    });
	    this.patches = [];
	  },
	  onLoad() {
	    var _this = this;
	    this.patches.push(function() {
	      for (var i = 0; i < vibrations.length; i++) {
	        vibrations[i].stopping = true;
	      }
	    });
	    try {
	      const plugin = this;
	      [
	        cmdDisplays({
	          async execute(args, ctx) {
	            return await command.exeCute({
	              ...ctx,
	              args: new Map(args.map(function(o) {
	                return [
	                  o.name,
	                  o
	                ];
	              })),
	              command: this,
	              plugin
	            });
	          },
	          type: 1,
	          inputType: 1,
	          applicationId: "-1",
	          name: "vibrate stop",
	          description: `Stop a brrr`,
	          options: [
	            {
	              type: 4,
	              required: true,
	              name: "id",
	              description: "Vibration id which you receive when starting a vibration"
	            }
	          ]
	        }),
	        cmdDisplays({
	          async execute(args, ctx) {
	            return await command$1.exeCute({
	              ...ctx,
	              args: new Map(args.map(function(o) {
	                return [
	                  o.name,
	                  o
	                ];
	              })),
	              command: this,
	              plugin
	            });
	          },
	          type: 1,
	          inputType: 1,
	          applicationId: "-1",
	          name: "vibrate start",
	          description: `Start a brrr`,
	          options: [
	            {
	              type: 3,
	              name: "scheme",
	              description: "A custom scheme to use (overwrites all other options)",
	              min_length: 1
	            },
	            {
	              type: 4,
	              name: "duration",
	              description: "Duration of one vibration (ms)",
	              min_value: 1
	            },
	            {
	              type: 4,
	              name: "repeat",
	              description: "Number of times to repeat"
	            },
	            {
	              type: 4,
	              name: "gap",
	              description: "Wait between vibrations (only matters if you have more than 1 repeat)"
	            }
	          ]
	        })
	      ].forEach(function(command) {
	        return _this.patches.unshift(commands.registerCommand(command));
	      });
	    } catch (e) {
	      console.error(e);
	      alert("There was an error while loading Vibrate\n" + e.stack);
	    }
	  }
	};

	exports.APP_ID = APP_ID;
	exports.EMBED_COLOR = EMBED_COLOR;
	exports.PLUGIN_FORUM_POST_URL = PLUGIN_FORUM_POST_URL;
	exports.authorMods = authorMods;
	exports.default = index;
	exports.sendMessage = sendMessage;
	exports.vibrate = vibrate;
	exports.vibrations = vibrations;

	Object.defineProperty(exports, '__esModule', { value: true });

	return exports;

})({}, vendetta.commands, vendetta.metro, vendetta.metro.common, vendetta.plugin, vendetta.ui);
