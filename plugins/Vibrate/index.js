import { cmdDisplays, EMOJIS, AVATARS } from "../../helpers/index.js";
import * as enmity from "@vendetta";

const { metro, logger, commands } = enmity;
const {
	common: { ReactNative },
} = metro;
const { triggerHaptic } = metro.findByProps("triggerHaptic");
const PLUGIN_FORUM_POST_URL = "||not proxied||",
	APP_ID = "1113021888109740083",
	authorMods = {
		author: {
			username: "Vibrate",
			avatar: "command",
			avatarURL: AVATARS.command,
		},
	};
const plat = (n) =>
	ReactNative.Platform.select(
		typeof n === "object" &&
			(n.hasOwnProperty("ios") || n.hasOwnProperty("android"))
			? n
			: { ios: [n], android: n }
	);
const wait = (ms) => new Promise((res) => setTimeout(res, ms));

let vibrationIDIncremental = 0;
const vibrations = [];
async function vibrate(options, startCb, finishCb) {
	try {
		if (typeof options === "undefined") options = {};
		if (!options.repeat) options.repeat = 1;
		const vibration = {
			id: vibrationIDIncremental++,
			stopping: false,
			stopped: false,
			ios: plat({ ios: true, android: false }),
		};
		vibrations.push(vibration);
		console.log(vibration);
		vibration.startO = await startCb(vibration);

		// main vibration loop
		for (let i = 0; i < options.repeat; i++) {
			if (vibration.ios) {
				const interval = setInterval(triggerHaptic);
				await wait(options.duration);
				clearInterval(interval);
			} else {
				metro.common.ReactNative.Vibration.vibrate(options.duration);
				await wait(options.duration);
			}
			if (vibration.stopping === true) {
				vibration.stopped = true;
				break;
			}
			if (options.gap) await wait(options.gap);
		}
		vibrations.splice(
			vibrations.findIndex((v) => v.id === vibration.id),
			1
		);
		return finishCb(vibration);
	} catch (e) {
		console.error(e);
		alert("An error ocurred at vibrate()\n" + e.stack);
	}
}

