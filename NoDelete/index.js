(function(s){"use strict";const{React:t,ReactNative:c}=vendetta.metro.common,{plugin:{storage:o},storage:{useProxy:d},ui:{components:{Forms:u}}}=vendetta,{FormRow:l,FormSection:g,FormSwitch:r}=u;function E(n){return d(o),console.log("[NoDelete]",n),t.createElement(c.ScrollView,{style:{flex:1}},t.createElement(g,{title:"NoDelete settings"},t.createElement(l,{label:"Time of deletion",trailing:t.createElement(r,{value:o.timestamps??!1,onValueChange:function(e){return o.timestamps=e}})}),t.createElement(l,{label:"Use emojis",trailing:t.createElement(r,{value:o.emojis??!1,onValueChange:function(e){return o.emojis=e}})})))}const i={settings:E},{plugin:{storage:m},patcher:{before:f}}=vendetta;let a=[];return i.onLoad=function(){return i.onUnload=f("dispatch",vendetta.metro.common.FluxDispatcher,function(n){const[e]=n;if(e.type==="MESSAGE_DELETE")return a.includes(e.id)?(delete a[a.indexOf(e.id)],n):(a.push(e.id),n[0]={type:"MESSAGE_EDIT_FAILED_AUTOMOD",messageData:{type:1,message:{channelId:e.channelId,messageId:e.id}},errorResponseBody:{code:2e5,message:m.emojis?"tha messg got delted \u{1F480}":"This message was deleted."+!m.timestamps?"":` (${vendetta.metro.common.moment(new Date).toLocaleString()})`}},n)})},s.default=i,Object.defineProperty(s,"__esModule",{value:!0}),s})({});
