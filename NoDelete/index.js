(function(a){"use strict";const{React:i,ReactNative:l}=vendetta.metro.common,{plugin:{storage:s},storage:{useProxy:d},ui:{components:{Forms:m}}}=vendetta,{FormRow:u,FormSection:h,FormSwitch:c}=m;function f(t){return d(s),i.createElement(l.ScrollView,{style:{flex:1}},[{label:"Show the time of deletion",default:!1,id:"timestamps"},{label:"The plugin does not keep the messages you've deleted"}].map(function(e){return i.createElement(u,{label:e.label,trailing:"id"in e?i.createElement(c,{value:s[e.id]??e.default,onValueChange:function(o){return s[e.id]=o}}):void 0})}))}const r={settings:f},{plugin:{storage:g},patcher:{before:p}}=vendetta;let n=[];return r.onLoad=function(){return r.onUnload=p("dispatch",vendetta.metro.common.FluxDispatcher,function(t){const[e]=t;if(e.type==="MESSAGE_DELETE"){if(n.includes(e.id))return delete n[n.indexOf(e.id)],t;let o="This message was deleted.";return g.timestamps&&(o+=` (${vendetta.metro.common.moment(new Date).toLocaleString()})`),n.push(e.id),t[0]={type:"MESSAGE_EDIT_FAILED_AUTOMOD",messageData:{type:1,message:{channelId:e.channelId,messageId:e.id}},errorResponseBody:{message:o}},t}})},a.default=r,Object.defineProperty(a,"__esModule",{value:!0}),a})({});
