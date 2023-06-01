(function(u,F,b,E,S,T){"use strict";function D(e,r,t){if(!e.name||!e?.description)throw new Error(`No name(${e?.name}) or description(${e?.description}) in the passed command (command name: ${e?.name})`);if(e.displayName=r?.names?.[t]??e.name,e.displayDescription=r?.names?.[t]??e.description,e.options){if(!Array.isArray(e.options))throw new Error(`Options is not an array (received: ${typeof e.options})`);e.options=e.options.map(function(n,a){if(!n?.name||!n?.description)throw new Error(`No name(${n?.name}) or description(${n?.description} in the option with index ${a}`);return n.displayName=r?.options?.[a]?.names?.[t]??n.name,n.displayDescription=r?.options?.[a]?.descriptions?.[t]??n.description,n})}return e}function V(e){const{receiveMessage:r}=metro.findByProps("sendMessage","receiveMessage"),{createBotMessage:t}=metro.findByProps("createBotMessage"),n=metro.findByProps("BOT_AVATARS");return function(a,i){typeof i<"u"&&"author"in i&&"avatar"in i.author&&"avatarURL"in i.author&&(n.BOT_AVATARS[i.author.avatar]=i.author.avatarURL,delete i.author.avatarURL);let s=t(a);return typeof i=="object"&&(s=metro.findByProps("merge").merge(s,i)),r(a.channelId,s),s}}const v={loadingDiscordSpinner:"a:loading:1105495814073229393",aol:"a:aol:1108834296359301161",linuth:":linuth:1110531631409811547",fuckyoy:":fuckyoy:1108360628302782564",getLoading(){return Math.random()<.01?this?.aol:this.loadingDiscordSpinner},getFailure(){return Math.random()<.01?this?.fuckyoy:this.linuth},getSuccess(){return""}},j={command:"https://cdn.discordapp.com/attachments/1099116247364407337/1112129955053187203/command.png"};function P(){let e=arguments.length>0&&arguments[0]!==void 0?arguments[0]:200,r=arguments.length>1&&arguments[1]!==void 0?arguments[1]:1,t=arguments.length>2&&arguments[2]!==void 0?arguments[2]:0;return Array.from({length:r},function(){return`vibrate(duration = ${e})`}).join(t>0?`
wait(time = ${t})
`:`
`)}function I(e,r){return e<0?r??0:e}function y(e){return e.error=!0,e.toString=function(){var r=this;const t=`${this.line} | `,n=this.character+t.length;let a,i;return this.lines&&(a=this.lines.splice(this.line-3,this.line-1).reduce(function(s,o,C){return s+`${C+r.line-3} | ${o}
`},""),i=`
`+this.lines.slice(this.line,this.line+3).reduce(function(s,o,C){return s+`${C+r.line+1} | ${o}
`},"")),a+(`${t}${this.codeline}
`+" ".repeat(I(n-1))+(this.message.length<25?"^"+"-".repeat(I(t.length-n,1))+" ":`\u2191
`+" ".repeat(I(n-1-5)))+"Syntax Error: "+this.message)+i},e}function q(e,r){if(typeof e!="string")throw new Error("passed scheme isn't a string");const t=[],n=e.split(/\r?\n|\r/);for(var a=0;a<n.length;a++){const s=n[a].trimEnd(),[o,C]=s.split(";"),w={name:void 0,rawName:void 0,comment:C,args:[],rawArgs:void 0};if(r&&(w.line=a),!r&&o.length===0||(r&&(w.rawName=o),t.push(w),o.length===0))continue;const l=o.indexOf("("),d=o.indexOf(")");if(o.trimEnd().substring(0,d).length>o.trimEnd().length)return y({message:"Unnecessary symbols after funk brackets",character:d+1,codeline:o,line:a,lines:n});let g;if(l===0?g=o.substring(0,l):d===0?g=o.substring(0,d):g=o.substring(0,l!==-1?l:0),g.length===0&&(l===0||d===0))return y({message:"No funk name",character:1,codeline:o,line:a,lines:n});if(w.name=g.trim(),l===-1&&d===-1)return y({message:'No arg brackets ("(", ")")',character:g.length||1,codeline:o,line:a,lines:n});if(l===-1)return y({message:'No opening arg bracket ("(")',character:d!==-1?d+1:0,codeline:o,line:a,lines:n});if(d===-1)return y({message:'No closing arg bracket (")")',character:l!==-1?l+1:0,codeline:o,line:a,lines:n});const B=o.substring(l+1,d).split(",");r&&(w.rawArgs=B);for(var i=0;i<B.length;i++){const $=B[i],p={name:void 0,rawName:void 0,equalsUsed:void 0,value:void 0,rawValue:void 0};if(!r&&$.length===0){if(i!==0)return y({message:"Empty argument",character:g.length+B.splice(0,i).reduce(function(O,A){return O+A.length+1},1),codeline:o,line:a,lines:n});break}w.args.push(p),r&&(p.equalsUsed=$.indexOf("=")!==-1),r&&(p.rawName=f[0]);const f=$.split("=");if(f.length===2&&[f[0],f[1]].every(function(O){return O===""}))return y({message:"Empty argument name",character:g.length+B.splice(0,i).reduce(function(O,A){return O+A.length+1},1)+$.indexOf("="),codeline:o,line:a,lines:n});f[1]||(f[1]="true"),p.name=f[0].trim();const X=f[1];r&&p.rawValue;const k=X.trim(),x=parseInt(k);Number.isNaN(x)?k==="true"?p.value=!0:k==="false"?p.value=!1:p.value=k:p.value=x}}return t}const G={exeCute:async function(e){const r={..._,interaction:{name:"/vibrate start",user:b.findByStoreName("UserStore").getCurrentUser()}};try{const{args:t,channel:n}=e;if(!(t.get("scheme")||t.get("duration")||t.get("repeat")||t.get("gap")))return await c({channel_id:n.id,embeds:[{color:h(),type:"rich",title:`<${v.getFailure()}> Please provide a \`scheme\` or choose \`duration\`, \`repeat\` and/or \`gap\``}]},r);const a=t.get("scheme")?.value||P(t.get("duration").value,t.get("repeat")?.value,t.get("gap")?.value);L({scheme:a,parseCB:async function(i){return await c({channelId:n.id,embeds:[{color:h(),type:"rich",title:"<:vibrating:1095354969965731921> Parsing vibration\u2026",footer:{text:`ID: ${i.id}
(if you stop now, it will stop after parsing)`}}]},r)},parseFailCB:async function(i){return await c({channelId:n.id,embeds:[{color:h(),type:"rich",title:`<${v.getFailure()}> An error ocurred while parsing the scheme`,description:`\`\`\`js
${i.scheme.toString()}\`\`\``}]},{...r,id:i.parseCallbackOutput.id,edited_timestamp:Date.now().toString()})},startCB:async function(i){return await c({channelId:n.id,embeds:[{color:h(),type:"rich",title:"<:vibrating:1095354969965731921> Playing vibration",footer:{text:`ID: ${i.id}`}}]},{...r,edited_timestamp:Date.now().toString(),id:i.parseCallbackOutput.id})},errorCB:async function(i){return await c({channelId:n.id,embeds:[{color:h(),type:"rich",title:`${v.getFailure()} An error ocurred while playing the vibration`,description:`\`\`\`${i.error.message}\`\`\``}]},{...r,edited_timestamp:Date.now().toString(),id:i.startCallbackOutput.id})},finishCB:async function(i){const s=i.startCallbackOutput.id;c({channelId:n.id,embeds:[{color:h(),type:"rich",title:`<:still:1095977283212296194> ${i.stopped?"Stopp":"Finish"}ed playing`,footer:{text:`ID: ${i.id}`}}]},{...r,type:19,message_reference:{channel_id:n.id,message_id:s,guild_id:e?.guild?.id},referenced_message:b.findByStoreName("MessageStore").getMessage(n.id,s)})}})}catch(t){console.error(t),c({channelId:channel.id,content:`\`\`\`js
${t.stack}\`\`\``,embeds:[{color:h(),type:"rich",title:`<${v.getFailure()}> An error ocurred while running the command`,description:`Send a screenshot of this error and explain how you came to it, here: ${N}, to hopefully get this error solved!`}]},r)}}},H={exeCute:async function(e){const{channel:r,args:t}=e,n={..._,interaction:{name:"/vibrate stop",user:b.findByStoreName("UserStore").getCurrentUser()}};try{const a=t.get("id").value;if(m.findIndex(function(s){return s.id===a})===-1){await c({channelId:r.id,embeds:[{color:EMBED_COLOR(),type:"rich",title:`<${v.getFailure()}> Vibration with id \`${a}\` not found`}]},n);return}const i=m[m.findIndex(function(s){return s.id===a})];i.stopping=!0,i.startCallbackOutput=c({channelId:r.id,embeds:[{color:EMBED_COLOR(),type:"rich",title:`<${v.getLoading()}> Stopping vibration\u2026`,footer:{text:`ID: ${i.id}`}}]},n)}catch(a){console.error(a),c({color:EMBED_COLOR(),channelId:r.id,content:`\`\`\`js
${a.stack}\`\`\``,embeds:[{type:"rich",title:`<${v.getFailure()}> An error ocurred while running the command`,description:`Send a screenshot of this error and explain how you came to it, here: ${N}, to hopefully get this error solved!`}]},n)}}},N="||not proxied||",J="1113021888109740083",_={author:{username:"Vibrate",avatar:"command",avatarURL:j.command}};"stats"in S.storage||(S.storage.stats={});{const e=S.storage.stats;"localRuns"in e||(e.localRuns=0),"publicRuns"in e||(e.publicRuns=0),"lastVibration"in e||(e.lastVibration={scheme:P(150,5)})}const{meta:{resolveSemanticColor:K}}=b.findByProps("colors","meta"),W=b.findByStoreName("ThemeStore"),h=function(){return K(W.theme,T.semanticColors.BACKGROUND_SECONDARY)};let M;function c(){return window.sendMessage?window.sendMessage?.(...arguments):(M||(M=V(vendetta)),M(...arguments))}const{triggerHaptic:U}=b.findByProps("triggerHaptic"),Y=E.ReactNative.Platform.select,R=function(e){return new Promise(function(r){return setTimeout(r,e)})};let z=0;const m=[];async function L(e){try{if(typeof e>"u"&&(e={}),!e?.scheme)throw new Error("No scheme provided");const t={id:z++,meta:{rawScheme:e.scheme},stopping:!1,stopped:!1,ios:!!Y({ios:!0})};if(e?.parseCB&&(t.parseCallbackOutput=await e.parseCB(t)),t.scheme=q(t.meta.rawScheme,e?.debug),m.push(t),console.log("VIBRATION",t),t.scheme.error===!0&&(t.errored=!0,e?.parseFailCB&&(t.errorCallbackOutput=await e.parseFailCB(t))),!t.errored&&e?.startCB&&(t.startCallbackOutput=await e.startCB?.(t)),!t.errored){S.storage.localRuns++;for(var r of t.scheme){if(!r.name)continue;const n=r.args.find(function(a){return a.name==="duration"})?.value;switch(r.name){case"vibrate":if(t.ios){U();const a=setInterval(U,1);await R(n??400),clearInterval(a)}else E.ReactNative.Vibration.vibrate(n??400),await R(n??400);break;case"wait":await R(n??5);break;default:t.errored=!0,t.stopping=!0,t.error={message:"Unknown funk: "+r.name},e?.errorCB&&(t.errorCallbackOutput=e.errorCB(t))}if(t.stopping===!0){t.stopped=!0;break}if(t.errored)break}}return m.splice(m.findIndex(function(n){return n.id===t.id}),1),t.errored?t.errorCallbackOutput:e?.finishCB?.(t)}catch(t){console.error(t),alert(`An error ocurred at vibrate()
`+t.stack)}}var Q={patches:[function(){for(var e=0;e<m.length;e++)m[e].stopping=!0}],onUnload(){this.patches.every(function(e){return e(),!0})},onLoad(){var e=this;try{[D({execute:async function(r,t){return H.exeCute({...t,args:new Map(r.map(function(n){return[n.name,n]})),plugin:e})},type:1,inputType:1,applicationId:"-1",name:"vibrate stop",description:"Stop a brrr",options:[{type:4,required:!0,name:"id",description:"Vibration id which you receive when starting a vibration"}]}),D({execute:async function(r,t){return G.exeCute({...t,args:new Map(r.map(function(n){return[n.name,n]})),plugin:e})},type:1,inputType:1,applicationId:"-1",name:"vibrate start",description:"Start a brrr",options:[{type:3,name:"scheme",description:"A custom scheme to use (overwrites all other options)",min_length:1},{type:4,name:"duration",description:"Duration of one vibration (ms)",min_value:1},{type:4,name:"repeat",description:"Number of times to repeat"},{type:4,name:"gap",description:"Wait between vibrations (only matters if you have more than 1 repeat)"}]})].forEach(function(r){return e.patches.unshift(F.registerCommand(r))})}catch(r){console.error(r),alert(`There was an error while loading Vibrate
`+r.stack)}}};return u.APP_ID=J,u.EMBED_COLOR=h,u.PLUGIN_FORUM_POST_URL=N,u.authorMods=_,u.default=Q,u.sendMessage=c,u.vibrate=L,u.vibrations=m,Object.defineProperty(u,"__esModule",{value:!0}),u})({},vendetta.commands,vendetta.metro,vendetta.metro.common,vendetta.plugin,vendetta.ui);
