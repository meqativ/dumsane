(function (exports, commands, metro, plugin$2, ui) {
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
	const AVATARS = {
	  command: "https://cdn.discordapp.com/attachments/1099116247364407337/1112129955053187203/command.png"
	};

	const authorMods = {
	  author: {
	    username: "eval",
	    avatar: "command",
	    avatarURL: AVATARS.command
	  }
	}, AsyncFunction = async function() {
	}.constructor;
	plugin$2.storage["stats"] ??= {};
	plugin$2.storage["stats"]["runs"] ??= {
	  failed: 0,
	  succeeded: 0
	};
	const { meta: { resolveSemanticColor } } = metro.findByProps("colors", "meta");
	const ThemeStore = metro.findByStoreName("ThemeStore");
	const EMBED_COLOR = function(color) {
	  parseInt(resolveSemanticColor(ThemeStore.theme, ui.semanticColors.BACKGROUND_SECONDARY).slice(1), 16);
	};
	let madeSendMessage, plugin;
	function sendMessage() {
	  if (window.sendMessage)
	    return window.sendMessage?.(...arguments);
	  if (!madeSendMessage)
	    madeSendMessage = mSendMessage(vendetta);
	  return madeSendMessage(...arguments);
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
	    try {
	      this.patches.push(commands.registerCommand({
	        ...this.command,
	        async execute(rawArgs, ctx) {
	          const messageMods = {
	            ...authorMods,
	            interaction: {
	              name: "/" + this.displayName,
	              user: metro.findByStoreName("UserStore").getCurrentUser()
	            }
	          };
	          const interaction = {
	            messageMods,
	            ...ctx,
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
	            const Async = args.get("type")?.value;
	            const silent = args.get("silent")?.value ?? false;
	            const global = args.get("global")?.value ?? false;
	            const code = args.get("code")?.value;
	            let result, errored, start = +new Date();
	            try {
	              const evalFunction = new (Async ? AsyncFunction : Function)(code);
	              result = await (global ? evalFunction() : evalFunction.bind(interaction)());
	            } catch (e) {
	              result = e;
	              errored = true;
	            }
	            let elapsed = +new Date() - start;
	            if (!silent) {
	              if (errored) {
	                sendMessage({
	                  channelId: channel.id,
	                  embeds: [
	                    {
	                      type: "rich",
	                      color: EMBED_COLOR("exploded"),
	                      description: "```js\n" + (plugin$2.storage["trimError"] ? result.stack.split("\n    at next (native)")[0] : result.stack) + "```",
	                      footer: {
	                        text: `type: ${typeof result}
took: ${elapsed}ms`
	                      }
	                    }
	                  ]
	                }, {
	                  ...messageMods,
	                  rawCode: code
	                });
	              }
	              if (!errored)
	                sendMessage({
	                  channelId: channel.id,
	                  content: `\`\`\`js
${vendetta.metro.findByProps("inspect").inspect(result).slice(0, 15e3)}\`\`\``,
	                  embeds: [
	                    {
	                      type: "rich",
	                      color: EMBED_COLOR("satisfactory"),
	                      footer: {
	                        text: `type: ${typeof result}
` + (typeof result === "undefined" && !code.includes("return") ? "hint: use the return keyword\n" : "") + `took: ${elapsed}ms`
	                      }
	                    }
	                  ]
	                }, {
	                  ...messageMods,
	                  rawCode: code
	                });
	            }
	            console.log({
	              result: typeof result,
	              global,
	              elapsed
	            });
	            if (!errored && args.get("return")?.value)
	              return result;
	          } catch (e) {
	            console.error(e);
	            alert("An uncatched error was thrown while running /eval\n" + e.stack);
	          }
	        }
	      }));
	    } catch (e) {
	      console.error(e);
	      alert(`There was an error while loading the plugin "${plugin.meta.name}"
${e.stack}`);
	    }
	  },
	  command: cmdDisplays({
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
	        description: "Code to evaluate"
	      },
	      {
	        type: 4,
	        name: "type",
	        description: "Type of the code",
	        choices: [
	          {
	            name: "sync",
	            value: 0
	          },
	          {
	            name: "async [default]",
	            value: 1
	          }
	        ]
	      },
	      {
	        type: 5,
	        name: "return",
	        description: "Return the returned value? (so it works as a real command, default: false)"
	      },
	      {
	        type: 5,
	        name: "global",
	        description: "Evaluate the code in the global scope? (default: false)"
	      },
	      {
	        type: 5,
	        name: "silent",
	        description: "Show the output of the evaluation? (default: false)"
	      }
	    ]
	  })
	};
	var plugin$1 = plugin;

	exports.EMBED_COLOR = EMBED_COLOR;
	exports.default = plugin$1;

	Object.defineProperty(exports, '__esModule', { value: true });

	return exports;

})({}, vendetta.commands, vendetta.metro, vendetta.plugin, vendetta.ui);
