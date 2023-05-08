export default {
	onLoad() {
		this.onUnload = vendetta.patcher.before(
			"start",
			vendetta.metro.findByProps("Timeout").Timeout.prototype,
			(args) => {
				if (args[1].name === "disconnect") {
					args[1] = () => {};
				}
				return args;
			}
		);
	},
};
