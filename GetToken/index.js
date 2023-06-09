(function(h,T,S,c,M,B,A,P){"use strict";function y(e,i,a){if(!e.name||!e?.description)throw new Error(`No name(${e?.name}) or description(${e?.description}) in the passed command (command name: ${e?.name})`);if(e.displayName??=i?.names?.[a]??e.name,e.displayDescription??=i?.names?.[a]??e.description,e.options){if(!Array.isArray(e.options))throw new Error(`Options is not an array (received: ${typeof e.options})`);for(var r=0;r<e.options.length;r++){const t=e.options[r];if(!t?.name||!t?.description)throw new Error(`No name(${t?.name}) or description(${t?.description} in the option with index ${r}`);if(t.displayName??=i?.options?.[r]?.names?.[a]??t.name,t.displayDescription??=i?.options?.[r]?.descriptions?.[a]??t.description,t?.choices){if(!Array.isArray(t?.choices))throw new Error(`Choices is not an array (received: ${typeof t.choices})`);for(var o=0;o<t.choices.length;o++){const n=t.choices[o];if(!n?.name)throw new Error(`No name of choice with index ${o} in option with index ${r}`);n.displayName??=i?.options?.[r]?.choices?.[o]?.names?.[a]??n.name}}}}return e}function U(e){let i=arguments.length>1&&arguments[1]!==void 0?arguments[1]:27;if(typeof e!="string")throw new Error("Passed chars isn't a string");if(e?.length<=0)throw new Error("Invalid chars length");let a="";for(let r=0;r<i;r++)a+=e[Math.floor(Math.random()*e.length)];return a}function $(e){const{metro:i}=e,{receiveMessage:a}=i.findByProps("sendMessage","receiveMessage"),{createBotMessage:r}=i.findByProps("createBotMessage"),o=i.findByProps("BOT_AVATARS");return function(t,n){if(!t.channelId)throw new Error("No channel id to receive the message into (channelId)");typeof n<"u"&&"author"in n&&"avatar"in n.author&&"avatarURL"in n.author&&(o.BOT_AVATARS[n.author.avatar]=n.author.avatarURL,delete n.author.avatarURL);let s=n===!0?t:r(t);return typeof n=="object"&&(s=e.metro.findByProps("merge").merge(s,n)),a(t.channelId,s),s}}const w={loadingDiscordSpinner:"a:loading:1105495814073229393",aol:"a:aol:1108834296359301161",linuth:":linuth:1110531631409811547",fuckyoy:":fuckyoy:1108360628302782564",getLoading(){return Math.random()<.01?this?.aol:this.loadingDiscordSpinner},getFailure(){return Math.random()<.01?this?.fuckyoy:this.linuth},getSuccess(){return""}},N={command:"https://cdn.discordapp.com/attachments/1099116247364407337/1112129955053187203/command.png"},k="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",v=k.replace("+/","_-");function C(e,i){if(typeof e!="number")throw new Error(`Passed data isn't a number (received: ${typeof e})`);let a="";for(;e>0;)a=(i?v:k).charAt(e%64)+a,e=Math.floor(e/64);return a}const{meta:{resolveSemanticColor:E}}=c.findByProps("colors","meta"),b=c.findByStoreName("ThemeStore"),u=function(){return parseInt(E(b.theme,T.semanticColors.BACKGROUND_SECONDARY).slice(1),16)},p={author:{username:"TokenUtils",avatar:"command",avatarURL:N.command}};let g;function m(){return window.sendMessage?window.sendMessage?.(...arguments):(g||(g=$(vendetta)),g(...arguments))}var O={meta:vendetta.plugin,patches:[],onUnload(){this.patches.forEach(function(e){return e()}),this.patches=[]},onLoad(){var e=this;const i="Copy Token",a=A.before("render",c.findByProps("ScrollView").View,function(r){try{let o=M.findInReactTree(r,function(d){return d.key===".$UserProfileOverflow"});if(!o||!o.props||o.props.sheetKey!=="UserProfileOverflow")return;const t=o.props.content.props;if(t.options.some(function(d){return d?.label===i}))return;const n=c.findByStoreName("UserStore").getCurrentUser()?.id,s=Object.keys(o._owner.stateNode._keyChildMapping).find(function(d){return o._owner.stateNode._keyChildMapping[d]&&d.match(/(?<=\$UserProfile)\d+/)})?.slice?.(13)||n,l=c.findByProps("getToken").getToken();t.options.unshift({isDestructive:!0,label:i,onPress:function(){try{P.showToast(s===n?"Copied your token":`Copied token of ${t.header.title}`),B.setString(s===n?l:[Buffer.from(s).toString("base64").replaceAll("=",""),C(+Date.now()-129384e4,!0),U(v,27)].join(".")),t.hideActionSheet()}catch(d){console.error(d);let f=!1;try{f=a()}catch{f=!1}alert(`[TokenUtils \u2192 context menu patch \u2192 option onPress] failed. Patch ${f?"dis":"en"}abled
`+d.stack)}}})}catch(o){console.error(o);let t=!1;try{t=a()}catch{t=!1}alert(`[TokenUtils \u2192 context menu patch] failed. Patch ${t?"dis":"en"}abled
`+o.stack)}});this.patches.push(a);try{const r={get(o,t){try{const n={...p,interaction:{name:"/token get",user:c.findByStoreName("UserStore").getCurrentUser()}},{getToken:s}=c.findByProps("getToken");m({loggingName:"Token get output message",channelId:t.channel.id,embeds:[{color:u(),type:"rich",title:"Token of the current account",description:`${s()}`}]},n)}catch(n){console.error(n),alert(`There was an error while exeCuting /token get
`+n.stack)}},login(o,t){try{const n={...p,interaction:{name:"/token login",user:c.findByStoreName("UserStore").getCurrentUser()}},s=new Map(o.map(function(l){return[l.name,l]})).get("token").value;try{m({loggingName:"Token login process message",channelId:t.channel.id,embeds:[{color:u(),type:"rich",title:`<${w.getLoading()}> Switching accounts\u2026`}]},n),c.findByProps("login","logout","switchAccountToken").switchAccountToken(s)}catch(l){console.error(l),m({loggingName:"Token login failure message",channelId:t.channel.id,embeds:[{color:u(),type:"rich",title:`<${w.getFailure()}> Failed to switch accounts`,description:`${l.message}`}]},n)}}catch(n){console.error(n),alert(`There was an error while executing /token login
`+n.stack)}}};[y({type:1,inputType:1,applicationId:"-1",execute:r.get,name:"token get",description:"Shows your current user token"}),y({type:1,inputType:1,applicationId:"-1",execute:r.login,name:"token login",description:"Logs into an account using a token",options:[{required:!0,type:3,name:"token",description:"Token of the account to login into"}]})].forEach(function(o){return e.patches.push(S.registerCommand(o))})}catch(r){console.error(r),alert(`There was an error while loading TokenUtils
`+r.stack)}}};return h.EMBED_COLOR=u,h.authorMods=p,h.default=O,Object.defineProperty(h,"__esModule",{value:!0}),h})({},vendetta.ui,vendetta.commands,vendetta.metro,vendetta.utils,vendetta.metro.common.clipboard,vendetta.patcher,vendetta.ui.toasts);
