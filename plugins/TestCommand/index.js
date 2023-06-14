import * as hlp from "../../helpers/index.js";
import { registerCommand } from "@vendetta/commands";
import { findByStoreName, findByProps } from "@vendetta/metro";
let madeSendMessage;
function sendMessage() {
	if (window.sendMessage) return window.sendMessage?.(...arguments);
	if (!madeSendMessage) madeSendMessage = hlp.mSendMessage(vendetta);
	return madeSendMessage(...arguments);
}
function putAProxy(obj) {
	return new Proxy(obj, {
		get(t, k) {
			console.log(`Accessed ${k}`);
			return t[k];
		},
	});
}
export default {
	meta: vendetta.plugin,
	patches: [],
	onUnload() {
		this.patches.forEach((up) => up()); // unpatch every patch
		this.patches = [];
	},
	onLoad() {
		try {
			[
				hlp.cmdDisplays({
					execute: async (args, ctx) => {
						if (ctx.autocomplete) {
							const c = [{ name: "meow", displayName: "meow", value: "mrrp" }];

							console.log(ctx.autocomplete);
							// WHAT THE FUCK DO I RETURN IT KEEPSS RECURSIVELY ACCESSING then
							return new Promise((res, rej) => {
								return res(
									new Promise((res, rej) => {
										return res(
											new Promise((res, rej) => {
												return res(putAProxy({ choices: c }));
											})
										);
									})
								);
							});
						}
						sendMessage({
							content: args.find((a) => a.name === "text-area").value,
						});
					},
					type: 1,
					inputType: 1,
					applicationId: "-1",
					name: "!test",
					description: "test",
					options: [
						{
							required: true,
							autocomplete: true,
							type: 3,
							name: "text-area",
							description: "Token of the account to login into",
						},
					],
				}),
			].forEach((command) => this.patches.push(registerCommand(command)));
		} catch (e) {
			console.error(e);
			console.log(e.stack);
			alert("There was an error while loading TestCommand\n" + e.stack);
		}
	},
};
