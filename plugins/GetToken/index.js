import { cmdDisplays, EMOJIS, AVATARS } from "../../helpers/index.js";
const authorMods = {
	author: {
		username: "TokenUtils",
		avatar: "command",
		avatarURL: AVATARS.command,
	},
};

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
			const sendMessage = function () {
				return window.sendMessage
					? window.sendMessage?.("meow", ...arguments)
					: ((message, mod) => {
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
					  })(...arguments);
			};
			const exeCute = {
				get(args, ctx) {
					const messageMods = {
						...authorMods,
						interaction: {
							name: "/token get",
							user: metro.findByStoreName("UserStore").getCurrentUser(),
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
							messageMods
						);
					} catch (e) {
						console.error(e);
						alert("There was an error while exeCuting /token get\n" + e.stack);
					}
				},
				login(args, ctx) {
					const messageMods = {
						...authorMods,
						interaction: {
							name: "/token login",
							user: metro.findByStoreName("UserStore").getCurrentUser(),
						},
					};
					try {
						const options = new Map(args.map((a) => [a.name, a]));
						const token = options.get("token").value;
						try {
							sendMessage(
								{
									channelId: ctx.channel.id,
									embeds: [
										{
											type: "rich",
											title: `<${EMOJIS.getLoading()}> Switching accounts…`,
										},
									],
								},
								messageMods
							);
							vendetta.metro
								.findByProps("login", "logout", "switchAccountToken")
								.switchAccountToken(token);
						} catch (e) {
							sendMessage(
								{
									channelId: ctx.channel.id,
									embeds: [
										{
											type: "rich",
											title: `<${EMOJIS.getFailure()}> Failed to login`,
											description: `${e.message}`,
										},
									],
								},
								messageMods
							);
							console.error(e);
						}
					} catch (e) {
						console.error(e);
						alert(
							"There was an error while exeCuting /token login\n" + e.stack
						);
					}
				},
			};
			[
				cmdDisplays({
					execute: exeCute.get,
					name: "token get",
					description: "Shows your current user token",
					applicationId: "-1",
					inputType: 1,
					type: 1,
				}),
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
				}),
			].forEach((command) =>
				this.patches.unshift(commands.registerCommand(command))
			);
		} catch (e) {
			console.error(e);
			alert(
				"There was an error while loading TokenUtils(GetToken)\n" + e.stack
			);
		}
	},
};