export default {
	patches: [
		() => {
			// schedule all vibations to be stopped
			for (var i = 0; i < vibrations.length; i++) {
				vibrations[i].stopping = true;
			}
		},
	],
	onUnload() {
		this.patches.every((p) => (p(), true));
	},
	onLoad() {
		try {
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
							receiveMessage(message.channel_id, msg);
							return msg;
					  })(...arguments);
			};

			const exeCute = {
				start: (args, context) => {
					const messageMods = {
						...authorMods,
						interaction: {
							name: "/vibrate start",
							user: enmity.metro.findByStoreName("UserStore").getCurrentUser(),
						},
					};
					try {
						const cmdOptions = new Map(
							args.map((option) => [option.name, option])
						);
						const options = {
							duration: cmdOptions.get("duration").value,
							repeat: cmdOptions.get("repeat")?.value,
							gap: cmdOptions.get("gap")?.value,
						};
						const description =
							`for ${options.duration}ms` +
							(options?.repeat
								? `, ${options.repeat} time${options.repeat === 1 ? "" : "s"}`
								: "") +
							(options?.gap ? `. With a gap of ${options?.gap}ms` : "");

						vibrate(
							options,
							async (vibration) => {
								// Before starting the vibration
								return await sendMessage(
									{
										channel_id: context.channel.id,
										embeds: [
											{
												type: "rich",
												title: `<:vibrating:1095354969965731921> Started vibrating`,
												description,
												footer: { text: `ID: ${vibration.id}` },
											},
										],
									},
									messageMods
								);
							},
							async (vibration) => {
								// After ending the vibration
								const replyId = vibration.startO.id;
								sendMessage(
									{
										channel_id: context.channel.id,
										embeds: [
											{
												type: "rich",
												title: `<:still:1095977283212296194> ${
													vibration.stopped ? "Stopp" : "Finish"
												}ed vibrating`,
												footer: { text: `ID: ${vibration.id}` },
											},
										],
									},
									{
										...messageMods,
										type: 19,
										message_reference: {
											channel_id: context.channel.id,
											message_id: replyId,
											guild_id: context?.guild?.id,
										},
										referenced_message: enmity.metro
											.findByStoreName("MessageStore")
											.getMessage(context.channel.id, replyId),
									}
								);
							}
						);
					} catch (e) {
						sendMessage(
							{
								channel_id: context.channel.id,
								content: `\`\`\`js\n${e.stack}\`\`\``,
								embeds: [
									{
										type: "rich",
										title:
											`<${EMOJIS.getFailure()}> An error ocurred while running the command`,
										description: `Send a screenshot of this error and explain how you came to it, here: ${PLUGINS_FORUM_POST_URL}, to hopefully get this error solved!`,
									},
								],
							},
							messageMods
						);
						console.error(e);
					}
				},
				stop: async (args, context) => {
					const messageMods = {
						...authorMods,
						interaction: {
							name: "/vibrate stop",
							user: enmity.metro.findByStoreName("UserStore").getCurrentUser(),
						},
					};
					try {
						const options = new Map(
							args.map((option) => [option.name, option])
						);
						const id = options.get("id").value;
						if (vibrations.findIndex((v) => v.id === id) === -1) {
							await sendMessage(
								{
									channel_id: context.channel.id,
									embeds: [{
										type: "rich",
										title: `<${EMOJIS.getFailure()}> Vibration with id \`${id}\` not found.`,
									}],
								},
								messageMods
							)
							return
						}
						const vibration = vibrations[vibrations.findIndex((v) => v.id === id)];
						if (!vibration) return alert("what")
						vibration.stopping = true;
						vibration.startCbO = sendMessage(
							{
								channel_id: context.channel.id,
								embeds: [
									{
										type: "rich",
										title: `<${EMOJIS.getLoading()}> Stopping vibration…`,
										footer: { text: `ID: ${vibration.id}` },
									},
								],
							},
							messageMods
						);
					} catch (e) {
						sendMessage(
							{
								channel_id: context.channel.id,
								content: `\`\`\`js\n${e.stack}\`\`\``,
								embeds: [
									{
										type: "rich",
										title:
											`<${EMOJIS.getFailure()}> An error ocurred while running the command`,
										description: `Send a screenshot of this error and explain how you came to it, here: ${PLUGINS_FORUM_POST_URL}, to hopefully get this error solved!`,
									},
								],
							},
							messageMods
						);
						console.error(e);
					}
				},
			};
			// commands
			[
				cmdDisplays({
					execute: exeCute.stop,
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
				cmdDisplays({
					execute: exeCute.start,
					type: 1,
					inputType: 1,
					applicationId: "-1",
					name: "vibrate start",
					description: `Begin a brrr`,
					options: [
						{
							type: 4,
							required: true,
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
			].forEach((command) =>
				this.patches.unshift(commands.registerCommand(command))
			);

			/*patches[0] = commands.registerCommand({
		execute: exeCute,
		name: "vibrate",
		displayName: "vibrate",
		// the client may show this eventually
		description: "b" + "r".repeat(50),
		displayDescription: "b" + "r".repeat(50),
		options: [
			{
				type: 1,
				name: "preset",
				displayName: "preset",
				description: "Run a preset vibration",
				displayDescription: "Run a preset vibration",
				options: [
					{
						type: 3,
						name: "preset",
						displayName: "preset",
						description: "Select a preset to vibrate",
						displayDescription: "Select a preset to vibrate",
						choices: [
							{
								name: "400ms, 10 times, 50ms delay",
								displayName: "400ms, 10 times, 50ms delay",
								value: "400;10;50",
							},
							{
								name: "9999ms, 6969 times, 0ms delay",
								displayName: "9999ms, 6969 times, 0ms delay",
								value: "9999;6969;0",
							},
						],
					},
				],
			},
			{
				type: 1,
				name: "start",
				displayName: "start",
				description: "Start a vibration",
				displayDescription: "Start a vibration",
				options: [
					{
						type: 4,
						name: "duration",
						displayName: "duration",
						description: "Duration of one vibration",
						displayDescription: "Duration of one vibration",
						min_value: 1,
						max_value: 9999,
					},
					{
						type: 3,
						name: "raw_preset",
						displayName: "raw_preset",
						description: "Put your custom preset here (duration;repeat;gap)",
						displayDescription:
							"Put your custom preset here (duration;repeat;gap)",
					},
				],
			},
		],
		// applicationId: -1,
		inputType: 1,
		type: 1,
	}); */
		} catch (e) {
			console.error(e);
			alert("There was an error while loading Vibrate\n" + e.stack);
		}
	},
};
