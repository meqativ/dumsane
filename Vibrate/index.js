(function (exports, enmity) {
  'use strict';

  function _interopNamespaceDefault(e) {
    var n = Object.create(null);
    if (e) {
      Object.keys(e).forEach(function (k) {
        if (k !== 'default') {
          var d = Object.getOwnPropertyDescriptor(e, k);
          Object.defineProperty(n, k, d.get ? d : {
            enumerable: true,
            get: function () { return e[k]; }
          });
        }
      });
    }
    n.default = e;
    return Object.freeze(n);
  }

  var enmity__namespace = /*#__PURE__*/_interopNamespaceDefault(enmity);

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

  const { metro, logger, commands } = enmity__namespace;
  const { common: { ReactNative } } = metro;
  const { triggerHaptic } = metro.findByProps("triggerHaptic");
  const authorMods = {
    author: {
      username: "Vibrate",
      avatar: "command",
      avatarURL: AVATARS.command
    }
  };
  const plat = function(n) {
    return ReactNative.Platform.select(typeof n === "object" && (n.hasOwnProperty("ios") || n.hasOwnProperty("android")) ? n : {
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
  let vibrationIDIncremental = 0;
  const vibrations = [];
  async function vibrate(options, startCb, finishCb) {
    try {
      if (typeof options === "undefined")
        options = {};
      if (!options.repeat)
        options.repeat = 1;
      const vibration = {
        id: vibrationIDIncremental++,
        stopping: false,
        stopped: false,
        ios: plat({
          ios: true,
          android: false
        })
      };
      vibrations.push(vibration);
      console.log(vibration);
      vibration.startO = await startCb(vibration);
      for (let i = 0; i < options.repeat; i++) {
        if (vibration.ios) {
          const interval = setInterval(triggerHaptic);
          await wait(options.duration);
          clearInterval(interval);
        } else {
          metro.common.ReactNative.Vibration.vibrate(options.duration);
          await wait(options.duration);
        }
        if (vibration.stopping === true) {
          vibration.stopped = true;
          break;
        }
        if (options.gap)
          await wait(options.gap);
      }
      vibrations.splice(vibrations.findIndex(function(v) {
        return v.id === vibration.id;
      }), 1);
      return finishCb(vibration);
    } catch (e) {
      console.error(e);
      alert("An error ocurred at vibrate()\n" + e.stack);
    }
  }
  var index = {
    patches: [
      function() {
        for (var i = 0; i < vibrations.length; i++) {
          vibrations[i].stopping = true;
        }
      }
    ],
    onUnload() {
      this.patches.every(function(p) {
        return p(), true;
      });
    },
    onLoad() {
      var _this = this;
      try {
        const { receiveMessage } = metro.findByProps("sendMessage", "receiveMessage");
        const { createBotMessage } = metro.findByProps("createBotMessage");
        const Avatars = metro.findByProps("BOT_AVATARS");
        const sendMessage = function() {
          return window.sendMessage ? window.sendMessage?.("meow", ...arguments) : function(message, mod) {
            if (typeof mod !== "undefined" && "author" in mod) {
              if ("avatar" in mod.author && "avatarURL" in mod.author) {
                Avatars.BOT_AVATARS[mod.author.avatar] = mod.author.avatarURL;
                delete mod.author.avatarURL;
              }
            }
            let msg = createBotMessage(message);
            if (typeof mod === "object")
              msg = metro.findByProps("merge").merge(msg, mod);
            receiveMessage(message.channel_id, msg);
            return msg;
          }(...arguments);
        };
        const exeCute = {
          start: function(args, context) {
            const messageMods = {
              ...authorMods,
              interaction: {
                name: "/vibrate start",
                user: enmity__namespace.metro.findByStoreName("UserStore").getCurrentUser()
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
              const description = `for ${options.duration}ms` + (options?.repeat ? `, ${options.repeat} time${options.repeat === 1 ? "" : "s"}` : "") + (options?.gap ? `. With a gap of ${options?.gap}ms` : "");
              vibrate(options, async function(vibration) {
                return await sendMessage({
                  channel_id: context.channel.id,
                  embeds: [
                    {
                      type: "rich",
                      title: `<:vibrating:1095354969965731921> Started vibrating`,
                      description,
                      footer: {
                        text: `ID: ${vibration.id}`
                      }
                    }
                  ]
                }, messageMods);
              }, async function(vibration) {
                const replyId = vibration.startO.id;
                sendMessage({
                  channel_id: context.channel.id,
                  embeds: [
                    {
                      type: "rich",
                      title: `<:still:1095977283212296194> ${vibration.stopped ? "Stopp" : "Finish"}ed vibrating`,
                      footer: {
                        text: `ID: ${vibration.id}`
                      }
                    }
                  ]
                }, {
                  ...messageMods,
                  type: 19,
                  message_reference: {
                    channel_id: context.channel.id,
                    message_id: replyId,
                    guild_id: context?.guild?.id
                  },
                  referenced_message: enmity__namespace.metro.findByStoreName("MessageStore").getMessage(context.channel.id, replyId)
                });
              });
            } catch (e) {
              sendMessage({
                channel_id: context.channel.id,
                content: `\`\`\`js
${e.stack}\`\`\``,
                embeds: [
                  {
                    type: "rich",
                    title: `<${EMOJIS.getFailure()}> An error ocurred while running the command`,
                    description: `Send a screenshot of this error and explain how you came to it, here: ${PLUGINS_FORUM_POST_URL}, to hopefully get this error solved!`
                  }
                ]
              }, messageMods);
              console.error(e);
            }
          },
          stop: async function(args, context) {
            const messageMods = {
              ...authorMods,
              interaction: {
                name: "/vibrate stop",
                user: enmity__namespace.metro.findByStoreName("UserStore").getCurrentUser()
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
              if (vibrations.findIndex(function(v) {
                return v.id === id;
              }) === -1) {
                await sendMessage({
                  channel_id: context.channel.id,
                  embeds: [
                    {
                      type: "rich",
                      title: `<${EMOJIS.getFailure()}> Vibration with id \`${id}\` not found.`
                    }
                  ]
                }, messageMods);
                return;
              }
              const vibration = vibrations[vibrations.findIndex(function(v) {
                return v.id === id;
              })];
              if (!vibration)
                return alert("what");
              vibration.stopping = true;
              vibration.startCbO = sendMessage({
                channel_id: context.channel.id,
                embeds: [
                  {
                    type: "rich",
                    title: `<${EMOJIS.getLoading()}> Stopping vibration\u2026`,
                    footer: {
                      text: `ID: ${vibration.id}`
                    }
                  }
                ]
              }, messageMods);
            } catch (e) {
              sendMessage({
                channel_id: context.channel.id,
                content: `\`\`\`js
${e.stack}\`\`\``,
                embeds: [
                  {
                    type: "rich",
                    title: `<${EMOJIS.getFailure()}> An error ocurred while running the command`,
                    description: `Send a screenshot of this error and explain how you came to it, here: ${PLUGINS_FORUM_POST_URL}, to hopefully get this error solved!`
                  }
                ]
              }, messageMods);
              console.error(e);
            }
          }
        };
        [
          cmdDisplays({
            execute: exeCute.stop,
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
            execute: exeCute.start,
            type: 1,
            inputType: 1,
            applicationId: "-1",
            name: "vibrate start",
            description: `Begin a brrr`,
            options: [
              {
                type: 4,
                required: true,
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

  exports.default = index;

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;

})({}, vendetta);
