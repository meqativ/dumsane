(function (exports, common, plugin, patcher) {
	'use strict';

	const { React, ReactNative } = vendetta.metro.common;
	const { plugin: { storage }, storage: { useProxy }, ui: { components: { Forms } } } = vendetta;
	if (!("timestamps" in storage))
	  storage["timestamps"] = false;
	const { FormRow, FormSection, FormSwitch } = Forms;
	function settings(props) {
	  useProxy(storage);
	  return /* @__PURE__ */ React.createElement(ReactNative.ScrollView, {
	    style: {
	      flex: 1
	    }
	  }, [
	    {
	      label: "Show the time of deletion",
	      default: false,
	      id: "timestamps"
	    },
	    {
	      label: "Use AM/PM",
	      default: false,
	      id: "ew"
	    },
	    {
	      label: "The plugin does not keep the messages you've deleted"
	    }
	  ].map(function(config) {
	    return /* @__PURE__ */ React.createElement(FormRow, {
	      label: config.label,
	      trailing: "id" in config ? /* @__PURE__ */ React.createElement(FormSwitch, {
	        value: storage[config.id] ?? config.default,
	        onValueChange: function(value) {
	          return storage[config.id] = value;
	        }
	      }) : void 0
	    });
	  }));
	}

	let deleteable = [];
	console.log(vendetta.plugin);
	var index = {
	  settings,
	  onLoad() {
	    try {
	      this.onUnload = patcher.before("dispatch", common.FluxDispatcher, function(args) {
	        const event = args[0];
	        if (!event)
	          return;
	        if (event?.type === "MESSAGE_DELETE") {
	          if (!event?.id || !event?.channelId)
	            return;
	          if (deleteable.includes(event.id)) {
	            deleteable.splice(deleteable.indexOf(event.id), 1);
	            return args;
	          }
	          deleteable.push(event.id);
	          let message = plugin.storage["message"]?.trim?.() || "This message was deleted";
	          if (plugin.storage["timestamps"])
	            message += ` (${common.moment().format(plugin.storage["ew"] ? "hh:mm:ss.SS a" : "HH:mm:ss.SS")})`;
	          args[0] = {
	            type: "MESSAGE_EDIT_FAILED_AUTOMOD",
	            messageData: {
	              type: 1,
	              message: {
	                channelId: event.channelId,
	                messageId: event.id
	              }
	            },
	            errorResponseBody: {
	              code: 2e5,
	              message
	            }
	          };
	          return args;
	        }
	      });
	    } catch (e) {
	      alert("NoDelete died\n" + e.stack);
	      console.error(e);
	    }
	  }
	};

	exports.default = index;

	Object.defineProperty(exports, '__esModule', { value: true });

	return exports;

})({}, vendetta.metro.common, vendetta.plugin, vendetta.patcher);
