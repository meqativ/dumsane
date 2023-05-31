import * as hlp from "../../helpers/index.js";
import { metro, commands } from "@vendetta";

const authorMods = {
	author: {
		username: "TokenUtils",
		avatar: "command",
		avatarURL: hlp.AVATARS.command,
	},
};
let madeSendMessage;
function sendMessage() {
	if (window.sendMessage) return window.sendMessage?.(...arguments)
	if (!madeSendMessage) madeSendMessage = hlp.mSendMessage(vendetta);
	return madeSendMessage(...arguments)
};

export default {
	patches: [],
	onUnload() {
		this.patches.forEach(up=>up()) // unpatch every added patch
	},
	onLoad() {
		try {
			const exeCute = {
				get(args, ctx) {
					try {
					const messageMods = {
						...authorMods,
						interaction: {
							name: "/token get",
							user: metro.findByStoreName("UserStore").getCurrentUser(),
						},
					};
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
					try {
					const messageMods = {
						...authorMods,
						interaction: {
							name: "/token login",
							user: metro.findByStoreName("UserStore").getCurrentUser(),
						},
					};
						const options = new Map(args.map((a) => [a.name, a]));
						const token = options.get("token").value;
						try {
							sendMessage(
								{
									channelId: ctx.channel.id,
									embeds: [
										{
											type: "rich",
											title: `<${hlp.EMOJIS.getLoading()}> Switching accounts…`,
										},
									],
								},
								messageMods
							);
							metro
								.findByProps("login", "logout", "switchAccountToken")
								.switchAccountToken(token);
						} catch (e) {
							sendMessage(
								{
									channelId: ctx.channel.id,
									embeds: [
										{
											type: "rich",
											title: `<${hlp.EMOJIS.getFailure()}> Failed to login`,
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
				hlp.cmdDisplays({
					type: 1,
					inputType: 1,
					applicationId: "-1",
					execute: exeCute.get,
					name: "token get",
					description: "Shows your current user token",
				}),
				hlp.cmdDisplays({
					type: 1,
					inputType: 1,
					applicationId: "-1",
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
