(function(l,v,T,s,S,B){"use strict";function m(e,a,i){if(!e.name||!e?.description)throw new Error(`No name(${e?.name}) or description(${e?.description}) in the passed command (command name: ${e?.name})`);if(e.displayName??=a?.names?.[i]??e.name,e.displayDescription??=a?.names?.[i]??e.description,e.options){if(!Array.isArray(e.options))throw new Error(`Options is not an array (received: ${typeof e.options})`);for(var r=0;r<e.options.length;r++){const n=e.options[r];if(!n?.name||!n?.description)throw new Error(`No name(${n?.name}) or description(${n?.description} in the option with index ${r}`);if(n.displayName??=a?.options?.[r]?.names?.[i]??n.name,n.displayDescription??=a?.options?.[r]?.descriptions?.[i]??n.description,n?.choices){if(!Array.isArray(n?.choices))throw new Error(`Choices is not an array (received: ${typeof n.choices})`);for(var o=0;o<n.choices.length;o++){const t=n.choices[o];if(!t?.name)throw new Error(`No name of choice with index ${o} in option with index ${r}`);t.displayName??=a?.options?.[r]?.choices?.[o]?.names?.[i]??t.name}}}}return e}function M(e){let a=arguments.length>1&&arguments[1]!==void 0?arguments[1]:27;if(typeof e!="string")throw new Error("Passed chars isn't a string");if(e.length<=0)throw new Error("Invalid chars length");let i="";for(let r=0;r<a;r++)i+=e[Math.floor(Math.random()*e.length)];return i}function E(e){const{metro:a}=e,{receiveMessage:i}=a.findByProps("sendMessage","receiveMessage"),{createBotMessage:r}=a.findByProps("createBotMessage"),o=a.findByProps("BOT_AVATARS");return function(n,t){if(!n.channelId)throw new Error("No channel id to receive the message into (channelId)");typeof t<"u"&&"author"in t&&"avatar"in t.author&&"avatarURL"in t.author&&(o.BOT_AVATARS[t.author.avatar]=t.author.avatarURL,delete t.author.avatarURL);let c=t===!0?n:r(n);return typeof t=="object"&&(c=e.metro.findByProps("merge").merge(c,t)),i(n.channelId,c),c}}const y={loadingDiscordSpinner:"a:loading:1105495814073229393",aol:"a:aol:1108834296359301161",linuth:":linuth:1110531631409811547",fuckyoy:":fuckyoy:1108360628302782564",getLoading(){return Math.random()<.01?this?.aol:this.loadingDiscordSpinner},getFailure(){return Math.random()<.01?this?.fuckyoy:this.linuth},getSuccess(){return""}},A={command:"https://cdn.discordapp.com/attachments/1099116247364407337/1112129955053187203/command.png"},w="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",k=w.replace("+/","_-");function P(e,a){if(typeof e!="number")throw new Error(`Passed data isn't a number (received: ${typeof e})`);let i="";for(;e>0;)i=(a?k:w).charAt(e%64)+i,e=Math.floor(e/64);return i}s.findByProps("base64Encode").base64Encode;const{meta:{resolveSemanticColor:U}}=s.findByProps("colors","meta"),N=s.findByStoreName("ThemeStore"),u=function(){return parseInt(U(N.theme,v.semanticColors.BACKGROUND_SECONDARY).slice(1),16)},p={author:{username:"TokenUtils",avatar:"command",avatarURL:A.command}};let g;function f(){return window.sendMessage?window.sendMessage?.(...arguments):(g||(g=E(vendetta)),g(...arguments))}var $={meta:vendetta.plugin,patches:[],onUnload(){this.patches.forEach(function(e){return e()}),this.patches=[]},onLoad(){var e=this;const a="Copy Token",i=patchBefore("render",s.findByProps("ScrollView").View,function(r){try{let o=S.findInReactTree(r,function(h){return h.key===".$UserProfileOverflow"});if(!o||!o.props||o.props.sheetKey!=="UserProfileOverflow")return;const n=o.props.content.props;if(n.options.some(function(h){return h?.label===a}))return;const t=Object.keys(o._owner.stateNode._keyChildMapping).find(function(h){return o._owner.stateNode._keyChildMapping[h]&&h.match(/(?<=\$UserProfile)\d+/)})?.slice?.(13),c=s.findByStoreName("UserStore").getCurrentUser()?.id,d=s.findByProps("getToken").getToken();n.options.unshift({isDestructive:!0,label:a,onPress:function(){showToast(t===c?"Copied your token":`Copied token of ${n.header.title}`),B.setString(t===c?d:[s.findByProps("base64Encode").base64Encode(t),P(+Date.now()-129384e4),M(k,27)].join(".")),n.hideActionSheet()}})}catch(o){console.error(o);let n=!1;try{n=i()}catch{n=!1}alert(`[TokenUtils \u2192 context menu patch] failed. Patch ${n?"dis":"en"}abled
`+o.stack)}});this.patches.push(i);try{const r={get(o,n){try{const t={...p,interaction:{name:"/token get",user:s.findByStoreName("UserStore").getCurrentUser()}},{getToken:c}=s.findByProps("getToken");f({loggingName:"Token get output message",channelId:n.channel.id,embeds:[{color:u(),type:"rich",title:"Token of the current account",description:`${c()}`}]},t)}catch(t){console.error(t),alert(`There was an error while exeCuting /token get
`+t.stack)}},login(o,n){try{const t={...p,interaction:{name:"/token login",user:s.findByStoreName("UserStore").getCurrentUser()}},c=new Map(o.map(function(d){return[d.name,d]})).get("token").value;try{f({loggingName:"Token login process message",channelId:n.channel.id,embeds:[{color:u(),type:"rich",title:`<${y.getLoading()}> Switching accounts\u2026`}]},t),s.findByProps("login","logout","switchAccountToken").switchAccountToken(c)}catch(d){console.error(d),f({loggingName:"Token login failure message",channelId:n.channel.id,embeds:[{color:u(),type:"rich",title:`<${y.getFailure()}> Failed to switch accounts`,description:`${d.message}`}]},t)}}catch(t){console.error(t),alert(`There was an error while executing /token login
`+t.stack)}}};[m({type:1,inputType:1,applicationId:"-1",execute:r.get,name:"token get",description:"Shows your current user token"}),m({type:1,inputType:1,applicationId:"-1",execute:r.login,name:"token login",description:"Logs into an account using a token",options:[{required:!0,type:3,name:"token",description:"Token of the account to login into"}]})].forEach(function(o){return e.patches.push(T.registerCommand(o))})}catch(r){console.error(r),alert(`There was an error while loading TokenUtils
`+r.stack)}}};return l.EMBED_COLOR=u,l.authorMods=p,l.default=$,Object.defineProperty(l,"__esModule",{value:!0}),l})({},vendetta.ui,vendetta.commands,vendetta.metro,vendetta.utils,vendetta.clipboard);
