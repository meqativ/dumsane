import * as common from "../../common";
import { registerCommand } from "@vendetta/commands";
import { findByProps, findByStoreName } from "@vendetta/metro";
import { ReactNative } from "@vendetta/metro/common";
import { storage } from "@vendetta/plugin";
import { semanticColors } from "@vendetta/ui";
import {
	parseScheme,
	generateBasicScheme,
	schemesError,
} from "./schemeUtils.js";
export const PLUGIN_FORUM_POST_URL = "||not proxied||",
	APP_ID = "1113021888109740083",
	authorMods = {
		author: {
			username: "Vibrate",
			avatar: "command",
			avatarURL: common.AVATARS.command,
		},
	};
common.makeDefaults(vendetta.plugin.storage, 
{
	stats: {
		localRuns: 0,
		publicRuns: 0,
		lastVibration: {
			scheme: generateBasicScheme(150, 5),
		}
	}
})

const {
	meta: { resolveSemanticColor },
} = findByProps("colors", "meta");
const ThemeStore = findByStoreName("ThemeStore");

export const EMBED_COLOR = () =>
	parseInt(
		resolveSemanticColor(
			ThemeStore.theme,
			semanticColors.BACKGROUND_BASE_LOWER
		).slice(1),
		16
	);
/* thanks acquite#0001 (<@581573474296791211>) */

let madeSendMessage;
export function sendMessage() {
	if (window.sendMessage) return window.sendMessage?.(...arguments);
	if (!madeSendMessage) madeSendMessage = common.mSendMessage(vendetta);
	return madeSendMessage(...arguments);
}

const { triggerHaptic } = findByProps("triggerHaptic");
const selectPlatform = ReactNative.Platform.select;
const wait = (ms) => new Promise((res) => setTimeout(res, ms));
let vibrationIDIncremental = 0;
export const vibrations = [];
export async function vibrate(options) {
	try {
		if (typeof options === "undefined") options = {};
		if (!options?.scheme) throw new Error("No scheme provided");

		const vibration = {
			id: vibrationIDIncremental++,
			meta: {
				rawScheme: options.scheme,
			},
			stopping: false,
			stopped: false,
			ios: !!selectPlatform({ ios: true }),
		};

		if (options?.parseCB)
			vibration.parseCallbackOutput = await options.parseCB(vibration);
		vibration.scheme = parseScheme(vibration.meta.rawScheme, options?.debug);
		vibrations.push(vibration);
		console.log("VIBRATION", vibration);
		if (vibration.scheme.error === true) {
			vibration.errored = true;
			if (options?.parseFailCB)
				vibration.errorCallbackOutput = await options.parseFailCB(vibration);
		}
		if (!vibration.errored && options?.startCB)
			vibration.startCallbackOutput = await options.startCB?.(vibration);
		if (!vibration.errored) {
			storage["localRuns"]++;
			for (var funk of vibration.scheme) {
				if (!funk.name) continue;
				const duration = funk.args.find(
					(arg) => arg.name === "duration"
				)?.value;
				switch (funk.name) {
					case "vibrate":
						if (vibration.ios) {
							triggerHaptic();
							const interval = setInterval(triggerHaptic, 1);
							await wait(duration ?? 400);
							clearInterval(interval);
						} else {
							ReactNative.Vibration.vibrate(duration ?? 400);
							await wait(duration ?? 400);
						}
						break;
					case "wait":
						await wait(duration ?? 5);
						break;
					default:
						vibration.errored = true;
						vibration.stopping = true;
						vibration.error = { message: "Unknown funk: " + funk.name };
						if (options?.errorCB)
							vibration.errorCallbackOutput = options.errorCB(vibration);
				}
				if (vibration.stopping === true) {
					vibration.stopped = true;
					break;
				}
				if (vibration.errored) break;
			}
		}
		vibrations.splice(
			vibrations.findIndex((v) => v.id === vibration.id),
			1
		);
		return vibration.errored
			? vibration.errorCallbackOutput
			: options?.finishCB?.(vibration);
	} catch (e) {
		console.error(e);
		alert("An error ocurred at vibrate()\n" + e.stack);
	}
}

import { command as cmd1 } from "./commands/start.js";
import { command as cmd2 } from "./commands/stop.js";

export default {
	meta: vendetta.plugin,
	patches: [],
	onUnload() {
		this.patches.forEach((up) => up()); // unpatch every patch
		this.patches = [];
	},
	onLoad() {
		this.patches.push(() => {
			// schedule all vibations to be stopped
			for (var i = 0; i < vibrations.length; i++) {
				vibrations[i].stopping = true;
			}
		});
		try {
			const plugin = this;
			[
				common.cmdDisplays({
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
					name: "vibrate stop",
					description: `Stop a brrr`,
					options: [
						{
							type: 4,
							required: true,
							name: "id",
							description:
								"Vibration id which you receive when starting a vibration",
						},
					],
				}),
				common.cmdDisplays({
					async execute(args, ctx){
						return await cmd1.exeCute({
							...ctx,
							args: new Map(args.map((o) => [o.name, o])),
							command: this,
							plugin,
						})},
					type: 1,
					inputType: 1,
					applicationId: "-1",
					name: "vibrate start",
					description: `Start a brrr`,
					options: [
						{
							type: 3,
							name: "scheme",
							description:
								"A custom scheme to use (overwrites all other options)",
							min_length: 1,
						},
						{
							type: 4,
							name: "duration",
							description: "Duration of one vibration (ms)",
							min_value: 1,
						},
						{
							type: 4,
							name: "repeat",
							description: "Number of times to repeat",
						},
						{
							type: 4,
							name: "gap",
							description:
								"Wait between vibrations (only matters if you have more than 1 repeat)",
						},
					],
				}),
			].forEach((command) => this.patches.unshift(registerCommand(command)));
		} catch (e) {
			console.error(e);
			alert("There was an error while loading Vibrate\n" + e.stack);
		}
	},
};
