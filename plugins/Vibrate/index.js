import { cmdDisplays, EMOJIS } from "../../helpers/index.js";
const { metro, logger, commands } = vendetta;
const { vibrate: vibro } = metro.findByProps("vibrate");

const plat = (n) => metro.findByProps("View").Platform.select(
	  ("ios" in n || "android" in n)
	? n
    : { ios: [n], android: n });
const wait = (ms) => new Promise((res) => setTimeout(res, ms));

const plugin = {
  patches: [],
  onUnload: function () {
    this.patches.every((p) => (p(), true));
  },
};

const vibrations = [];
async function vibrate(options, startCb, finishCb) {
	try {
  if (typeof options === "undefined") options = {};
  if (!("duration" in options)) options.duration = 400;
  if (!("repeat" in options)) options.repeat = 1;
  if (!("gap" in options)) options.gap = 0;
  if (plat({ ios: true }) && duration > 400) duration = 400;

  const vibrationId = +Date.now();
  const vibration = { id: vibrationId, aborting: false, aborted: false };
  startCb(vibration);
  for (let i = 0; i < repeat; i++) {
    vibro(plat(options.duration), true);
    await wait(options.duration);
    if (vibration.aborting === true) {
      vibration.aborted = true;
      break;
    }
    await wait(options.gap);
  }
  finishCb(vibration);
	} catch (e) {
	alert(e.stack)}
}

