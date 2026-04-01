(function (exports, common, plugin, storage, metro, components, _vendetta) {
	'use strict';

	const { getChannelId: getCurrentChannelId } = metro.findByStoreName("SelectedChannelStore");
	const { sendMessage: sendUserMessage, sendBotMessage } = metro.findByProps("sendBotMessage");
	function cmdDisplays(obj, translations, locale) {
	  if (!obj?.name || !obj?.description)
	    throw new Error(`No name(${obj?.name}) or description(${obj?.description}) in the passed command (command name: ${obj?.name})`);
	  obj.displayName ??= translations?.names?.[locale] ?? obj.name;
	  obj.displayDescription ??= translations?.names?.[locale] ?? obj.description;
	  if (obj.options) {
	    if (!Array.isArray(obj.options))
	      throw new Error(`Options is not an array (received: ${typeof obj.options})`);
	    for (let optionIndex = 0; optionIndex < obj.options.length; optionIndex++) {
	      const option = obj.options[optionIndex];
	      if (!option?.name || !option?.description)
	        throw new Error(`No name(${option?.name}) or description(${option?.description} in the option with index ${optionIndex}`);
	      option.displayName ??= translations?.options?.[optionIndex]?.names?.[locale] ?? option.name;
	      option.displayDescription ??= translations?.options?.[optionIndex]?.descriptions?.[locale] ?? option.description;
	      if (option?.choices) {
	        if (!Array.isArray(option?.choices))
	          throw new Error(`Choices is not an array (received: ${typeof option.choices})`);
	        for (let choiceIndex = 0; choiceIndex < option.choices.length; choiceIndex++) {
	          const choice = option.choices[choiceIndex];
	          if (!choice?.name)
	            throw new Error(`No name of choice with index ${choiceIndex} in option with index ${optionIndex}`);
	          choice.displayName ??= translations?.options?.[optionIndex]?.choices?.[choiceIndex]?.names?.[locale] ?? choice.name;
	        }
	      }
	    }
	  }
	  return obj;
	}
	function resolvePath(obj, path) {
	  const keys = path.split(".");
	  let current = obj;
	  for (let i = 0; i < keys.length; i++) {
	    const key = keys[i];
	    if (current === null || typeof current !== "object") {
	      throw new Error(`Cannot resolve key "${key}" because the previous property is not an object.`);
	    }
	    if (!(key in current)) {
	      throw new Error(`Key "${key}" was not found in the path.`);
	    }
	    if (i === keys.length - 1) {
	      return {
	        parent: current,
	        key
	      };
	    }
	    current = current[key];
	  }
	}
	function getValueAtPath(obj, path) {
	  const { parent, key } = resolvePath(obj, path);
	  return parent[key];
	}
	function setValueAtPath(obj, path, value) {
	  const { parent, key } = resolvePath(obj, path);
	  parent[key] = value;
	  return obj;
	}
	function makeDefaults(object, defaults) {
	  if (object === void 0)
	    throw new Error("No object passed to make defaults for");
	  if (defaults === void 0)
	    throw new Error("No defaults object passed to make defaults off of");
	  for (const key in defaults) {
	    if (typeof defaults[key] === "object" && !Array.isArray(defaults?.[key])) {
	      if (typeof object?.[key] !== "object")
	        object[key] = {};
	      makeDefaults(object[key], defaults[key]);
	    } else {
	      object[key] ??= defaults[key];
	    }
	  }
	  return object;
	}
	function sendTextMessage(channel, message, ephemeral) {
	  if (channel === "currentChannel") {
	    channel = getCurrentChannelId();
	  }
	  if (typeof message !== "string") {
	    message = message?.content;
	    if (!message)
	      throw new Error("No text to send");
	  }
	  if (ephemeral) {
	    return sendBotMessage(channel, message);
	  }
	  sendUserMessage(channel, {
	    content: message,
	    _command_output: true
	  }, void 0, {
	    nonce: Date.now().toString()
	  });
	}

	const BUILTIN_SERVICES = {
	  google: {
	    name: "Google",
	    urlTemplate: "https://google.com/search?q={query}"
	  },
	  googleaimode: {
	    name: "Google (AI Mode)",
	    urlTemplate: "https://google.com/search?udm=50&q={query}"
	  },
	  googleimages: {
	    name: "Google Images",
	    urlTemplate: "https://google.com/search?udm=2&q={query}"
	  },
	  wikipedia: {
	    name: "Wikipedia",
	    urlTemplate: "https://wikipedia.org/w/index.php?search={query}"
	  },
	  github: {
	    name: "GitHub",
	    urlTemplate: "https://github.com/search?q={query}"
	  },
	  reddit: {
	    name: "Reddit",
	    urlTemplate: "https://www.reddit.com/search?q={query}"
	  },
	  brave: {
	    name: "Brave",
	    urlTemplate: "https://search.brave.com/search?q={query}"
	  },
	  askchatgpt: {
	    name: "Ask ChatGPT",
	    urlTemplate: "https://chatgpt.com/?q={query}"
	  },
	  askmistral: {
	    name: "Ask Mistral",
	    urlTemplate: "https://chat.mistral.ai/chat?q={query}"
	  },
	  askclaude: {
	    name: "Ask Claude",
	    urlTemplate: "https://claude.ai/new?q={query}"
	  },
	  ddg: {
	    name: "DuckDuckGo",
	    urlTemplate: "https://duckduckgo.com/?q={query}"
	  },
	  ecosia: {
	    name: "Ecosia",
	    urlTemplate: "https://www.ecosia.org/search?q={query}"
	  },
	  qwant: {
	    name: "Qwant",
	    urlTemplate: "https://www.qwant.com/?q={query}"
	  },
	  startpaige: {
	    name: "Startpage",
	    urlTemplate: "https://www.startpage.com/sp/search?q={query}"
	  },
	  bing: {
	    name: "Bing",
	    urlTemplate: "https://www.bing.com/search?q={query}"
	  },
	  yahoo: {
	    name: "Yahoo",
	    urlTemplate: "https://search.yahoo.com/search?p={query}"
	  },
	  baidu: {
	    name: "Baidu",
	    urlTemplate: "https://www.baidu.com/s?wd={query}"
	  },
	  ask: {
	    name: "Ask",
	    urlTemplate: "https://www.ask.com/web?q={query}"
	  },
	  mojeek: {
	    name: "Mojeek",
	    urlTemplate: "https://www.mojeek.com/search?q={query}"
	  },
	  aol: {
	    name: "AOL",
	    urlTemplate: "https://search.aol.com/aol/search?q={query}"
	  },
	  yandex: {
	    name: "Yandex",
	    urlTemplate: "https://yandex.com/search/?text={query}"
	  }
	};
	const DEFAULT_STORAGE = {
	  stats: {
	    global: 0,
	    amounts: {
	      google: 0
	    },
	    history: []
	  },
	  settings: {
	    defaults: {
	      service: "google",
	      send: true
	    },
	    customServices: {
	      "#Let Me Google That For You!": {
	        name: "Let Me Google That For You!",
	        urlTemplate: "https://letmegooglethat.com/?q={query}"
	      },
	      "#Let Me GPT That For You!": {
	        name: "Let Me GPT That For You!",
	        urlTemplate: "https://letmegpt.com/?q={query}"
	      },
	      "#Google.it": {
	        name: "Google.it",
	        urlTemplate: "https://google.it/search?q={query}"
	      }
	    }
	  }
	};
	function getService(storage, key) {
	  return key in BUILTIN_SERVICES ? BUILTIN_SERVICES[key] : storage["settings"]["customServices"][key];
	}
	function getServiceNames(storage) {
	  return Object.keys(BUILTIN_SERVICES).concat(Object.keys(storage["settings"]["customServices"]));
	}
	function initStorage(storage) {
	  try {
	    makeDefaults(storage, DEFAULT_STORAGE);
	  } catch (e) {
	    console.error(e);
	    console.log(e.stack);
	    alert(`There was an error while loading the plugin
${e.stack}`);
	  }
	}

	const { FormRow, FormSwitch } = components.Forms;
	function renderSimpleSettings(storage, config) {
	  return config.map(function(item, index) {
	    const key = item?.storage_path ?? item?.label ?? item?.id ?? index;
	    if (item?.type === "button") {
	      return /* @__PURE__ */ React.createElement(components.Button, {
	        key,
	        style: item?.style ?? void 0,
	        text: item?.label ?? "Unnamed",
	        color: "brand",
	        size: "small",
	        disabled: false,
	        onPress: item?.onPress ?? function() {
	        }
	      });
	    }
	    if (item?.type === "spacer") {
	      return /* @__PURE__ */ React.createElement(common.ReactNative.View, {
	        key,
	        style: item?.style
	      });
	    }
	    if ([
	      "number",
	      "toggle"
	    ].includes(item?.type)) {
	      return /* @__PURE__ */ React.createElement(FormRow, {
	        key,
	        label: item?.label ?? item?.storage_path ?? "Unnamed",
	        style: item?.style ?? void 0,
	        trailing: "storage_path" in item ? /* @__PURE__ */ React.createElement(FormSwitch, {
	          value: getValueAtPath(storage, item.storage_path),
	          onValueChange: function(value) {
	            console.log(`changing to ${value}, current: ${getValueAtPath(storage, item.storage_path)}`);
	            setValueAtPath(storage, item.storage_path, value);
	            item?.onValueChange?.(value);
	          }
	        }) : void 0
	      });
	    }
	    return /* @__PURE__ */ React.createElement(FormRow, {
	      key,
	      label: `${item?.label ?? item?.id ?? "no name"}(unknown type of config entry)`,
	      style: item?.style ?? void 0
	    });
	  });
	}

	function Settings() {
	  storage.useProxy(plugin.storage);
	  return /* @__PURE__ */ React.createElement(common.ReactNative.ScrollView, {
	    style: {
	      flex: 1
	    }
	  }, renderSimpleSettings(plugin.storage, [
	    {
	      label: "Search service (engine) to use by default",
	      type: "select_one",
	      storage_path: "settings.defaults.engine",
	      choices: getServiceNames(plugin.storage).map(function(serviceName) {
	        const service = getService(plugin.storage, serviceName);
	        if (!service)
	          return void 0;
	        return {
	          name: service.name,
	          value: serviceName
	        };
	      }).filter(Boolean)
	    },
	    {
	      label: "Send the link as an actual message",
	      type: "number",
	      storage_path: "settings.defaults.send"
	    }
	  ]));
	}

	const patches = [];
	function search(storage2, serviceid, query) {
	  const service = getService(storage2, serviceid);
	  if (!service)
	    throw new Error(`Could not find service '${serviceid}'`);
	  return service.urlTemplate.replaceAll("{query}", encodeURIComponent(query));
	}
	var index = {
	  settings: Settings,
	  onUnload() {
	    for (const unpatch of patches)
	      unpatch();
	  },
	  onLoad() {
	    initStorage(plugin.storage);
	    patches.push(_vendetta.commands.registerCommand(cmdDisplays({
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
	          description: "Text to be searched"
	        },
	        {
	          type: 5,
	          required: false,
	          name: "send",
	          description: `Whether to send the link as an actual message in chat (default: {default_action})`.replaceAll("{default_action}", plugin.storage["settings"]["defaults"]["send"])
	        },
	        {
	          type: 3,
	          name: "service",
	          description: `Use a different search engine/service (default: {defaultId})`.replaceAll("{defaultId}", plugin.storage["settings"]["defaults"]["service"]),
	          choices: getServiceNames(plugin.storage).map(function(serviceName) {
	            const service = getService(plugin.storage, serviceName);
	            if (!service)
	              return void 0;
	            return {
	              name: service.name,
	              value: serviceName
	            };
	          }).filter(Boolean)
	        }
	      ],
	      execute: function(rawArgs) {
	        const args = new Map(rawArgs.map(function(o) {
	          return [
	            o.name,
	            o
	          ];
	        }));
	        const query = args.get("query")?.value;
	        const service = args.get("service")?.value ?? plugin.storage["settings"]["defaults"]["service"];
	        const output = search(plugin.storage, service, query);
	        const ephemeral = !(args.get("send")?.value ?? plugin.storage["settings"]["defaults"]["send"]);
	        sendTextMessage("currentChannel", output, ephemeral);
	        plugin.storage["stats"]["global"]++;
	        plugin.storage["stats"]["amounts"][service]++;
	        const history = plugin.storage["stats"]["history"];
	        history.unshift({
	          timestamp: Date.now(),
	          service,
	          query
	        });
	        if (history.length > 25)
	          history.pop();
	      }
	    })));
	  }
	};

	exports.default = index;
	exports.search = search;

	Object.defineProperty(exports, '__esModule', { value: true });

	return exports;

})({}, vendetta.metro.common, vendetta.plugin, vendetta.storage, vendetta.metro, vendetta.ui.components, vendetta);
