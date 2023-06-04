(function (exports, commands, metro) {
  'use strict';

  let unregister;
  async function evaluate(src) {
    let isAsync = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false;
    let result, errored;
    if (isAsync || src.includes("await")) {
      if (src.includes(";") && (!src.endsWith(";") || src.includes("\n") || src.split(";").length > 2)) {
        src = `(async function() { ${src} })()`;
      } else {
        src = `(async function() { return ${src} })()`;
      }
    }
    let start = new Date().getTime();
    try {
      result = eval(src);
      if (result instanceof Promise) {
        result = await result;
      }
    } catch (e) {
      result = e;
      errored = true;
    }
    let elapsed = new Date().getTime() - start;
    return [
      errored,
      result,
      elapsed
    ];
  }
  const Clyde = metro.findByProps("createBotMessage");
  const Channels = metro.findByProps("getLastSelectedChannelId");
  const Messages = metro.findByProps("sendMessage");
  function sendReply(channelID, content) {
    const channel = channelID ?? Channels?.getChannelId?.();
    const msg = Clyde.createBotMessage({
      channelId: channel,
      content: ""
    });
    msg.author.username = "Vendetta";
    if (typeof content === "string") {
      msg.content = content;
    } else {
      Object.assign(msg, content);
    }
    Messages.receiveMessage(channel, msg);
  }
  var index = {
    onLoad: function() {
      unregister = commands.registerCommand({
        applicationId: "-1",
        name: "eval",
        displayName: "eval",
        description: "Runs code specified. BE CAREFUL! RUNNING UNVERIFIED CODE HERE CAN LEAD TO YOU BEING TOKEN LOGGED!",
        displayDescription: "Runs code specified. BE CAREFUL! RUNNING UNVERIFIED CODE HERE CAN LEAD TO YOU BEING TOKEN LOGGED!",
        type: 1,
        inputType: 1,
        options: [
          {
            name: "type",
            displayName: "type",
            description: "The type of the code to run (regular or asynchronous)",
            displayDescription: "The type of the code to run (regular or asynchronous)",
            type: 3,
            required: true,
            choices: [
              {
                name: "normal",
                displayName: "normal",
                value: false
              },
              {
                name: "async",
                displayName: "async",
                value: true
              }
            ]
          },
          {
            name: "source",
            displayName: "source",
            description: "The source of the code to run",
            displayDescription: "The source of the code to run",
            type: 3,
            required: true
          }
        ],
        execute: async function(args, message) {
          const type = args.find(function(o) {
            return o.name == "type";
          }).value;
          const src2 = args.find(function(o) {
            return o.name == "source";
          }).value;
          const [error, result2, elapsed2] = await evaluate(src2, type);
          sendReply(message.channel.id, [
            `${error ? "Failed executing" : "Successfully executed"} in ${elapsed2}ms`,
            `\`\`\`js
${result2}
\`\`\``
          ].join("\n"));
        }
      });
    },
    onUnload: function() {
      unregister();
    }
  };

  exports.default = index;

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;

})({}, vendetta.commands, vendetta.metro);