plugin.onLoad = () => {
  try {
    const MessageActions = metro.findByProps("sendMessage", "receiveMessage");
    const BotMessage = metro.findByProps("createBotMessage");
    const Avatars = metro.findByProps("BOT_AVATARS");
    function sendMessage(message, mod) {
      if (mod?.author?.avatar && mod?.author?.avatarURL) {
        Avatars.BOT_AVATARS[mod.author.avatar] = mod.author.avatarURL;
        delete mod.author.avatarURL;
      }
      let msg = BotMessage.createBotMessage(message);
      msg = metro.findByProps("merge").merge(msg, mod);
      MessageActions.receiveMessage(message.channelId, msg);
      return msg;
    }
    const vibrateExeCute = {
      abort(args, context) {
				console.log("VIBATE", "/vibrate abort - ran")
        const authorMods = {
          username: "/vibrate abort",
          avatar: "clyde",
        };
        const options = new Map(args.map((option) => [option.name, option]));
        const id = options.get("id").value;
        const vibrationIndex = vibrations.findIndex(
          (vibration) => vibration.id === id
        );
				console.log("VIBATE", {options, vibrationIndex, id})
        if (vibrationIndex === -1) {
          sendMessage(
            {
              channelId: context.channel.id,
              embeds: {
                title: `${EMOJIS.getFailure()} Invalid vibration ID`.trim,
                fields: [{ value: vibration.id, name: "Vibration ID" }],
              },
            },
            authorMods
          );
          return;
        }
        vibrations[vibrationIndex].aborting = true;
        sendMessage(
          {
            channelId: context.channel.id,
            embeds: [
              {
                title: `${EMOJIS.getLoading()} Aborting vibration…`,
                fields: [{ value: id, name: "Vibration ID" }],
              },
            ],
          },
          authorMods
        );
      },
      begin(args, context) {
				console.log("VIBATE", "/vibrate begin - ran")
        const authorMods = {
          username: "/vibrate begin",
          avatar: "clyde",
        };

        try {
          const cmdOptions = new Map(
            args.map((option) => [option.name, option])
          );
          const options = {
            duration: cmdOptions.get("duration").value,
            repeat: cmdOptions.get("repeat")?.value,
            gap: cmdOptions.get("gap")?.value,
          };
					console.log("VIBATE", {cmdOptions, options})
          vibrate(
            options,
            (vibration) => {
							console.log("VIBATE", "before start")
              // before start
              sendMessage(
                {
                  channelId: context.channel.id,
                  embeds: [
                    {
                      title: `<:vibrating:1095354969965731921> Started vibrating`,
                      description:
                        `for ${options.duration}ms` +
                        (options?.repeat
                          ? `, ${options.repeat} time${
                              options.repeat === 1 ? "" : "s"
                            }`
                          : "") +
                        "." +
                        (options?.gap
                          ? `With a gap of ${options?.gap}ms.`
                          : ""),

                      fields: [{ value: vibration.id, name: "Vibration ID" }],
                    },
                  ],
                },
                authorMods
              );
							console.log("VIBATE", "after start")
            },
            (vibration) => {
              // after finish
							console.log("VIBATE", "after finish")
              sendMessage(
                {
                  channelId: context.channel.id,
                  embeds: [
                    {
                      title: `<:still:1095977283212296194> ${
                        vibration.aborted ? "Abort" : "Finish"
                      }ed vibrating`,
                      fields: [{ value: vibration.id, name: "Vibration ID" }],
                    },
                  ],
                },
                authorMods
              );
							console.log("VIBATE", "after after finish")
            }
          );
        } catch (error) {
          console.error(error);
          sendMessage(
            {
              channelId: context.channel.id,
              content: `\`\`\`\n${error.stack}\`\`\``,
              embeds: [
                {
                  title:
                    `${EMOJIS.getFailure()} An error ocurred while running the command`.trim(),
                  description: `Send a screenshot of this error and explain how you came to it, here: ${PLUGINS_FORUM_POST_URL}, to hopefully get this error solved!`,
                },
              ],
            },
            authorMods
          );
        }
      },
    };
    plugin.patches.push(
      commands.registerCommand(
        cmdDisplays({
          execute: vibrateExeCute.begin,
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
              max_value: 9_999,
            },
            {
              type: 4,
              name: "repeat",
              description: "Number of times to repeat",
              min_value: 1,
              max_value: 9_999_999,
            },
            {
              type: 4,
              name: "gap",
              description:
                "Wait between vibrates (only matters if you have more than 1 repeat)",
            },
          ],
        })
      )
    );
    plugin.patches.push(
      commands.registerCommand(
        cmdDisplays({
          execute: vibrateExeCute.abort,
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
              description:
                "Vibration id, that you receive when running /vibrate begin",
            },
          ],
        })
      )
    );
    /*patches[0] = commands.registerCommand({
		execute: exeCute,
		name: "vibrate",
		displayName: "vibrate",
		// the client may show this eventually
		description: "b" + "r".repeat(50),
		displayDescription: "b" + "r".repeat(50),
		options: [
			{
				type: 1,
				name: "preset",
				displayName: "preset",
				description: "Run a preset vibration",
				displayDescription: "Run a preset vibration",
				options: [
					{
						type: 3,
						name: "preset",
						displayName: "preset",
						description: "Select a preset to vibrate",
						displayDescription: "Select a preset to vibrate",
						choices: [
							{
								name: "400ms, 10 times, 50ms delay",
								displayName: "400ms, 10 times, 50ms delay",
								value: "400;10;50",
							},
							{
								name: "9999ms, 6969 times, 0ms delay",
								displayName: "9999ms, 6969 times, 0ms delay",
								value: "9999;6969;0",
							},
						],
					},
				],
			},
			{
				type: 1,
				name: "start",
				displayName: "start",
				description: "Start a vibration",
				displayDescription: "Start a vibration",
				options: [
					{
						type: 4,
						name: "duration",
						displayName: "duration",
						description: "Duration of one vibration",
						displayDescription: "Duration of one vibration",
						min_value: 1,
						max_value: 9999,
					},
					{
						type: 3,
						name: "raw_preset",
						displayName: "raw_preset",
						description: "Put your custom preset here (duration;repeat;gap)",
						displayDescription:
							"Put your custom preset here (duration;repeat;gap)",
					},
				],
			},
		],
		// applicationId: -1,
		inputType: 1,
		type: 1,
	}); */
  } catch (e) {
    alert(e.stack);
  }
};

export default plugin;
