const AsyncFunction = (async()=>{}).constructor;

/* Evaluates code
 * @param {string} code Code to evaluate
 * @param {boolean} aweight Whether to await the evaluation
 * @param {boolean} global Whether to assign the next argument as the "this" for the evaluation
 * @param {any} [that]
 */
export default async function evaluate(code, aweight = true, global = false, that = {}, autoruns) {
	if (!code) throw new Error("No code to evaluate");

	let result,
		errored = false,
		start = +new Date();
	try {
		const args = [];
		if (!global) args.push(...Object.keys(that));
		args.push(code);

		let evalFunction = new AsyncFunction(...args);
		Object.keys(that).forEach((name, index) => {
			args[index] = that[name];
		});
		if (aweight) {
			result = await evalFunction(...args);
		} else {
			result = evalFunction(...args);
		}
	} catch (e) {
		result = e;
		errored = true;
	}
	let end = +new Date();

	const res = { result, errored, start, end, elapsed: end - start };
	return res;
}


evaluate.SENSITIVE_PROPS = {
	USER: ["email", "phone", "mfaEnabled", "hasBouncedEmail"]
}
