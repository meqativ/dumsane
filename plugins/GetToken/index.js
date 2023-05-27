import { cmdDisplays, EMOJIS, AVATARS } from "../../helpers/index.js";

export default {
  patches: [],
  onUnload() {
    this.patches.every((p) => (p(), true));
  },
  onLoad() {
    try {
      const { metro, commands } = vendetta;
      const { receiveMessage } = metro.findByProps(
        "sendMessage",
        "receiveMessage"
      );
      const { createBotMessage } = metro.findByProps("createBotMessage");
      const Avatars = metro.findByProps("BOT_AVATARS");
      function sendMessage(message, mod) {
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
      }

      const exeCute = {
        get(args, ctx) {
          const authorMods = {
            author: {
              username: "/token get",
              avatar: "command",
              avatarURL: AVATARS.command,
            },
          };
          try {
            const { getToken } = metro.findByProps("getToken");

            sendMessage(
              {
                channelId: ctx.channel.id,
                embeds: [
                  {
                    type: "rich",
                    title: "Token of the current account",
                    description: `${getToken()}`,
                  },
                ],
              },
              authorMods
            );
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
              avatarURL: AVATARS.command,
            },
          };
          try {
            const login = vendetta.metro.findByProps(
              "login",
              "logout",
              "switchAccountToken"
            ).switchAccountToken;
            const options = new Map(args.map((a) => [a.name, a]));
            try {
              const response = await login(options.get("token").value);
              alert(JSON.stringify(response, 0, 4));
             /* sendMessage(
                {
                  channelId: ctx.channel.id,
                  embeds: [
                    {
                      type: "rich",
                      title: `<${EMOJIS.getLoading()}> Switching accounts…`,
                    },
                  ],
                },
                authorMods
              );*/
            } catch (e) {
							alert(e.stack)
							console.error(e)
              sendMessage(
                {
                  channelId: ctx.channel.id,
                  embeds: [
                    {
                      type: "rich",
                      title: `<${EMOJIS.getFailure()}> Invalid token (failed to add/switch to the account)`,
                      description: `${e.message}`,
                    },
                  ],
                },
                authorMods
              );
            }
          } catch (err) {
            console.error(err);
            alert(err.stack);
          }
        },
      };
      console.log("meow 66");
      this.patches.push(
        commands.registerCommand(
          cmdDisplays({
            execute: exeCute.get,
            name: "token get",
            description: "Shows your current user token",
            applicationId: "-1",
            inputType: 1,
            type: 1,
          })
        )
      );
      console.log("meow 77");
      this.patches.push(
        commands.registerCommand(
          cmdDisplays({
            execute: exeCute.login,
            name: "token login",
            description: "Logs into an account using a token",
            options: [
              {
                required: true,
                type: 3,
                name: "token",
                description: "Token of the account to login into",
              },
            ],
            applicationId: "-1",
            inputType: 1,
            type: 1,
          })
        )
      );
    } catch (e) {
      alert(e.stack);
    }
  },
};
