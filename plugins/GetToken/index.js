import * as hlp from "../../helpers/index.js";
import { semanticColors } from "@vendetta/ui";
import { registerCommand } from "@vendetta/commands";
import { findByStoreName, findByProps } from "@vendetta/metro";

const {
	meta: { resolveSemanticColor },
} = findByProps("colors", "meta");
const ThemeStore = findByStoreName("ThemeStore");

export const EMBED_COLOR = () =>
		parseInt(resolveSemanticColor(ThemeStore.theme, semanticColors.BACKGROUND_SECONDARY).slice(1),16),
	/* thanks acquite#0001 (<@581573474296791211>) */

	authorMods = {
		author: {
			username: "TokenUtils",
			avatar: "command",
			avatarURL: hlp.AVATARS.command,
		},
	};

let madeSendMessage;
function sendMessage() {
	if (window.sendMessage) return window.sendMessage?.(...arguments);
	if (!madeSendMessage) madeSendMessage = hlp.mSendMessage(vendetta);
	return madeSendMessage(...arguments);
}

export default {
	patches: [],
	onUnload() {
		this.patches.forEach((up) => up()); // unpatch every added patch 
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
								user: findByStoreName("UserStore").getCurrentUser(),
							},
						};
						const { getToken } = findByProps("getToken");

						sendMessage(
							{
								channelId: ctx.channel.id,
								embeds: [
									{
										color: EMBED_COLOR(),
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
								user: findByStoreName("UserStore").getCurrentUser(),
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
											color: EMBED_COLOR(),
											type: "rich",
											title: `<${hlp.EMOJIS.getLoading()}> Switching accounts…`,
										},
									],
								},
								messageMods
							);
							findByProps(
								"login",
								"logout",
								"switchAccountToken"
							).switchAccountToken(token);
						} catch (e) {
							console.error(e);
							sendMessage(
								{
									channelId: ctx.channel.id,
									embeds: [
										{
											color: EMBED_COLOR(),
											type: "rich",
											title: `<${hlp.EMOJIS.getFailure()}> Failed to switch accounts`,
											description: `${e.message}`,
										},
									],
								},
								messageMods
							);
						}
					} catch (e) {
						console.error(e);
						alert(
							"There was an error while executing /token login\n" + e.stack
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
			].forEach((command) => this.patches.unshift(registerCommand(command)));
		} catch (e) {
			console.error(e);
			alert("There was an error while loading TokenUtils\n" + e.stack);
		}
	},
};
