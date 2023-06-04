(function (exports, ui, commands, metro) {
	'use strict';

	function cmdDisplays(obj, translations, locale) {
	  if (!obj.name || !obj?.description)
	    throw new Error(`No name(${obj?.name}) or description(${obj?.description}) in the passed command (command name: ${obj?.name})`);
	  obj.displayName ??= translations?.names?.[locale] ?? obj.name;
	  obj.displayDescription ??= translations?.names?.[locale] ?? obj.description;
	  if (obj.options) {
	    if (!Array.isArray(obj.options))
	      throw new Error(`Options is not an array (received: ${typeof obj.options})`);
	    obj.options = obj.options.map(function(option, optionIndex) {
	      if (!option?.name || !option?.description)
	        throw new Error(`No name(${option?.name}) or description(${option?.description} in the option with index ${optionIndex}`);
	      option.displayName ??= translations?.options?.[optionIndex]?.names?.[locale] ?? option.name;
	      option.displayDescription ??= translations?.options?.[optionIndex]?.descriptions?.[locale] ?? option.description;
	      return option;
	    });
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

	const { meta: { resolveSemanticColor } } = metro.findByProps("colors", "meta");
	const ThemeStore = metro.findByStoreName("ThemeStore");
	const EMBED_COLOR = function() {
	  return parseInt(resolveSemanticColor(ThemeStore.theme, ui.semanticColors.BACKGROUND_SECONDARY).slice(1), 16);
	}, authorMods = {
	  author: {
	    username: "TokenUtils",
	    avatar: "command",
	    avatarURL: AVATARS.command
	  }
	};
	let madeSendMessage;
	function sendMessage() {
	  if (window.sendMessage)
	    return window.sendMessage?.(...arguments);
	  if (!madeSendMessage)
	    madeSendMessage = mSendMessage(vendetta);
	  return madeSendMessage(...arguments);
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
	    try {
	      const exeCute = {
	        get(args, ctx) {
	          try {
	            const messageMods = {
	              ...authorMods,
	              interaction: {
	                name: "/token get",
	                user: metro.findByStoreName("UserStore").getCurrentUser()
	              }
	            };
	            const { getToken } = metro.findByProps("getToken");
	            sendMessage({
	              loggingName: "Token get output message",
	              channelId: ctx.channel.id,
	              embeds: [
	                {
	                  color: EMBED_COLOR(),
	                  type: "rich",
	                  title: "Token of the current account",
	                  description: `${getToken()}`
	                }
	              ]
	            }, messageMods);
	          } catch (e) {
	            console.error(e);
	            alert("There was an error while exeCuting /token get\n" + e.stack);
	          }
	        },
	        login(args, ctx) {
	          try {
	            const messageMods = {
	              ...authorMods,
	              interaction: {
	                name: "/token login",
	                user: metro.findByStoreName("UserStore").getCurrentUser()
	              }
	            };
	            const options = new Map(args.map(function(a) {
	              return [
	                a.name,
	                a
	              ];
	            }));
	            const token = options.get("token").value;
	            try {
	              sendMessage({
	                loggingName: "Token login process message",
	                channelId: ctx.channel.id,
	                embeds: [
	                  {
	                    color: EMBED_COLOR(),
	                    type: "rich",
	                    title: `<${EMOJIS.getLoading()}> Switching accounts\u2026`
	                  }
	                ]
	              }, messageMods);
	              metro.findByProps("login", "logout", "switchAccountToken").switchAccountToken(token);
	            } catch (e) {
	              console.error(e);
	              sendMessage({
	                loggingName: "Token login failure message",
	                channelId: ctx.channel.id,
	                embeds: [
	                  {
	                    color: EMBED_COLOR(),
	                    type: "rich",
	                    title: `<${EMOJIS.getFailure()}> Failed to switch accounts`,
	                    description: `${e.message}`
	                  }
	                ]
	              }, messageMods);
	            }
	          } catch (e) {
	            console.error(e);
	            alert("There was an error while executing /token login\n" + e.stack);
	          }
	        }
	      };
	      [
	        cmdDisplays({
	          type: 1,
	          inputType: 1,
	          applicationId: "-1",
	          execute: exeCute.get,
	          name: "token get",
	          description: "Shows your current user token"
	        }),
	        cmdDisplays({
	          type: 1,
	          inputType: 1,
	          applicationId: "-1",
	          execute: exeCute.login,
	          name: "token login",
	          description: "Logs into an account using a token",
	          options: [
	            {
	              required: true,
	              type: 3,
	              name: "token",
	              description: "Token of the account to login into"
	            }
	          ]
	        })
	      ].forEach(function(command) {
	        return _this.patches.push(commands.registerCommand(command));
	      });
	    } catch (e) {
	      console.error(e);
	      alert("There was an error while loading TokenUtils\n" + e.stack);
	    }
	  }
	};

	exports.EMBED_COLOR = EMBED_COLOR;
	exports.authorMods = authorMods;
	exports.default = index;

	Object.defineProperty(exports, '__esModule', { value: true });

	return exports;

})({}, vendetta.ui, vendetta.commands, vendetta.metro);
