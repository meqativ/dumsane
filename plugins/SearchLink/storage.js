/** biome-ignore-all lint/complexity/useLiteralKeys: ilike it */
import { makeDefaults } from "../../common";

const BUILTIN_SERVICES = {
  google: {
    name: "Google",
    urlTemplate: "https://google.com/search?q={query}",
  },
  googleaimode: {
    name: "Google (AI Mode)",
    urlTemplate: "https://google.com/search?udm=50&q={query}",
  },
  googleimages: {
    name: "Google Images",
    urlTemplate: "https://google.com/search?udm=2&q={query}",
  },
	wikipedia: {
		name: "Wikipedia",
		urlTemplate: "https://wikipedia.org/w/index.php?search={query}"
	},
	github: {
		name: "GitHub",
		urlTemplate: "https://github.com/search?q={query}",
	},
	reddit: {
		name: "Reddit",
		urlTemplate: "https://www.reddit.com/search?q={query}",
	},
	brave: {
		name: "Brave",
		urlTemplate: "https://search.brave.com/search?q={query}",
	},
  askchatgpt: {
    name: "Ask ChatGPT",
    urlTemplate: "https://chatgpt.com/?q={query}",
  },
  askmistral: {
    name: "Ask Mistral",
    urlTemplate: "https://chat.mistral.ai/chat?q={query}",
  },
  askclaude: {
    name: "Ask Claude",
    urlTemplate: "https://claude.ai/new?q={query}",
  },
  ddg: {
    name: "DuckDuckGo",
    urlTemplate: "https://duckduckgo.com/?q={query}",
  },
  ecosia: {
    name: "Ecosia",
    urlTemplate: "https://www.ecosia.org/search?q={query}",
  },
  qwant: {
    name: "Qwant",
    urlTemplate: "https://www.qwant.com/?q={query}",
  },
  startpaige: {
    name: "Startpage",
    urlTemplate: "https://www.startpage.com/sp/search?q={query}",
  },
  bing: {
    name: "Bing",
    urlTemplate: "https://www.bing.com/search?q={query}",
  },
  yahoo: {
    name: "Yahoo",
    urlTemplate: "https://search.yahoo.com/search?p={query}",
  },
  baidu: {
    name: "Baidu",
    urlTemplate: "https://www.baidu.com/s?wd={query}",
  },
  ask: {
    name: "Ask",
    urlTemplate: "https://www.ask.com/web?q={query}",
  },
  mojeek: {
    name: "Mojeek",
    urlTemplate: "https://www.mojeek.com/search?q={query}",
  },
  aol: {
    name: "AOL",
    urlTemplate: "https://search.aol.com/aol/search?q={query}",
  },
  yandex: {
    name: "Yandex",
    urlTemplate: "https://yandex.com/search/?text={query}",
  },
};

const DEFAULT_STORAGE = {
  stats: {
    global: 0,
    amounts: {
      google: 0, // keys will be dynamically created
    },
    history: [], // only remembers the last 25, storing this in the hopes of figuring out how to do autocomplete with builtin commands later
  },
  settings: {
    defaults: {
      service: "google",
      send: true,
    },
    customServices: {
      "#Let Me Google That For You!": {
        name: "Let Me Google That For You!",
        urlTemplate: "https://letmegooglethat.com/?q={query}",
      },
      "#Let Me GPT That For You!": {
        name: "Let Me GPT That For You!",
        urlTemplate: "https://letmegpt.com/?q={query}",
      },
      "#Google.it": {
        name: "Google.it",
        urlTemplate: "https://google.it/search?q={query}",
      },
    },
  },
};
export function getService(storage, key) {
  return key in BUILTIN_SERVICES
    ? BUILTIN_SERVICES[key]
    : storage["settings"]["customServices"][key];
}
export function getServices(storage) {
  return Object.fromEntries(
    Object.keys(BUILTIN_SERVICES)
      .concat(Object.keys(storage["settings"]["customServices"]))
      .map((key) => [key, getService(storage, key)]),
  );
}
export function getServiceNames(storage) {
  return Object.keys(BUILTIN_SERVICES).concat(
    Object.keys(storage["settings"]["customServices"]),
  );
}
export function initStorage(storage) {
  try {
    makeDefaults(storage, DEFAULT_STORAGE);
  } catch (e) {
    console.error(e);
    console.log(e.stack);
    alert(`There was an error while loading the plugin\n${e.stack}`);
  }
}
