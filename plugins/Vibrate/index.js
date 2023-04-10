const { metro, logger, commands } = vendetta;
const { vibrate } = metro.findByProps("vibrate");
const plat = (n) => metro.findByProps("View").Platform.select({ ios: [n], android: n });
const plugin = {};
const patches = [];
plugin.onUnload = () => patches.every((p) => (p(), true));
plugin.onLoad = () => {
	patches[0] = commands.registerCommand({
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
	});
};
function exeCute(args, context) {
	const options = new Map(args.map((option) => [option.name, option]));
	return { content: "helo from exeCute" };
}

export default plugin;
