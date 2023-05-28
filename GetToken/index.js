(function (exports) {
  'use strict';

  function cmdDisplays(obj, translations, locale) {
    if (!obj.name || !obj?.description)
      throw new Error(`No name(${obj?.name}) or description(${obj?.description}) in the passed command (command name: ${obj?.name})`);
    obj.displayName = translations?.names?.[locale] ?? obj.name;
    obj.displayDescription = translations?.names?.[locale] ?? obj.description;
    if (obj.options) {
      if (!Array.isArray(obj.options))
        throw new Error(`Options is not an array (received: ${typeof obj.options})`);
      obj.options = obj.options.map(function(option, optionIndex) {
        if (!option?.name || !option?.description)
          throw new Error(`No name(${option?.name}) or description(${option?.description} in the option with index ${optionIndex}`);
        option.displayName = translations?.options?.[optionIndex]?.names?.[locale] ?? option.name;
        option.displayDescription = translations?.options?.[optionIndex]?.descriptions?.[locale] ?? option.description;
        return option;
      });
    }
    return obj;
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

  var index = {
    patches: [],
    onUnload() {
      this.patches.every(function(p) {
        return p(), true;
      });
    },
    onLoad() {
      try {
        let sendMessage = function(message, mod) {
          if (typeof mod !== "undefined" && "author" in mod) {
            if ("avatar" in mod.author && "avatarURL" in mod.author) {
              Avatars.BOT_AVATARS[mod.author.avatar] = mod.author.avatarURL;
              delete mod.author.avatarURL;
            }
          }
          let msg = createBotMessage(message);
          if (typeof mod === "object")
            msg = metro.findByProps("merge").merge(msg, mod);
          receiveMessage(message.channelId, msg);
          return msg;
        };
        const { metro, commands } = vendetta;
        const { receiveMessage } = metro.findByProps("sendMessage", "receiveMessage");
        const { createBotMessage } = metro.findByProps("createBotMessage");
        const Avatars = metro.findByProps("BOT_AVATARS");
        const exeCute = {
          get(args, ctx) {
            const authorMods = {
              author: {
                username: "/token get",
                avatar: "command",
                avatarURL: AVATARS.command
              }
            };
            try {
              const { getToken } = metro.findByProps("getToken");
              sendMessage({
                channelId: ctx.channel.id,
                embeds: [
                  {
                    type: "rich",
                    title: "Token of the current account",
                    description: `${getToken()}`
                  }
                ]
              }, authorMods);
            } catch (err) {
              console.error(err);
              alert(err.stack);
            }
          },
          async login(args, ctx) {
            const authorMods = {
              author: {
                username: "/token login",
                avatar: "command",
                avatarURL: AVATARS.command
              }
            };
            try {
              const options = new Map(args.map(function(a) {
                return [
                  a.name,
                  a
                ];
              }));
              const token = options.get("token").value;
              console.log(token);
              try {
                sendMessage({
                  channelId: ctx.channel.id,
                  embeds: [
                    {
                      type: "rich",
                      title: `<${EMOJIS.getLoading()}> Switching accounts\u2026`
                    }
                  ]
                }, authorMods);
                vendetta.metro.findByProps("login", "logout", "switchAccountToken").switchAccountToken(token);
              } catch (e) {
                alert(e.stack);
                console.error(e);
                sendMessage({
                  channelId: ctx.channel.id,
                  embeds: [
                    {
                      type: "rich",
                      title: `<${EMOJIS.getFailure()}> Invalid token (failed to add/switch to the account)`,
                      description: `${e.message}`
                    }
                  ]
                }, authorMods);
              }
            } catch (err) {
              console.error(err);
              alert(err.stack);
            }
          }
        };
        console.log("meow 66");
        this.patches.push(commands.registerCommand(cmdDisplays({
          execute: exeCute.get,
          name: "token get",
          description: "Shows your current user token",
          applicationId: "-1",
          inputType: 1,
          type: 1
        })));
        console.log("meow 77");
        this.patches.push(commands.registerCommand(cmdDisplays({
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
          ],
          applicationId: "-1",
          inputType: 1,
          type: 1
        })));
      } catch (e) {
        alert(e.stack);
      }
    }
  };

  exports.default = index;

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;

})({});
