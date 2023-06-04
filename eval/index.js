(function (exports, commands, metro, plugin, ui) {
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
	};
	if (!("stats" in plugin.storage))
	  plugin.storage["stats"] = {};
	{
	  const stats = plugin.storage["stats"];
	  if (!("runs" in stats))
	    stats.runs = {
	      failed: 0,
	      succeeded: 0
	    };
	}
	const { meta: { resolveSemanticColor } } = metro.findByProps("colors", "meta");
	const ThemeStore = metro.findByStoreName("ThemeStore");
	const EMBED_COLOR = function(color) {
	  parseInt(color === "exploded" ? resolveSemanticColor(ThemeStore.theme, ui.semanticColors.BACKGROUND_SECONDARY).slice(1) : resolveSemanticColor(ThemeStore.theme, ui.semanticColors.BACKGROUND_SECONDARY).slice(1), 16);
	};
	let madeSendMessage;
	function sendMessage() {
	  if (window.sendMessage)
	    return window.sendMessage?.(...arguments);
	  if (!madeSendMessage)
	    madeSendMessage = mSendMessage(vendetta);
	  return madeSendMessage(...arguments);
	}
	async function evaluate(src, ignorePromise, global) {
	  let result, errored;
	  let start = +new Date();
	  try {
	    result = global ? (0, eval)(src) : eval(src);
	    if (result instanceof Promise && !ignorePromise) {
	      result = await result;
	    }
	  } catch (e) {
	    result = e;
	    errored = true;
	  }
	  let elapsed = +new Date() - start;
	  return {
	    errored,
	    result,
	    elapsed
	  };
	}
	async function exeCute(interaction) {
	  const messageMods = {
	    ...authorMods,
	    interaction: {
	      name: "/eval",
	      user: metro.findByStoreName("UserStore").getCurrentUser()
	    }
	  };
	  try {
	    const { channel, args } = interaction;
	    const ignorePromise2 = [
	      0,
	      2
	    ].includes(args.get("type")?.value);
	    const silent = [
	      1,
	      2
	    ].includes(args.get("type")?.value);
	    const global2 = !!args.get("global")?.value;
	    const code = args.get("code")?.value;
	    const evaluated = await evaluate(code, ignorePromise2, global2);
	    console.log("[eval \u203A evaluate() result]", evaluated);
	    const { errored: errored2, result: result2, elapsed: elapsed2 } = evaluated;
	    if (!silent) {
	      if (errored2) {
	        sendMessage({
	          channelId: channel.id,
	          embeds: [
	            {
	              type: "rich",
	              color: EMBED_COLOR("exploded"),
	              description: result2.stack.split("\n    at eval (native)")[0],
	              footer: {
	                text: `type: ${typeof result2}
took: ${elapsed2}ms`
	              }
	            }
	          ]
	        }, {
	          ...messageMods,
	          rawCode: code
	        });
	      }
	      if (!errored2)
	        sendMessage({
	          channelId: channel.id,
	          content: `\`\`\`js
${vendetta.metro.findByProps("inspect").inspect(result2)}\`\`\``,
	          embeds: [
	            {
	              type: "rich",
	              color: EMBED_COLOR("satisfactory"),
	              footer: {
	                text: `type: ${typeof result2}
took: ${elapsed2}ms`
	              }
	            }
	          ]
	        }, {
	          ...messageMods,
	          rawCode: code
	        });
	    }
	    if (!errored2 && args.get("return")?.value)
	      return result2;
	  } catch (e) {
	    console.error(e);
	    alert("An uncatched error was thrown while running /eval\n" + e.stack);
	  }
	}
	var index = {
	  meta: vendetta.plugin,
	  onLoad() {
	    var _this = this;
	    this.onUnload = commands.registerCommand(cmdDisplays({
	      type: 1,
	      inputType: 1,
	      applicationId: "-1",
	      name: "!eval",
	      displayName: "eval",
	      description: "Evaluates code",
	      options: [
	        {
	          required: true,
	          type: 3,
	          name: "code",
	          description: "The code to evaluate",
	          min_length: 1
	        },
	        {
	          type: 4,
	          name: "type",
	          description: "How to handle the evaluation",
	          choices: [
	            {
	              name: "\u{1F7E5}await returned promise & \u{1F7E9}show output",
	              value: 0
	            },
	            {
	              name: "\u{1F7E9}await returned promise & \u{1F7E5}show output",
	              value: 1
	            },
	            {
	              name: "\u{1F7E5}await returned promise & \u{1F7E5}show output",
	              value: 2
	            },
	            {
	              name: "\u{1F7E9}await returned promise & \u{1F7E9}show output [default]",
	              value: -1
	            }
	          ]
	        },
	        {
	          type: 5,
	          name: "global",
	          description: "Whether to evaluate in global scope (default: false)"
	        },
	        {
	          type: 5,
	          name: "return",
	          description: "Whether to return the returned value so it works as a real slash command (default: false)"
	        }
	      ],
	      execute: async function(args, ctx) {
	        return await exeCute({
	          ...ctx,
	          args: new Map(args.map(function(o) {
	            return [
	              o.name,
	              o
	            ];
	          })),
	          plugin: _this
	        });
	      }
	    }));
	  }
	};

	exports.EMBED_COLOR = EMBED_COLOR;
	exports.default = index;

	Object.defineProperty(exports, '__esModule', { value: true });

	return exports;

})({}, vendetta.commands, vendetta.metro, vendetta.plugin, vendetta.ui);
