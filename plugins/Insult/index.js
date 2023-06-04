import * as hlp from "../../helpers/index.js";
import { semanticColors } from "@vendetta/ui";
import { registerCommand } from "@vendetta/commands";
import { findByStoreName, findByProps } from "@vendetta/metro";

const {
	meta: { resolveSemanticColor },
} = findByProps("colors", "meta");
const ThemeStore = findByStoreName("ThemeStore");

export const EMBED_COLOR = () =>
		parseInt(
			resolveSemanticColor(
				ThemeStore.theme,
				semanticColors.BACKGROUND_SECONDARY
			).slice(1),
			16
		),
	/* thanks acquite#0001 (<@581573474296791211>) */

	authorMods = {
		author: {
			username: vendetta.plugin.name,
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
	onUnload(){
		this.patches.forEach((up) => up()); // unpatch every patch
		this.patches = [];},
	onLoad() {
		const plugin = this;
		try {
			const exeCute = {
				get(interaction) {
					const { channel } = interaction;
					try {
						const messageMods = {
							...authorMods,
							interaction: {
								name: "/insult",
								user: findByStoreName("UserStore").getCurrentUser(),
							},
						};
						return { content: "insulted" };
					} catch (e) {
						console.error(e);
						alert("There was an error while exeCuting /insult\n" + e.stack);
					}
				},
			};
			[
				hlp.cmdDisplays({
					async execute(args, ctx){
						return await cmd2.exeCute({
							...ctx,
							args: new Map(args.map((o) => [o.name, o])),
							command: this,
							plugin,
						})},
					type: 1,
					inputType: 1,
					applicationId: "-1",
					name: "insult",
					description: "Send an insult from the web",
				}),
			].forEach((command) => this.patches.push(registerCommand(command)));
		} catch (e) {
			console.error(e);
			alert("There was an error while loading Insult\n" + e.stack);
		}
	},
};
