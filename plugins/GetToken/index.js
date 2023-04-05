(function (plugin) {
	plugin.default = {
		onLoad: function () {
			const { metro, commands, logger } = vendetta;

			const { sendBotMessage } = metro.findByProps("sendBotMessage");
			const { getToken } = metro.findByProps("getToken");
			const { sendMessage } = metro.findByProps(
				"sendMessage",
				"receiveMessage"
			);

			function exeCute(args, ctx) {
				const options = new Map(args.map((option) => [option.name, option]));
				const content = `Token: ${getToken()}`;
				if (options.get("send").value) {
					sendMessage(ctx.channel.id, { content });
				} else {
					sendBotMessage(ctx.channel.id, content);
				}
			}
			this.onUnload = commands.registerCommand({
				execute: exeCute,
				name: "token",
				displayName: "token",
				description: "View your token",
				displayDescription: "View your token",
				options: [
					{
						required: false,
						type: 5,
						name: "send",
						displayName: "send",
						description: "⛔⛔⛔ Send the token in channel or not?",
						displayDescription: "⛔⛔⛔ Send the token in the channel or not?",
					},
				],
				applicationId: -1,
				inputType: 1,
				type: 1,
			});
		},
	};
	Object.defineProperty(plugin, "__esModule", { value: true });
	return plugin;
})({});
