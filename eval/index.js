(function(exports,commands,metro){"use strict";let unregister;async function evaluate(src){let isAsync=arguments.length>1&&arguments[1]!==void 0?arguments[1]:!1,result,errored;(isAsync||src.includes("await"))&&(src.includes(";")&&(!src.endsWith(";")||src.includes(`
`)||src.split(";").length>2)?src=`(async function() { ${src} })()`:src=`(async function() { return ${src} })()`);let start=new Date().getTime();try{result=eval(src),result instanceof Promise&&(result=await result)}catch(e){result=e,errored=!0}let elapsed=new Date().getTime()-start;return[errored,result,elapsed]}const Clyde=metro.findByProps("createBotMessage"),Channels=metro.findByProps("getLastSelectedChannelId"),Messages=metro.findByProps("sendMessage");function sendReply(e,n){const s=e??Channels?.getChannelId?.(),t=Clyde.createBotMessage({channelId:s,content:""});t.author.username="Vendetta",typeof n=="string"?t.content=n:Object.assign(t,n),Messages.receiveMessage(s,t)}var index={onLoad:function(){unregister=commands.registerCommand({applicationId:"-1",name:"eval",displayName:"eval",description:"Runs code specified. BE CAREFUL! RUNNING UNVERIFIED CODE HERE CAN LEAD TO YOU BEING TOKEN LOGGED!",displayDescription:"Runs code specified. BE CAREFUL! RUNNING UNVERIFIED CODE HERE CAN LEAD TO YOU BEING TOKEN LOGGED!",type:1,inputType:1,options:[{name:"type",displayName:"type",description:"The type of the code to run (regular or asynchronous)",displayDescription:"The type of the code to run (regular or asynchronous)",type:3,required:!0,choices:[{name:"normal",displayName:"normal",value:!1},{name:"async",displayName:"async",value:!0}]},{name:"source",displayName:"source",description:"The source of the code to run",displayDescription:"The source of the code to run",type:3,required:!0}],execute:async function(e,n){const s=e.find(function(r){return r.name=="type"}).value,t=e.find(function(r){return r.name=="source"}).value,[a,o,c]=await evaluate(t,s);sendReply(n.channel.id,[`${a?"Failed executing":"Successfully executed"} in ${c}ms`,`\`\`\`js
${o}
\`\`\``].join(`
`))}})},onUnload:function(){unregister()}};return exports.default=index,Object.defineProperty(exports,"__esModule",{value:!0}),exports})({},vendetta.commands,vendetta.metro);