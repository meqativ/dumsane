const { metro, logger, commands } = vendetta;
const { vibrate: vibro } = metro.findByProps("vibrate");
const plat = (n) =>
	metro.findByProps("View").Platform.select({ ios: [n], android: n });
const plugin = {};
const patches = [];
plugin.onUnload = () => patches.every((p) => (p(), true));
const MessageActions = metro.findByProps("sendMessage", "receiveMessage");
const BotMessage = metro.findByProps("createBotMessage");
const Avatars = metro.findByProps("BOT_AVATARS");

function sendMessage(message, mod) {
    if (mod?.author.avatar && mod?.author?.avatarURL) {
        Avatars.BOT_AVATARS[mod.author.avatar] = mod.author.avatarURL;
        delete mod.author.avatarURL;
    }
    let msg = BotMessage.createBotMessage(message);
    msg = metro.findByProps("merge").merge(msg, mod);
    MessageActions.receiveMessage(message.channelId, msg);
    return msg;
}
plugin.onLoad = () => {
	patches[0] = commands.registerCommand({
		execute: (args, ctx) => exeCute(args, ctx, "begin"),
		type: 1,
		inputType: 1,
		applicationId: "-1",
		name: "vibrate begin",
		displayName: "vibrate begin",
		description: "Begin vibrating a basic scheme",
		displayDescription: "Begin vibrating a basic scheme",
		options: [
			{
				type: 4,
				required: true,
				name: "duration",
				displayName: "duration",
				description: "Duration of one vibration (in milliseconds)",
				displayDescription: "Duration of one vibration (in milliseconds)",
			},
			{
				type: 4,
				name: "repeat",
				displayName: "repeat",
				description: "Number of times to repeat",
				displayDescription: "Number of times to repeat",
			},
			{
				type: 4,
				name: "gap",
				displayName: "gap",
				description:
					"Wait between vibrates (only matters if you have more than 1 repeat)",
				displayDescription:
					"Wait between vibrates (only matters if you have more than 1 repeat)",
			},
		],
	});
	patches[1] = commands.registerCommand({
		execute: (args, ctx) => exeCute(args, ctx, "cancel"),
		type: 1,
		inputType: 1,
		applicationId: "-1",
		name: "vibrate cancel",
		displayName: "vibrate cancel",
		description: "Cancel a running scheme",
		displayDescription: "Cancel a running scheme",
		options: [
			{
				type: 4,
				required: true,
				name: "id",
				displayName: "id",
				description: "Id of the running scheme (given to you when you run it)",
				displayDescription: "Id of the running scheme (given to you when you run it)",
			},
		],
	});
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
};
const authorMods = {
	username: "/vibrate",
	avatar: undefined,
};
let running = new Map()
async function exeCute(args, context, subcommand) {
	const options = new Map(args.map((option) => [option.name, option]));
	if (subcommand === "cancel") {
		const id = options.get("id").value;

		const cute = running.get(id);
		if (!cute) {//wtf you're not cute, impossible
			sendMessage({
				channelId: context.channel.id,
				content: `${emoji} There's no running scheme with that id`,
				...authorMods
			})
			return
		}
		cute()
	return
	} else if (subcommand === "scheme") {
	return
	}
	const dur = options.get("duration").value;
	const rep = options.get("repeat")?.value;
	const gap = options.get("gap")?.value;
	const id = `${+Date.now()}`;


	sendMessage({
		channelId: context.channel.id,
		content:
			`<:vibrating:1095354969965731921> Vibrating id ${id}, for ${dur}ms` +
			(rep ? `, ${rep} time${rep === 1 ? "" : "s"}` : "") +
			"." +
			(gap ? `With a gap of ${gap}ms.` : ""),
		...authorMods
	});
	vibrate(id, dur, rep, gap)
	.then((id, b, e) => {
		running.delete(id)
		sendMessage({
			channelId: context.channel.id,
			content: `<:still:1095977283212296194> Finished vibrating.`,
			...authorMods
		});
	});
}
async function vibrate(id, duration, repeat = 1, gap = 0, cb) {
	returnconst wait = (ms) => new Promise((res) => setTimeout(res, ms));
	const begin = Date.now();
	let stopping = false;
	const end = () => cb()	



	for (let i = 0; i < repeat; i++) {
		vibro(plat(duration), true);
		await wait(duration);
		if (stopping) {
			cb(begin, end, id)
			break
		};
		await wait(gap);
	}
	const end = Date.now();
	cb(begin, end, id);
}
export default plugin;
