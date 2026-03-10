/** biome-ignore-all lint/complexity/useLiteralKeys: i like it */
import Settings from "./settings.jsx";
import { cmdDisplays } from "../../common/index.js";
import { sendTextMessage as sendText } from "../../common/index.js";
import { storage } from "@vendetta/plugin";
import { commands } from "@vendetta";
import { getService, getServiceNames, initStorage } from "./storage.js";
const patches = [];

export function search(storage, serviceid, query) {
	const service = getService(storage, serviceid);
	if (!service) throw new Error(`Could not find service '${serviceid}'`);
	return service.urlTemplate.replaceAll("{query}", encodeURIComponent(query));
}
export default {
  settings: Settings,
  onUnload() {
		for (const unpatch of patches) unpatch()
  },
  onLoad() {
		initStorage(storage);
    patches.push(commands.registerCommand(
      cmdDisplays({
        type: 1,
        applicationId: "-1",
        inputType: 1,
        name: `search`,
        description: "Sends a internet search link",
        options: [
          {
            type: 3,
            required: true,
            name: "query",
            description: "Text to be searched",
          },
          {
            type: 5,
            required: false,
            name: "send",  // TODO: make this a choice option: send message in chat, copy the link to clipboard, send ephemeral message, open the link in browser instantly
            description: `Whether to send the link as an actual message in chat (default: {default_action})`.replaceAll("{default_action}", storage['settings']['defaults']['send']),
          },
					{
						type: 3,
						name: "service",
						description: `Use a different search engine/service (default: {defaultId})`.replaceAll("{defaultId}", storage['settings']['defaults']['service']),
						choices: getServiceNames(storage).map(
							serviceName => {
								const service = getService(storage, serviceName);
								if (!service) return undefined;	
								return ({
									name: service.name,
									value: serviceName
								})
							}
						).filter(Boolean)
					}
        ],
        execute: (rawArgs) => {
          const args = new Map(rawArgs.map((o) => [o.name, o]));
					const query = args.get("query")?.value;
					const service = args.get("service")?.value ?? storage['settings']["defaults"]["service"]
					const output = search(storage, service, query);
					const ephemeral = !(args.get("send")?.value ?? storage['settings']["defaults"]["send"]);
					
					sendText("currentChannel", output, ephemeral);
        },
      })
    ));
  },
};
