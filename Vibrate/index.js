(function(h){"use strict";function f(e,r,d){if(!e.name||!e?.description)throw new Error(`No name(${e?.name}) or description(${e?.description}) in the passed command. (command name: ${e?.name})`);return e.displayName=r?.names?.[d]??e.name,e.displayDescription=r?.names?.[d]??e.description,e.options&&(e.options=e.options.map(function(t,c){if(!t?.name||!t?.description)throw new Error(`No name(${t?.name}) or description(${t?.description} in the option with index ${c}`);return t.displayName=r?.options?.[c]?.names?.[d]??t.name,t.displayDescription=r?.options?.[c]?.descriptions?.[d]??t.description,t})),e}const g={loadingDiscordSpinner:":loading:1105495814073229393",aol:"a:aol:1108834296359301161",linuth:":linuth:1110531631409811547",fuckyoy:":fuckyoy:1108360628302782564",getLoading(){return Math.random()<.01?this?.aol:this.loadingDiscordSpinner},getFailure(){return Math.random()<.01?this?.fuckyoy:this.linuth},getSuccess(){return""}},{metro:l,logger:w,commands:b}=vendetta,{vibrate:A}=l.findByProps("vibrate"),y=function(e){return l.findByProps("View").Platform.select("ios"in e||"android"in e?e:{ios:[e],android:e})},v=function(e){return new Promise(function(r){return setTimeout(r,e)})},m={patches:[],onUnload:function(){this.patches.every(function(e){return e(),!0})}},I=[];async function B(e,r,d){try{typeof e>"u"&&(e={}),console.log("VIBATE",{options:e,typeof:typeof e}),e.hasOwnProperty("duration")||(e.duration=400),e.hasOwnProperty("repeat")||(e.repeat=1),e.hasOwnProperty("gap")||(e.gap=0),y({ios:!0})&&duration>400&&(duration=400);const t={id:+Date.now(),aborting:!1,aborted:!1};r(t);for(let c=0;c<e.repeat;c++){if(A(y(e.duration),!0),await v(e.duration),t.aborting===!0){t.aborted=!0;break}await v(e.gap)}d(t)}catch(t){alert(t.stack)}}return m.onLoad=function(){try{let e=function(p,n){typeof n<"u"&&"author"in n&&"avatar"in n.author&&"avatarURL"in n.author&&(t.BOT_AVATARS[n.author.avatar]=n.author.avatarURL,delete n.author.avatarURL);let i=d(p);return typeof n=="object"&&(i=l.findByProps("merge").merge(i,n)),r(p.channelId,i),console.log("VIBATE SEND MESSAGE",{msg:i,message:p}),i};const{receiveMessage:r}=l.findByProps("sendMessage","receiveMessage"),{createBotMessage:d}=l.findByProps("createBotMessage"),t=l.findByProps("BOT_AVATARS"),c={abort(p,n){console.log("VIBATE","/vibrate abort - ran");const i={username:"/vibrate abort",avatar:"clyde"},s=new Map(p.map(function(o){return[o.name,o]})),a=s.get("id").value,u=I.findIndex(function(o){return o.id===a});if(console.log("VIBATE",{options:s,vibrationIndex:u,id:a}),u===-1){e({channelId:n.channel.id,embeds:{type:"rich",title:`${g.getFailure()} Invalid vibration ID`.trim,fields:[{value:`${a}`,name:"Vibration ID"}]}},i);return}I[u].aborting=!0,e({channelId:n.channel.id,embeds:[{type:"rich",title:`${g.getLoading()} Aborting vibration\u2026`,fields:[{value:a,name:"Vibration ID"}]}]},i)},begin(p,n){console.log("VIBATE","/vibrate begin - ran");const i={username:"/vibrate begin",avatar:"clyde"};try{const s=new Map(p.map(function(o){return[o.name,o]})),a={duration:s.get("duration").value,repeat:s.get("repeat")?.value,gap:s.get("gap")?.value},u=`for ${a.duration}ms`+(a?.repeat?`, ${a.repeat} time${a.repeat===1?"":"s"}`:"")+(a?.gap?`. With a gap of ${a?.gap}ms.`:"");console.log("VIBATE",{cmdOptions:s,options:a,description:u}),B(a,function(o){console.log("VIBATE","before start"),e({channelId:n.channel.id,embeds:[{type:"rich",title:"<:vibrating:1095354969965731921> Started vibrating",description:u,fields:[{value:`${o.id}`,name:"Vibration ID"}]}]},i),console.log("VIBATE","after start")},function(o){console.log("VIBATE","after finish"),e({channelId:n.channel.id,embeds:[{type:"rich",title:`<:still:1095977283212296194> ${o.aborted?"Abort":"Finish"}ed vibrating`,fields:[{value:`${o.id}`,name:"Vibration ID"}]}]},i),console.log("VIBATE","after after finish")})}catch(s){console.error(s),e({channelId:n.channel.id,content:`\`\`\`
${s.stack}\`\`\``,embeds:[{type:"rich",title:`${g.getFailure()} An error ocurred while running the command`.trim(),description:`Send a screenshot of this error and explain how you came to it, here: ${PLUGINS_FORUM_POST_URL}, to hopefully get this error solved!`}]},i)}}};m.patches.push(b.registerCommand(f({execute:c.begin,type:1,inputType:1,applicationId:"-1",name:"vibrate begin",description:"Begin a brrr",options:[{type:4,required:!0,name:"duration",description:"Duration of one vibration (in milliseconds)",min_value:1,max_value:9999},{type:4,name:"repeat",description:"Number of times to repeat",min_value:1,max_value:9999999},{type:4,name:"gap",description:"Wait between vibrates (only matters if you have more than 1 repeat)"}]}))),m.patches.push(b.registerCommand(f({execute:c.abort,type:1,inputType:1,applicationId:"-1",name:"vibrate abort",description:"Abort a brrr",options:[{type:4,required:!0,name:"id",description:"Vibration id, that you receive when running /vibrate begin"}]})))}catch(e){alert(e.stack)}},h.default=m,Object.defineProperty(h,"__esModule",{value:!0}),h})({});
