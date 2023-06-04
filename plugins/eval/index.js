import { registerCommand } from "@vendetta/commands";
import { findByProps } from '@vendetta/metro';

let unregister;
async function evaluate(src, isAsync = false) {
    let result, errored;
    if (isAsync || src.includes("await")) {
        if (src.includes(";") && (!src.endsWith(";") || src.includes("\n") || (src.split(';').length) > 2)) {
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
    } catch(e) {
        result = e;
        errored = true;
    }
  
    let elapsed = new Date().getTime() - start;
    return [errored, result, elapsed];
}

const Clyde = findByProps('createBotMessage');
const Channels = findByProps('getLastSelectedChannelId');
const Messages = findByProps("sendMessage");

function sendReply(channelID, content) {
  const channel = channelID ?? Channels?.getChannelId?.();
  const msg = Clyde.createBotMessage({ channelId: channel, content: '' });

  msg.author.username = 'Vendetta';

  if (typeof content === 'string') {
    msg.content = content;
  } else {
    Object.assign(msg, content);
  }

  Messages.receiveMessage(channel, msg);
}

export default {
  onLoad: () => {
    unregister = registerCommand({
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
                required: true,
            },
        ],
        execute: async function (args, message) {
            const type = args.find(o => o.name == "type").value
            const src = args.find(o => o.name == "source").value
            const [error, result, elapsed] = await evaluate(src, type);
            sendReply(message.channel.id, [
                `${error ? "Failed executing" : "Successfully executed"} in ${elapsed}ms`,
                `\`\`\`js\n${result}\n\`\`\``
            ].join('\n'))
        }
    });
  },
  onUnload: () => {
    // remove cmd
    unregister();
  },
};