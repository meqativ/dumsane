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
    loadingDiscordSpinner: ":loading:1105495814073229393",
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

  const { metro, logger, commands } = vendetta;
  const Vibration = vendetta.metro.common.ReactNative.Vibration;
  const { triggerHaptic } = vendetta.metro.findByProps("triggerHaptic");
  const plat = function(n) {
    return metro.findByProps("View").Platform.select(typeof n === "object" && (n.hasOwnProperty("ios") || n.hasOwnProperty("android")) ? n : {
      ios: [
        n
      ],
      android: n
    });
  };
  const wait = function(ms) {
    return new Promise(function(res) {
      return setTimeout(res, ms);
    });
  };
  const vibrations = [];
  async function vibrate(options, startCb, finishCb) {
    try {
      if (typeof options === "undefined")
        options = {};
      if (!options.repeat)
        options.repeat = 1;
      const vibration = {
        id: +Date.now(),
        aborting: false,
        aborted: false,
        ios: plat({
          ios: true,
          android: false
        })
      };
      vibrations.push(vibration);
      startCb(vibration);
      for (let i = 0; i < options.repeat; i++) {
        if (vibration.ios) {
          const interval = setInterval(function() {
            return triggerHaptic();
          }, 5);
          await wait(options.duration);
          clearInterval(interval);
        } else {
          Vibration.vibrate(1e69);
          await wait(options.duration);
          Vibration.clear();
        }
        if (vibration.aborting === true) {
          vibration.aborted = true;
          break;
        }
        if (options.gap)
          await wait(options.gap);
      }
      vibration.deleted = delete vibrations[vibrations.findIndex(function(v) {
        return v.id === vibration.id;
      })];
      finishCb(vibration);
    } catch (e) {
      alert(e.stack);
      console.error(e.stack);
    }
  }
  const plugin = {
    patches: [
      function() {
        for (var i = 0; i < vibrations.length; i++) {
          vibrations[i].aborting = true;
        }
      }
    ],
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
          console.log("VIBATE SEND MSG", {
            msg
          });
          return msg;
        };
        const { receiveMessage } = metro.findByProps("sendMessage", "receiveMessage");
        const { createBotMessage } = metro.findByProps("createBotMessage");
        const Avatars = metro.findByProps("BOT_AVATARS");
        const exeCute = {
          begin(args, context) {
            const authorMods = {
              author: {
                username: "/vibrate begin",
                avatar: "command",
                avatarURL: AVATARS.command
              }
            };
            try {
              const cmdOptions = new Map(args.map(function(option) {
                return [
                  option.name,
                  option
                ];
              }));
              const options = {
                duration: cmdOptions.get("duration").value,
                repeat: cmdOptions.get("repeat")?.value,
                gap: cmdOptions.get("gap")?.value
              };
              const description = `for ${options.duration}ms` + (options?.repeat ? `, ${options.repeat} time${options.repeat === 1 ? "" : "s"}` : "") + (options?.gap ? `. With a gap of ${options?.gap}ms.` : "");
              vibrate(options, async function(vibration) {
                sendMessage({
                  channelId: context.channel.id,
                  embeds: [
                    {
                      type: "rich",
                      title: `<:vibrating:1095354969965731921> Started vibrating`,
                      description,
                      fields: [
                        {
                          value: `${vibration.id}`,
                          name: "Vibration ID"
                        }
                      ]
                    }
                  ]
                }, authorMods);
              }, async function(vibration) {
                sendMessage({
                  channelId: context.channel.id,
                  embeds: [
                    {
                      type: "rich",
                      title: `<:still:1095977283212296194> ${vibration.aborted ? "Abort" : "Finish"}ed vibrating`,
                      fields: [
                        {
                          value: `${vibration.id}`,
                          name: "Vibration ID"
                        }
                      ]
                    }
                  ]
                }, authorMods);
              });
            } catch (e) {
              alert(e.stack);
              console.error(e);
              sendMessage({
                channelId: context.channel.id,
                content: `\`\`\`
${e.stack}\`\`\``,
                embeds: [
                  {
                    type: "rich",
                    title: `<${EMOJIS.getFailure()}> An error ocurred while running the command`.trim(),
                    description: `Send a screenshot of this error and explain how you came to it, here: ${PLUGINS_FORUM_POST_URL}, to hopefully get this error solved!`
                  }
                ]
              }, authorMods);
            }
          },
          abort(args, context) {
            const authorMods = {
              author: {
                username: "/vibrate abort",
                avatar: "command",
                avatarURL: AVATARS.command
              }
            };
            try {
              const options = new Map(args.map(function(option) {
                return [
                  option.name,
                  option
                ];
              }));
              const id = options.get("id").value;
              const vibrationIndex = vibrations.findIndex(function(vibration) {
                return vibration.id === id;
              });
              if (vibrationIndex === -1) {
                sendMessage({
                  channelId: context.channel.id,
                  embeds: {
                    type: "rich",
                    title: `<${EMOJIS.getFailure()}> Invalid vibration ID`.trim,
                    fields: [
                      {
                        value: `${id}`,
                        name: "Vibration ID"
                      }
                    ]
                  }
                }, authorMods);
                return;
              }
              vibrations[vibrationIndex].aborting = true;
              sendMessage({
                channelId: context.channel.id,
                embeds: [
                  {
                    type: "rich",
                    title: `<${EMOJIS.getLoading()}> Aborting vibration\u2026`,
                    fields: [
                      {
                        value: `${id}`,
                        name: "Vibration ID"
                      }
                    ]
                  }
                ]
              }, authorMods);
            } catch (e) {
              alert(e.stack);
              console.error(e);
              sendMessage({
                channelId: context.channel.id,
                content: `\`\`\`
${e.stack}\`\`\``,
                embeds: [
                  {
                    type: "rich",
                    title: `<${EMOJIS.getFailure()}> An error ocurred while running the command`.trim(),
                    description: `Send a screenshot of this error and explain how you came to it, here: ${PLUGINS_FORUM_POST_URL}, to hopefully get this error solved!`
                  }
                ]
              }, authorMods);
            }
          }
        };
        this.patches.push(
          /* /vibrate begin */
          commands.registerCommand(cmdDisplays({
            execute: exeCute.begin,
            type: 1,
            inputType: 1,
            applicationId: "-1",
            name: "vibrate begin",
            description: `Begin a brrr`,
            options: [
              {
                type: 4,
                required: true,
                name: "duration",
                description: "Duration of one vibration (in milliseconds)",
                min_value: 1,
                max_value: 9999
              },
              {
                type: 4,
                name: "repeat",
                description: "Number of times to repeat",
                min_value: 1,
                max_value: 9999999
              },
              {
                type: 4,
                name: "gap",
                description: "Wait between vibrates (only matters if you have more than 1 repeat)"
              }
            ]
          }))
        );
        this.patches.push(
          /* /vibrate abort */
          commands.registerCommand(cmdDisplays({
            execute: exeCute.abort,
            type: 1,
            inputType: 1,
            applicationId: "-1",
            name: "vibrate abort",
            description: `Abort a brrr`,
            options: [
              {
                type: 4,
                required: true,
                name: "id",
                description: "Vibration id which you receive when running </vibrate begin:0>"
              }
            ]
          }))
        );
      } catch (e) {
        console.error(e);
        alert(e.stack);
      }
    }
  };

  exports.default = plugin;

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;

})({});
