(function(r){"use strict";const{React:i,ReactNative:c}=vendetta.metro.common,{plugin:{storage:s},storage:{useProxy:u},ui:{components:{Forms:f}}}=vendetta;"timestamps"in s||(s.timestamps=!1);const{FormRow:p,FormSection:b,FormSwitch:g}=f;function h(l){return u(s),i.createElement(c.ScrollView,{style:{flex:1}},[{label:"Show the time of deletion",default:!1,id:"timestamps"},{label:"Use AM/PM",default:!1,id:"ew"},{label:"The plugin does not keep the messages you've deleted"}].map(function(e){return i.createElement(p,{label:e.label,trailing:"id"in e?i.createElement(g,{value:s[e.id]??e.default,onValueChange:function(t){return s[e.id]=t}}):void 0})}))}const{plugin:{storage:d}}=vendetta;let a=[];const E={settings:h,onUnload(){},onLoad(){vendetta.metro.common.FluxDispatcher.subscribe("CONNECTION_OPEN",l);function l(e){vendetta.metro.common.FluxDispatcher.unsubscribe("CONNECTION_OPEN",l);try{const t=vendetta.metro.findByStoreName("UserStore").getCurrentUser().id==="744276454946242723";this.onUnload=vendetta.patcher.before("dispatch",vendetta.metro.common.FluxDispatcher,function(o){const[n]=o;if(n.type==="MESSAGE_DELETE"){if(a.includes(n.id))return delete a[a.indexOf(n.id)],o;a.push(n.id);let m="This message was deleted";return d.timestamps&&(m+=` (${vendetta.metro.common.moment().format(d.ew?"hh:mm:ss.SS a":"HH:mm:ss.SS")})`),(t||window?.debugpls)&&console.log("[NoDelete \u203A before]",o),o[0]={type:"MESSAGE_EDIT_FAILED_AUTOMOD",messageData:{type:1,message:{channelId:n.channelId,messageId:n.id}},errorResponseBody:{code:2e5,message:m}},(t||window?.debugpls)&&console.log("[NoDelete \u203A after]",o),o}})}catch(t){console.log("[NoDelete \u203A epik fail]"),console.error(t)}}}};return r.default=E,Object.defineProperty(r,"__esModule",{value:!0}),r})({});