(function (exports) {
	'use strict';

	const { React, ReactNative } = vendetta.metro.common;
	const { plugin: { storage }, storage: { useProxy }, ui: { components: { Forms } } } = vendetta;
	const { FormRow, FormSection, FormSwitch } = Forms;
	function settings(props) {
	  useProxy(storage);
	  return /* @__PURE__ */ React.createElement(ReactNative.ScrollView, {
	    style: {
	      flex: 1
	    }
	  }, [
	    {
	      label: "Fetch message (recommended)",
	      default: true,
	      id: "fetch_msg"
	    }
	  ].map(function(config) {
	    if (!(config.id in storage))
	      storage[config.id] = config.default;
	    return /* @__PURE__ */ React.createElement(FormRow, {
	      label: config.label,
	      trailing: "id" in config ? /* @__PURE__ */ React.createElement(FormSwitch, {
	        value: storage[config.id],
	        onValueChange: function(value) {
	          return storage[config.id] = value;
	        }
	      }) : void 0
	    });
	  }));
	}

	vendetta.metro.findByStoreName("MessageStore");
	var index = {
	  settings,
	  onLoad: function() {
	    this.onUnload = vendetta.patcher.before("updateRows", vendetta.metro.common.ReactNative.NativeModules.DCDChatManager, function(param) {
	      let [rows] = param;
	      const rowsa = JSON.parse(rows);
	      console.log(rowsa);
	    });
	  }
	};

	exports.default = index;

	Object.defineProperty(exports, '__esModule', { value: true });

	return exports;

})({});
