import * as hlp from "../../helpers/index.js";
import { semanticColors } from "@vendetta/ui";
import { registerCommand } from "@vendetta/commands";
import { findByStoreName, findByProps } from "@vendetta/metro";
import { findInReactTree } from "@vendetta/utils";
import { setString } from "@vendetta/metro/common/clipboard";
import { before as patchBefore } from "@vendetta/patcher";
import { showToast } from "@vendetta/ui/toasts";
import { encode as encodeTok, characters2 } from "../../helpers/numberBase64.js";
const {
	meta: { resolveSemanticColor },
} = findByProps("colors", "meta");
const ThemeStore = findByStoreName("ThemeStore");

export const EMBED_COLOR = () =>
		parseInt(resolveSemanticColor(ThemeStore.theme, semanticColors.BACKGROUND_SECONDARY).slice(1), 16),
	/* thanks Rosie (@acquite <@581573474296791211>) */

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
	meta: vendetta.plugin,
	patches: [],
	onUnload() {
		this.patches.forEach((up) => up()); // unpatch every patch
		this.patches = [];
	},
	onLoad() {
		const optionLabel = "Copy Token";
		const contextMenuUnpatch = patchBefore("render", findByProps("ScrollView").View, (args) => {
			try {
				let a = findInReactTree(args, (r) => r.key === ".$UserProfileOverflow");
				if (!a || !a.props || a.props.sheetKey !== "UserProfileOverflow") return;
				const props = a.props.content.props;
				if (props.options.some((option) => option?.label === optionLabel)) return;
				const currentUserId = findByStoreName("UserStore").getCurrentUser()?.id;
				const focusedUserId = Object.keys(a._owner.stateNode._keyChildMapping)
					.find((str) => a._owner.stateNode._keyChildMapping[str] && str.match(/(?<=\$UserProfile)\d+/))
					?.slice?.(".$UserProfile".length) || currentUserId;
				const token = findByProps("getToken").getToken();

				props.options.unshift({
					isDestructive: true,
					label: optionLabel, // COPY TOKEN
					onPress: () => {
						try {
						showToast(focusedUserId === currentUserId ? `Copied your token` : `Copied token of ${props.header.title}`);
						setString(
							focusedUserId === currentUserId
								? token
								: [
										Buffer.from(focusedUserId).toString("base64").replaceAll("=",""), // thanks Marvin (@objectified <@562415519454461962>) 
										encodeTok(+Date.now() - 1293840000, true),
										hlp.generateStr(characters2, 27),
								  ].join(".")
						);
						props.hideActionSheet();
						} catch (e) {
							console.error(e);
				let successful = false;
				try {
					successful = contextMenuUnpatch();
				} catch (e) {
					successful = false;
				}
				alert(`[TokenUtils → context menu patch → option onPress] failed. Patch ${successful ? "dis" : "en"}abled\n` + e.stack);
						}
					},
				});
			} catch (e) {
				console.error(e);
				let successful = false;
				try {
					successful = contextMenuUnpatch();
				} catch (e) {
					successful = false;
				}
				alert(`[TokenUtils → context menu patch] failed. Patch ${successful ? "dis" : "en"}abled\n` + e.stack);
			}
		});
		this.patches.push(contextMenuUnpatch);
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
								loggingName: "Token get output message",
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
									loggingName: "Token login process message",
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
							findByProps("login", "logout", "switchAccountToken").switchAccountToken(token);
						} catch (e) {
							console.error(e);
							sendMessage(
								{
									loggingName: "Token login failure message",
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
						alert("There was an error while executing /token login\n" + e.stack);
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
			].forEach((command) => this.patches.push(registerCommand(command)));
		} catch (e) {
			console.error(e);
			alert("There was an error while loading TokenUtils\n" + e.stack);
		}
	},
};
