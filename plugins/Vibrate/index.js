import { cmdDisplays, EMOJIS, AVATARS } from "../../helpers/index.js";
const { metro, logger, commands } = vendetta;
const Vibration = vendetta.metro.common.ReactNative.Vibration;
const { triggerHaptic } = vendetta.metro.findByProps("triggerHaptic");
const PLUGIN_FORUM_POST_URL = "||not proxied||";
const plat = (n) =>
	metro
		.findByProps("View")
		.Platform.select(
			typeof n === "object" &&
				(n.hasOwnProperty("ios") || n.hasOwnProperty("android"))
				? n
				: { ios: [n], android: n }
		);
const wait = (ms) => new Promise((res) => setTimeout(res, ms));

const vibrations = [];
async function vibrate(options, startCb, finishCb) {
	try {
		if (typeof options === "undefined") options = {};
		if (!options.repeat) options.repeat = 1;
		const vibration = {
			id: +Date.now(),
			stopping: false,
			stopped: false,
			ios: plat({ ios: true, android: false }),
		};
		vibrations.push(vibration);
		console.log(vibration);
		startCb(vibration);

		// main vibration loop
		for (let i = 0; i < options.repeat; i++) {
			if (vibration.ios) {
				const interval = setInterval(() => triggerHaptic(), 5);
				await wait(options.duration);
				clearInterval(interval);
			} else {
				Vibration.vibrate(1e69);
				await wait(options.duration);
				Vibration.clear();
			}
			if (vibration.stopping === true) {
				vibration.stopped = true;
				break;
			}
			if (options.gap) await wait(options.gap);
		}
		vibration.deleted =
			delete vibrations[vibrations.findIndex((v) => v.id === vibration.id)];
		finishCb(vibration);
	} catch (e) {
		alert(e.stack);
		console.error(e.stack);
	}
}

export default {
	patches: [
		() => {
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
			function sendMessage(message, mod) {
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
				console.log("VIBATE SEND MSG", { msg });
				return msg;
			}
			const exeCute = {
				start: (args, context) => {
					const authorMods = {
						author: {
							username: "/vibrate start",
							avatar: "command",
							avatarURL: AVATARS.command,
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
							(options?.gap ? `. With a gap of ${options?.gap}ms.` : "");

						vibrate(
							options,
							async (vibration) => {
								// Before starting the vibration
								sendMessage(
									{
										channelId: context.channel.id,
										embeds: [
											{
												type: "rich",
												title: `<:vibrating:1095354969965731921> Started vibrating`,
												description,
												fields: [
													{ value: `${vibration.id}`, name: "Vibration ID" },
												],
											},
										],
									},
									authorMods
								);
							},
							async (vibration) => {
								// After ending the vibration
								sendMessage(
									{
										channelId: context.channel.id,
										embeds: [
											{
												type: "rich",
												title: `<:still:1095977283212296194> ${
													vibration.stopped ? "Abort" : "Finish"
												}ed vibrating`,
												fields: [
													{ value: `${vibration.id}`, name: "Vibration ID" },
												],
											},
										],
									},
									authorMods
								);
							}
						);
					} catch (e) {
						alert(e.stack);
						console.error(e);
						sendMessage(
							{
								channelId: context.channel.id,
								content: `\`\`\`\n${e.stack}\`\`\``,
								embeds: [
									{
										type: "rich",
										title:
											`<${EMOJIS.getFailure()}> An error ocurred while running the command`.trim(),
										description: `Send a screenshot of this error and explain how you came to it, here: ${PLUGINS_FORUM_POST_URL}, to hopefully get this error solved!`,
									},
								],
							},
							authorMods
						);
					}
				},
				stop: (args, context) => {
					const authorMods = {
						author: {
							username: "/vibrate stop",
							avatar: "command",
							avatarURL: AVATARS.command,
						},
					};
					try {
						const options = new Map(
							args.map((option) => [option.name, option])
						);
						const id = options.get("id").value;
						const vibrationIndex = vibrations.findIndex(
							(vibration) => vibration.id === id
						);
						if (vibrationIndex === -1) {
							sendMessage(
								{
									channelId: context.channel.id,
									embeds: {
										type: "rich",
										title: `<${EMOJIS.getFailure()}> Invalid vibration ID`.trim,
										fields: [{ value: `${id}`, name: "Vibration ID" }],
									},
								},
								authorMods
							);
							return;
						}
						vibrations[vibrationIndex].stopping = true;
						sendMessage(
							{
								channelId: context.channel.id,
								embeds: [
									{
										type: "rich",
										title: `<${EMOJIS.getLoading()}> Aborting vibration…`,
										fields: [{ value: `${id}`, name: "Vibration ID" }],
									},
								],
							},
							authorMods
						);
					} catch (e) {
						alert(e.stack);
						console.error(e);
						sendMessage(
							{
								channelId: context.channel.id,
								content: `\`\`\`\n${e.stack}\`\`\``,
								embeds: [
									{
										type: "rich",
										title:
											`<${EMOJIS.getFailure()}> An error ocurred while running the command`.trim(),
										description: `Send a screenshot of this error and explain how you came to it, here: ${PLUGINS_FORUM_POST_URL}, to hopefully get this error solved!`,
									},
								],
							},
							authorMods
						);
					}
				},
			}[
				// commands
				(cmdDisplays({
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
							description: "Duration of one vibration (in milliseconds)",
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
								"Wait between vibrates (only matters if you have more than 1 repeat)",
						},
					],
				}),
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
				}))
			].forEach((command) =>
				this.patches.push(commands.registerCommand(command))
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
			alert(e.stack);
		}
	},
};
