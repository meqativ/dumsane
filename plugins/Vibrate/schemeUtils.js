export function generateBasicScheme(duration = 200, repeat = 1, gap = 0) {
  return Array.from(
    { length: repeat },
    () => `vibrate(duration = ${duration})`
  ).join(gap > 0 ? `\nwait(time = ${gap})\n` : "\n");
}
function stfu(number, or) {
  return number < 0 ? or ?? 0 : number;
}
function schemesError(e) {
  e.error = true;
  e.toString = function () {
    const at = `${this.line} | `;
    const character = this.character + at.length;
    let top, bottom;
    if (this.lines) {
      top = this.lines
        .splice(this.line - 3, this.line - 1)
        .reduce((a, l, i) => a + `${i + this.line - 3} | ${l}\n`, "");
      bottom =
        "\n" +
        this.lines
          .slice(this.line, this.line + 3)
          .reduce((a, l, i) => a + `${i + this.line + 1} | ${l}\n`, "");
    }
    return (
      top +
      (`${at}${this.codeline}\n` +
        " ".repeat(stfu(character - 1)) +
        (this.message.length < 25
          ? "^" + "-".repeat(stfu(at.length - character, 1)) + " "
          : "↑\n" + " ".repeat(stfu(character - 1 - 5))) +
        "Syntax Error: " +
        this.message) +
      bottom
    );
  };
  return e;
}
export function parseScheme(scheme, debug) {
	if (typeof scheme !== "string") throw new Error("passed scheme isn't a string")
  const outputKeys = [];
  const rawLines = scheme.split(/\r?\n|\r/);
  for (var line = 0; line < rawLines.length; line++) {
    const rawLine = rawLines[line].trimEnd();
    const [rawKey, comment] = rawLine.split(";");

    const key = {
      name: undefined,
      rawName: undefined,
      comment,
      args: [],
      rawArgs: undefined,
    };

    if (debug) key.line = line;
    if (!debug && rawKey.length === 0) continue;
    if (debug) key.rawName = rawKey;

    outputKeys.push(key);
    if (rawKey.length === 0) continue;
    const argsStart = rawKey.indexOf("(");
    const argsEnd = rawKey.indexOf(")");
    if (
      rawKey.trimEnd().substring(0, argsEnd).length > rawKey.trimEnd().length
    ) {
      return schemesError({
        message: "Unnecessary symbols after funk brackets",
        character: argsEnd + 1,
        codeline: rawKey,
        line,
        lines: rawLines,
      });
    }
    let keyRawName;
    if (argsStart === 0) keyRawName = rawKey.substring(0, argsStart);
    else if (argsEnd === 0) keyRawName = rawKey.substring(0, argsEnd);
    else keyRawName = rawKey.substring(0, argsStart !== -1 ? argsStart : 0);
    if (keyRawName.length === 0 && (argsStart === 0 || argsEnd === 0))
      return schemesError({
        message: "No funk name",
        character: 1,
        codeline: rawKey,
        line,
        lines: rawLines,
      });
    key.name = keyRawName.trim();
    if (argsStart === -1 && argsEnd === -1)
      return schemesError({
        message: 'No arg brackets ("(", ")")',
        character: keyRawName.length || 1,
        codeline: rawKey,
        line,
        lines: rawLines,
      });
    if (argsStart === -1) {
      return schemesError({
        message: 'No opening arg bracket ("(")',
        character: argsEnd !== -1 ? argsEnd + 1 : 0,
        codeline: rawKey,
        line,
        lines: rawLines,
      });
    }
    if (argsEnd === -1) {
      return schemesError({
        message: 'No closing arg bracket (")")',
        character: argsStart !== -1 ? argsStart + 1 : 0,
        codeline: rawKey,
        line,
        lines: rawLines,
      });
    }
    const rawArgs = rawKey.substring(argsStart + 1, argsEnd).split(",");
    if (debug) key.rawArgs = rawArgs;
    for (var argIndex = 0; argIndex < rawArgs.length; argIndex++) {
      const rawArg = rawArgs[argIndex];
      const arg = {
        name: undefined,
        rawName: undefined,
        equalsUsed: undefined,
        value: undefined,
        rawValue: undefined,
      };
      if (!debug && rawArg.length === 0) {
        if (argIndex !== 0)
          return schemesError({
            message: "Empty argument",
            character:
              keyRawName.length +
              rawArgs.splice(0, argIndex).reduce((a, e) => a + e.length + 1, 1),
            codeline: rawKey,
            line,
            lines: rawLines,
          });
        break;
      }
      key.args.push(arg);

      if (debug) arg.equalsUsed = rawArg.indexOf("=") !== -1;
      if (debug) arg.rawName = split[0];

      const split = rawArg.split("=");
      if (split.length === 2 && [split[0], split[1]].every(($) => $ === "")) {
        return schemesError({
          message: "Empty argument name",
          character:
            keyRawName.length +
            rawArgs.splice(0, argIndex).reduce((a, e) => a + e.length + 1, 1) +
            rawArg.indexOf("="),
          codeline: rawKey,
          line,
          lines: rawLines,
        });
      }
      if (!split[1]) split[1] = "true";
      arg.name = split[0].trim();
      const rawArgValue = split[1];
      if (debug) arg.rawValue;

      const argValue = rawArgValue.trim();
      const intParse = parseInt(argValue);
      if (!Number.isNaN(intParse)) arg.value = intParse;
      else if (argValue === "true") arg.value = true;
      else if (argValue === "false") arg.value = false;
      else arg.value = argValue;
    }
  }
  return outputKeys;
}

function unparseScheme(scheme) {
  let output = "";
  for (var funk of scheme) {
    if (!funk.name) return;

    switch (funk.name) {
      case "vibrate":
      case "wait":
      default:
        output += `${funk.name}(${funk.args
          .map(
            (arg) => `${arg.name}${arg.value !== true ? ` = ${arg.value}` : ``}`
          )
          .join(", ")})\n`;
    }
  }
  return output;
}
/*
const scheme = generateBasicScheme(200, 2, 5);
const parsedScheme = parseScheme(process.argv.splice(2).join(" ") || scheme);
console.log("Scheme:\n" + scheme);
if (parsedScheme.error)
  console.log({ ...parsedScheme, str: parsedScheme.toString() });
else {
  console.log("Parsed Scheme: " + JSON.stringify(parsedScheme, 0, 2));
  console.log("Unparsed Scheme:\n" + unparseScheme(parsedScheme));
} //*/
