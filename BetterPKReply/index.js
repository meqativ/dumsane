(function(s){"use strict";const{React:o,ReactNative:r}=vendetta.metro.common,{plugin:{storage:i},storage:{useProxy:d},ui:{components:{Forms:c}}}=vendetta,{FormRow:m,FormSection:h,FormSwitch:l}=c;function u(t){return d(i),o.createElement(r.ScrollView,{style:{flex:1}},[{label:"Fetch message (recommended)",default:!0,id:"fetch_msg"}].map(function(e){return e.id in i||(i[e.id]=e.default),o.createElement(m,{label:e.label,trailing:"id"in e?o.createElement(l,{value:i[e.id],onValueChange:function(n){return i[e.id]=n}}):void 0})}))}const g=vendetta.metro.findByStoreName("MessageStore");function a(t){if(t?.message_reference?.message_id||(t.id==="1099648298723332176"&&console.log(t),!t.embeds?.[0]?.description?.startsWith("**[Reply to:](")&&!t.embeds?.[0]?.description?.startsWith("*[(click to see attachment)[")))return t;const e=t.embeds[0].description.match(/channels\/(\d+)\/(\d+)\/(\d+)/),n=t.embeds.shift();return t.message_reference={guild_id:e[1],channel_id:e[2],message_id:e[3]},vendetta.plugin.storage.fetch_message===!0&&(delete t.webhook_id,delete t.application_id,console.log("h"),t.author.discriminator=6969,t.referenced_message=g.getMessage(e[3])??{id:e[3],author:{username:n.author.name.substring(0,n.author.name-2)},content:n.description.substring(n.indexOf(")"),n.description.length)},t.id==="1099648298723332176"&&console.log(t)),t}var f={settings:u,onLoad:function(){this.onUnload=vendetta.patcher.before("dispatch",vendetta.metro.common.FluxDispatcher,function(t){let[e]=t;if(e.type==="LOAD_MESSAGES_SUCCESS")return e.messages=e.messages.map(a),[e];if(e.type==="MESSAGE_CREATE")return e.message=a(e.message),[e]})}};return s.default=f,Object.defineProperty(s,"__esModule",{value:!0}),s})({});
