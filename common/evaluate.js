const AsyncFunction = (async()=>{}).constructor;

/* Evaluates code
 * @param {string} code Code to evaluate
 * @param {boolean} aweight Whether to await the evaluation
 * @param {boolean} global Whether to assign the next argument as the "this" for the evaluation
 * @param {any} [that]
 */
export default async function evaluate(code, aweight = true, global = false, that = {}) {
	if (!code) throw new Error("No code to evaluate");

	let result,
		errored = false,
		timings = [+new Date()];
		const args = [];
		if (!global) args.push(...Object.keys(that));

		let evalFunction = new AsyncFunction(...args, code);
		Object.keys(that).forEach((name, index) => {
			args[index] = that[name];
		});
	try {
		if (aweight) {
			result = await evalFunction(...args);
		} else {
			result = evalFunction(...args);
		}
	} catch (e) {
		result = e;
		errored = true;
	}
	timings[1] = +new Date();

	const res = { result, errored, timings };
	return res;
}


evaluate.SENSITIVE_PROPS = {
	USER: ["email", "phone", "mfaEnabled", "hasBouncedEmail"]
}
