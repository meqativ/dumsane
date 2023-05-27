(function () {
  'use strict';

  function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
          throw new TypeError("Cannot call a class as a function");
      }
  }

  function _defineProperties(target, props) {
      for(var i = 0; i < props.length; i++){
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor) descriptor.writable = true;
          Object.defineProperty(target, descriptor.key, descriptor);
      }
  }
  function _createClass(Constructor, protoProps, staticProps) {
      if (protoProps) _defineProperties(Constructor.prototype, protoProps);
      if (staticProps) _defineProperties(Constructor, staticProps);
      return Constructor;
  }

  let Seed = /* @__PURE__ */ function() {
    function Seed2(seed) {
      _classCallCheck(this, Seed2);
      Object.defineProperty(this, "seeder", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: void 0
      });
      this.seeder = this.xmur3(seed);
    }
    _createClass(Seed2, [
      {
        key: "random",
        value: function random() {
          let min = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, max = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 1;
          if (min > max) {
            throw new Error("The minimum value must be below the maximum value");
          }
          if (min === max) {
            throw new Error("The minimum value cannot equal the maximum value");
          }
          return this.denormalize(this.sfc32(), min, max);
        }
      },
      {
        key: "randomInt",
        value: function randomInt() {
          let min = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, max = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 1;
          return Math.round(this.random(min, max));
        }
      },
      {
        key: "denormalize",
        value: function denormalize(value, min, max) {
          return value * (max - min) + min;
        }
      },
      {
        // https://github.com/bryc/code/blob/master/jshash/PRNGs.md
        key: "xmur3",
        value: function xmur3(str) {
          let h = 1779033703 ^ str.length;
          for (let i = 0; i < str.length; i++) {
            h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
            h = h << 13 | h >>> 19;
          }
          return function() {
            h = Math.imul(h ^ h >>> 16, 2246822507);
            h = Math.imul(h ^ h >>> 13, 3266489909);
            return (h ^= h >>> 16) >>> 0;
          };
        }
      },
      {
        // https://github.com/bryc/code/blob/master/jshash/PRNGs.md
        key: "sfc32",
        value: function sfc32() {
          let a = this.seeder();
          let b = this.seeder();
          let c = this.seeder();
          let d = this.seeder();
          a >>>= 0;
          b >>>= 0;
          c >>>= 0;
          d >>>= 0;
          let t = a + b | 0;
          a = b ^ b >>> 9;
          b = c + (c << 3) | 0;
          c = c << 21 | c >>> 11;
          d = d + 1 | 0;
          t = t + d | 0;
          c = c + t | 0;
          return (t >>> 0) / 4294967296;
        }
      }
    ]);
    return Seed2;
  }();

  function isLetter(char) {
    return /^\p{L}/u.test(char);
  }
  function isUpperCase(char) {
    return char === char.toUpperCase();
  }
  function getCapitalPercentage(str) {
    let totalLetters = 0;
    let upperLetters = 0;
    for (const currentLetter of str) {
      if (!isLetter(currentLetter))
        continue;
      if (isUpperCase(currentLetter)) {
        upperLetters++;
      }
      totalLetters++;
    }
    return upperLetters / totalLetters;
  }
  function InitModifierParam() {
    return function(target, key) {
      let value = target[key];
      let sum = 0;
      const getter = function() {
        return value;
      };
      const setter = function(next) {
        if (typeof next === "object") {
          sum = Object.values(next).reduce(function(a, b) {
            return a + b;
          });
        }
        if (next < 0 || sum < 0 || next > 1 || sum > 1) {
          throw new Error(`${key} modifier value must be a number between 0 and 1`);
        }
        value = next;
      };
      Object.defineProperty(target, key, {
        get: getter,
        set: setter,
        enumerable: true,
        configurable: true
      });
    };
  }
  function isUri(value) {
    if (!value)
      return false;
    if (/[^a-z0-9\:\/\?\#\[\]\@\!\$\&\'\(\)\*\+\,\;\=\.\-\_\~\%]/i.test(value)) {
      return false;
    }
    if (/%[^0-9a-f]/i.test(value) || /%[0-9a-f](:?[^0-9a-f]|$)/i.test(value)) {
      return false;
    }
    const split = value.match(/(?:([^:\/?#]+):)?(?:\/\/([^\/?#]*))?([^?#]*)(?:\?([^#]*))?(?:#(.*))?/);
    if (!split)
      return false;
    const [, scheme, authority, path] = split;
    if (!(scheme && scheme.length && path.length >= 0))
      return false;
    if (authority && authority.length) {
      if (!(path.length === 0 || /^\//.test(path)))
        return false;
    } else if (/^\/\//.test(path)) {
      return false;
    }
    if (!/^[a-z][a-z0-9\+\-\.]*$/.test(scheme.toLowerCase()))
      return false;
    return true;
  }
  function isAt(value) {
    const first = value.charAt(0);
    return first === "@";
  }

  var __decorate = function(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if (d = decorators[i])
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  const DEFAULTS = {
    SPACES: {
      faces: 0.05,
      actions: 0.075,
      stutters: 0.1
    },
    WORDS: 1,
    EXCLAMATIONS: 1
  };
  let Uwuifier = /* @__PURE__ */ function() {
    function Uwuifier2() {
      let { spaces = DEFAULTS.SPACES, words = DEFAULTS.WORDS, exclamations = DEFAULTS.EXCLAMATIONS } = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {
        spaces: DEFAULTS.SPACES,
        words: DEFAULTS.WORDS,
        exclamations: DEFAULTS.EXCLAMATIONS
      };
      _classCallCheck(this, Uwuifier2);
      Object.defineProperty(this, "faces", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: [
          "(\u30FB`\u03C9\xB4\u30FB)",
          ";;w;;",
          "OwO",
          "UwU",
          ">w<",
          "^w^",
          "\xDAw\xDA",
          "^-^",
          ":3",
          "x3",
          ";3",
          ":3c"
        ]
      });
      Object.defineProperty(this, "exclamations", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: [
          "!?",
          "?!!",
          "?!?1",
          "!!11",
          "?!?!"
        ]
      });
      Object.defineProperty(this, "actions", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: [
          "*blushes*",
          "*whispers to self*",
          "*cries*",
          "*screams*",
          "*sweats*",
          "*twerks*",
          "*runs away*",
          "*screeches*",
          "*walks away*",
          //   "*sees bulge*",
          "*looks at you*",
          // "*notices buldge*",
          "*starts twerking*",
          "*huggles tightly*",
          "*boops your nose*"
        ]
      });
      Object.defineProperty(this, "uwuMap", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: [
          [
            /(?:r|l)/g,
            "w"
          ],
          [
            /(?:R|L)/g,
            "W"
          ],
          [
            /n([aeiou])/g,
            "ny$1"
          ],
          [
            /N([aeiou])/g,
            "Ny$1"
          ],
          [
            /N([AEIOU])/g,
            "Ny$1"
          ],
          [
            /ove/g,
            "uv"
          ]
        ]
      });
      Object.defineProperty(this, "_spacesModifier", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, "_wordsModifier", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, "_exclamationsModifier", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: void 0
      });
      this._spacesModifier = spaces ?? DEFAULTS.SPACES;
      this._wordsModifier = words ?? DEFAULTS.WORDS;
      this._exclamationsModifier = exclamations ?? DEFAULTS.EXCLAMATIONS;
    }
    _createClass(Uwuifier2, [
      {
        key: "uwuifyWords",
        value: function uwuifyWords(sentence) {
          var _this = this;
          const words = sentence.split(" ");
          const uwuifiedSentence = words.map(function(word) {
            if (isAt(word))
              return word;
            if (isUri(word))
              return word;
            const seed = new Seed(word);
            for (const [oldWord, newWord] of _this.uwuMap) {
              if (seed.random() > _this._wordsModifier)
                continue;
              word = word.replace(oldWord, newWord);
            }
            return word;
          }).join(" ");
          return uwuifiedSentence;
        }
      },
      {
        key: "uwuifySpaces",
        value: function uwuifySpaces(sentence) {
          var _this = this;
          const words = sentence.split(" ");
          const faceThreshold = this._spacesModifier.faces;
          const actionThreshold = this._spacesModifier.actions + faceThreshold;
          const stutterThreshold = this._spacesModifier.stutters + actionThreshold;
          const uwuifiedSentence = words.map(function(word, index) {
            const seed = new Seed(word);
            const random = seed.random();
            const [firstCharacter] = word;
            if (random <= faceThreshold && _this.faces) {
              word += " " + _this.faces[seed.randomInt(0, _this.faces.length - 1)];
              checkCapital();
            } else if (random <= actionThreshold && _this.actions) {
              word += " " + _this.actions[seed.randomInt(0, _this.actions.length - 1)];
              checkCapital();
            } else if (random <= stutterThreshold && !isUri(word)) {
              const stutter = seed.randomInt(0, 2);
              return (firstCharacter + "-").repeat(stutter) + word;
            }
            function checkCapital() {
              if (firstCharacter !== firstCharacter.toUpperCase())
                return;
              if (getCapitalPercentage(word) > 0.5)
                return;
              if (index === 0) {
                word = firstCharacter.toLowerCase() + word.slice(1);
              } else {
                const previousWord = words[index - 1];
                const previousWordLastChar = previousWord[previousWord.length - 1];
                const prevWordEndsWithPunctuation = new RegExp("[.!?\\-]").test(previousWordLastChar);
                if (!prevWordEndsWithPunctuation)
                  return;
                word = firstCharacter.toLowerCase() + word.slice(1);
              }
            }
            return word;
          }).join(" ");
          return uwuifiedSentence;
        }
      },
      {
        key: "uwuifyExclamations",
        value: function uwuifyExclamations(sentence) {
          var _this = this;
          const words = sentence.split(" ");
          const pattern = new RegExp("[?!]+$");
          const uwuifiedSentence = words.map(function(word) {
            const seed = new Seed(word);
            if (!pattern.test(word) || seed.random() > _this._exclamationsModifier) {
              return word;
            }
            word = word.replace(pattern, "");
            word += _this.exclamations[seed.randomInt(0, _this.exclamations.length - 1)];
            return word;
          }).join(" ");
          return uwuifiedSentence;
        }
      },
      {
        key: "uwuifySentence",
        value: function uwuifySentence(sentence) {
          let uwuifiedString = sentence;
          uwuifiedString = this.uwuifyWords(uwuifiedString);
          uwuifiedString = this.uwuifyExclamations(uwuifiedString);
          uwuifiedString = this.uwuifySpaces(uwuifiedString);
          return uwuifiedString;
        }
      }
    ]);
    return Uwuifier2;
  }();
  __decorate([
    InitModifierParam()
  ], Uwuifier.prototype, "_spacesModifier", void 0);
  __decorate([
    InitModifierParam()
  ], Uwuifier.prototype, "_wordsModifier", void 0);
  __decorate([
    InitModifierParam()
  ], Uwuifier.prototype, "_exclamationsModifier", void 0);

  const { React, ReactNative } = vendetta.metro.common;
  const { plugin: { storage }, storage: { useProxy }, ui: { components: { Forms } } } = vendetta;
  const { FormRow, FormSection, FormSwitch } = Forms;
  const Button = vendetta.metro.findByProps("ButtonColors", "ButtonLooks", "ButtonSizes").default;
  function Settings(props, param) {
    let { patches, reloadUwuifier, startMessageTransfoworming } = param;
    useProxy(storage);
    return /* @__PURE__ */ React.createElement(ReactNative.ScrollView, {
      style: {
        flex: 1
      }
    }, [
      {
        label: "faces",
        default: true,
        id: "cfg.spaces.faces"
      },
      {
        label: "actions",
        default: true,
        id: "cfg.spaces.actions"
      },
      {
        label: "stutters",
        default: true,
        id: "cfg.spaces.stutters"
      },
      {
        label: "words",
        default: true,
        id: "cfg.words"
      },
      {
        label: "exclamations",
        default: false,
        id: "cfg.exclamations"
      },
      {
        label: "Strength sliders will come when i figure out how to make em"
      },
      {
        id: "reload",
        style: {
          height: 5,
          margin: 8
        },
        name: "Reload uwuifier",
        onPress: function() {
          reloadUwuifier(storage);
          vendetta.ui.toasts.showToast(`Reloaded uwuifier`, vendetta.ui.assets.getAssetIDByName("check"));
        }
      }
    ].map(function(config) {
      if (config?.id === "reload") {
        return /* @__PURE__ */ React.createElement(Button, {
          style: config.style,
          text: config.name ?? "Unnamed",
          color: "brand",
          size: "small",
          disabled: false,
          onPress: config.onPress ?? function() {
          }
        });
      }
      if ("id" in config && !(config.id in storage))
        storage[config.id] = config.default;
      return /* @__PURE__ */ React.createElement(FormRow, {
        label: config?.label ?? config?.id ?? "no name",
        trailing: "id" in config ? /* @__PURE__ */ React.createElement(FormSwitch, {
          value: storage[config.id] ?? config.default,
          onValueChange: function(value) {
            storage[config.id] = value;
            cfg?.onValueChange?.(value);
          }
        }) : void 0
      });
    }));
  }

  function cmdDisplays(obj, translations, locale) {
    if (!obj.name || !obj?.description)
      throw new Error(`No name(${obj?.name}) or description(${obj?.description}) in the passed command. (command name: ${obj?.name})`);
    obj.displayName = translations?.names?.[locale] ?? obj.name;
    obj.displayDescription = translations?.names?.[locale] ?? obj.description;
    if (obj.options) {
      obj.options = obj.options.map(function(option, optionIndex) {
        if (!option?.name || !option?.description)
          throw new Error(`No name(${option?.name}) or description(${option?.description} in the option with index ${optionIndex}`);
        option.displayName = translations?.options?.[optionIndex]?.names?.[locale] ?? option.name;
        option.displayDescription = translations?.options?.[optionIndex]?.descriptions?.[locale] ?? option.description;
        return option;
      });
    }
    return obj;
  }

  let uwuifier = new Uwuifier();
  ({
    reloadUwuifier,
    patches: [],
    startMessageTransfoworming(storage) {
    },
    reloadUwuifier(storage) {
      uwuifier = new Uwuifier({
        spaces: {
          faces: !storage["cfg.spaces.faces"] ? 0 : 0.5,
          actions: !storage["cfg.spaces.actions"] ? 0 : 0.075,
          stutters: !storage["cfg.spaces.stutters"] ? 0 : 0.1
        },
        words: !storage["cfg.words"] ? 0 : 1,
        exclamations: !storage["cfg.exclamations"] ? 0 : 1
      });
    },
    settings(props) {
      return Settings(props, this);
    },
    onUnload() {
      this.patches.every(function(p) {
        return p(), true;
      });
    },
    onLoad() {
      const { plugin: { storage }, commands, logger } = vendetta;
      this.patches[0] = commands.registerCommand(cmdDisplays({
        execute: function(optionsA, context) {
          const options = new Map(optionsA.map(function(option) {
            return [
              option.name,
              option
            ];
          }));
          const uwuified = uwuifier.uwuifySentence(options.get("text").value);
          return {
            content: !options.get("epheneral")?.value ? uwuified : "h".repeat(6969)
          };
        },
        type: 1,
        applicationId: "-1",
        inputType: 1,
        name: "uwuify",
        description: "UwUifies your text",
        options: [
          {
            type: 3,
            required: true,
            name: "text",
            description: ""
          },
          {
            type: 5,
            required: false,
            name: "ephemeral",
            description: "Whether to send it here as a message from you, or an ephemeral message."
          }
        ]
      }));
      if (storage["uwuify_messages"])
        startMessageTransfoworming(storage);
    }
  });

})();
