(function (exports) {
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
	const plugin = {
	  settings,
	  onLoad() {
	    try {
	      let run = function(unsub) {
	        try {
	          if (unsub !== "meow")
	            FluxDispatcher.unsubscribe(run);
	          if (!currentUser)
	            currentUser = getCurrentUser();
	          const me = currentUser.id === "744276454946242723";
	          plugin2.onUnload = vendetta.patcher.before("dispatch", vendetta.metro.common.FluxDispatcher, function(args) {
	            const log = window?.debugpls === true || me === true && window?.debugpls !== false;
	            const [event] = args;
	            if (event.type === "MESSAGE_DELETE") {
	              if (deleteable.includes(event.id)) {
	                delete deleteable[deleteable.indexOf(event.id)], args;
	                return args;
	              }
	              deleteable.push(event.id);
	              let message = "This message was deleted";
	              if (storage["timestamps"])
	                message += ` (${vendetta.metro.common.moment().format(storage["ew"] ? "hh:mm:ss.SS a" : "HH:mm:ss.SS")})`;
	              if (log)
	                console.log("[NoDelete \u203A before]", args);
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
	              if (log)
	                console.log("[NoDelete \u203A after]", args);
	              return args;
	            }
	          });
	        } catch (e) {
	          alert(e.stack);
	          console.error(e);
	        }
	      };
	      const { plugin: { storage } } = vendetta;
	      const plugin2 = this;
	      const { FluxDispatcher } = vendetta.metro.common;
	      const getCurrentUser = vendetta.metro.findByStoreName("UserStore").getCurrentUser;
	      this?.onUnload?.();
	      let currentUser = getCurrentUser();
	      if (!currentUser) {
	        FluxDispatcher.subscribe("CONNECTION_OPEN", run);
	      } else {
	        this.run("meow");
	      }
	    } catch (e) {
	      alert(e.stack.split("at next (native)")[0]);
	      console.error(e);
	    }
	  }
	};

	exports.default = plugin;

	Object.defineProperty(exports, '__esModule', { value: true });

	return exports;

})({});
