(function (exports) {
	'use strict';

	const { ReactNative: RN, stylesheet } = vendetta.metro.common;
	const { getAssetIDByName } = vendetta.ui.assets;
	const { Forms: Forms$1 } = vendetta.ui.components;
	const { FormRow, FormSwitch, FormRadio } = Forms$1;
	const { hideActionSheet } = vendetta.metro.findByProps("openLazy", "hideActionSheet");
	const { showSimpleActionSheet } = vendetta.metro.findByProps("showSimpleActionSheet");
	const styles = stylesheet.createThemedStyleSheet({
	  card: {
	    backgroundColor: vendetta.ui.semanticColors?.BACKGROUND_SECONDARY,
	    borderRadius: 5
	  },
	  header: {
	    padding: 0,
	    backgroundColor: vendetta.ui.semanticColors?.BACKGROUND_TERTIARY,
	    borderTopLeftRadius: 5,
	    borderTopRightRadius: 5
	  },
	  actions: {
	    flexDirection: "row-reverse",
	    alignItems: "center"
	  },
	  icon: {
	    width: 22,
	    height: 22,
	    marginLeft: 5,
	    tintColor: vendetta.ui.semanticColors?.INTERACTIVE_NORMAL
	  }
	});
	function Card(props) {
	  return /* @__PURE__ */ React.createElement(RN.View, {
	    style: [
	      styles.card,
	      {
	        marginTop: props.index !== 0 ? 10 : 0
	      }
	    ]
	  }, /* @__PURE__ */ React.createElement(FormRow, {
	    style: styles.header,
	    label: props.headerLabel,
	    leading: props.headerIcon && /* @__PURE__ */ React.createElement(FormRow.Icon, {
	      source: getAssetIDByName(props.headerIcon)
	    }),
	    trailing: props.button
	  }), /* @__PURE__ */ React.createElement(FormRow, {
	    label: props.descriptionLabel,
	    trailing: /* @__PURE__ */ React.createElement(RN.View, {
	      style: styles.actions
	    }, props.overflowActions && /* @__PURE__ */ React.createElement(RN.TouchableOpacity, {
	      onPress: function() {
	        return showSimpleActionSheet({
	          key: "CardOverflow",
	          header: {
	            title: props.overflowTitle,
	            icon: props.headerIcon && /* @__PURE__ */ React.createElement(FormRow.Icon, {
	              style: {
	                marginRight: 8
	              },
	              source: getAssetIDByName(props.headerIcon)
	            }),
	            onClose: function() {
	              return hideActionSheet();
	            }
	          },
	          options: props.overflowActions?.map(function(i) {
	            return {
	              ...i,
	              icon: getAssetIDByName(i.icon)
	            };
	          })
	        });
	      }
	    }, /* @__PURE__ */ React.createElement(RN.Image, {
	      style: styles.icon,
	      source: getAssetIDByName("ic_more_24px")
	    })), props.actions?.map(function(param) {
	      let { icon, onPress } = param;
	      return /* @__PURE__ */ React.createElement(RN.TouchableOpacity, {
	        onPress
	      }, /* @__PURE__ */ React.createElement(RN.Image, {
	        style: styles.icon,
	        source: getAssetIDByName(icon)
	      }));
	    }))
	  }));
	}

	const { React: React$1, ReactNative } = vendetta.metro.common;
	const { plugin: { storage: storage$1 }, storage: { useProxy }, ui: { alerts: { showInputAlert }, toasts: { showToast }, components: { Forms }, assets: { getAssetIDByName: getAsset } } } = vendetta;
	storage$1["schemes"] = [];
	const Button = vendetta.metro.findByProps("ButtonColors", "ButtonLooks", "ButtonSizes").default;
	function settings(props) {
	  useProxy(storage$1);
	  const buttonStyle = {
	    //paddingTop: 5,
	    height: 5,
	    margin: 8
	  };
	  return /* @__PURE__ */ React$1.createElement(React$1.Fragment, null, /* @__PURE__ */ React$1.createElement(Button, {
	    style: buttonStyle,
	    text: "hey",
	    color: "brand",
	    size: "small",
	    disabled: false,
	    onPress: function(elem) {
	      return showInputAlert({
	        title: "New scheme",
	        initialValue: "",
	        placeholder: "Name",
	        onConfirm: function(name) {
	          storage$1["schemes"].push({
	            name
	          });
	          showToast(`Created ${name}`, getAsset("check"));
	          alert(JSON.stringify(storage$1["schemes"], 0, 4));
	        },
	        confirmText: "Create",
	        confirmColor: void 0,
	        cancelText: "Cancel"
	      });
	    }
	  }), /* @__PURE__ */ React$1.createElement(ReactNative.ScrollView, null, storage$1["schemes"].map(function(scheme, i) {
	    ({
	      toggleValue,
	      index,
	      headerLabel,
	      descriptionLabel,
	      overflowActions,
	      overflowTitle,
	      actions,
	      headerIcon,
	      toggleType,
	      onToggleChange
	    });
	    return /* @__PURE__ */ React$1.createElement(Card, {
	      index: i,
	      headerLabel: scheme?.name,
	      descriptionLabel: scheme?.description,
	      headerIcon: "check",
	      toggleValue: false,
	      toggleType: /* @__PURE__ */ React$1.createElement(Button, {
	        style: buttonStyle,
	        color: "brand",
	        text: "Run",
	        size: "small",
	        disabled: false,
	        onPress: function() {
	          return scheme?.run?.();
	        }
	      })
	    });
	  })));
	}

	function cmdDisplays(obj, translations, locale) {
	  if (!obj.name || !obj?.description)
	    throw new Error(`No name(${obj?.name}) or description(${obj?.description}) in the passed command (command name: ${obj?.name})`);
	  obj.displayName = translations?.names?.[locale] ?? obj.name;
	  obj.displayDescription = translations?.names?.[locale] ?? obj.description;
	  if (obj.options) {
	    if (!Array.isArray(obj.options))
	      throw new Error(`Options is not an array (received: ${typeof obj.options})`);
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

	const { logger, commands: { registerCommand }, metro: { findByProps }, plugin: { storage } } = vendetta;
	const patches = [];
	const plugin = {
	  settings,
	  onUnload: function() {
	    return patches.every(function(unpatch) {
	      return true;
	    });
	  }
	};
	function exeCute(subcmd, args, ctx) {
	  return {
	    content: storage["test"]
	  };
	}
	plugin.onLoad = function() {
	  patches[0] = registerCommand(cmdDisplays({
	    execute: function(a, c) {
	      return exeCute();
	    },
	    name: "vibrate basic",
	    description: "Start a basic vibrating scheme",
	    applicationId: "1097969072022487110",
	    inputType: "1",
	    type: "1"
	  }));
	};

	exports.default = plugin;

	Object.defineProperty(exports, '__esModule', { value: true });

	return exports;

})({});
