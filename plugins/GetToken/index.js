export default {
		onLoad: function () {
			const { metro, commands, logger } = vendetta;

			const { sendBotMessage: sendEphemeralClydeMessage } =
				metro.findByProps("sendBotMessage");
			const { getToken } = metro.findByProps("getToken");
			//  const { sendMessage } = metro.findByProps(
			//		"sendMessage",
			//		"receiveMessage"
			//	);

			//	function exeCute(args, ctx) {
			//		const options = new Map(args.map((option) => [option.name, option]));
			//		const content = `Token: ${getToken()}`;
			//		const send = options.filter(o=>o.name.startsWith("send")).every(o=>o.value === true);
			//		if (send) {
			//			sendMessage(ctx.channel.id, { content });
			//		} else {
			//			sendBotMessage(ctx.channel.id, content);
			//		}
			//	}

			this.onUnload = commands.registerCommand({
				// execute: exeCute,
				execute: (args, ctx) => {
					try {
						sendEphemeralClydeMessage(ctx.channel.id, `Token: ${getToken()}`);
					} catch (err) {
						logger.error(err)
						sendEphemeralClydeMessage(ctx.channel.id, `An error has occured while executing the command.\n`+
						`(${err.message})`);
					}
				},
				name: "token",
				displayName: "token",
				description: "Shows your user token",
				displayDescription: "Shows your user token",
				/*options: Array.from({length:20}).fill({
						required: false,
						type: 5,
						name: "send",
						displayName: "send",
						description: "⛔⛔⛔ Send the token in channel or not?",
						displayDescription: "⛔⛔⛔ Send the token in the channel or not?",
					}).map((option,uwu)=>{const name = option.name+((uwu)?String.fromCharCode(64+uwu):""); return {...option, name: name, displayName: name}}),*/
				applicationId: -1,
				inputType: 1,
				type: 1,
			});
		},
	};
