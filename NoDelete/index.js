(function(p,n,o,$,T,l,I,D,U,A,m,R,N,y){"use strict";function g(e,s,u,t){let a=Math.abs(e);return a%=100,a>=5&&a<=20?t:(a%=10,a===1?s:a>=2&&a<=4?u:t)}function v(e,s,u){return e===1?s:u}let E={};E={settings:{titles:{settings:{"en-GB":"Settings",uk:"\u041D\u0430\u043B\u0430\u0448\u0442\u0443\u0432\u0430\u043D\u043D\u044F",ru:"\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438"},filters:{"en-GB":"Filters",uk:"\u0424\u0456\u043B\u044C\u0442\u0440\u0438",ru:"\u0424\u0438\u043B\u044C\u0442\u0440\u044B"}},showTimestamps:{"en-GB":"Show the time of deletion",uk:"\u041F\u043E\u043A\u0430\u0437\u0443\u0432\u0430\u0442\u0438 \u0447\u0430\u0441 \u0432\u0438\u0434\u0430\u043B\u0435\u043D\u043D\u044F",ru:"\u041F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u0442\u044C \u0432\u0440\u0435\u043C\u044F \u0443\u0434\u0430\u043B\u0435\u043D\u0438\u044F"},ewTimestampFormat:{"en-GB":"Use 12-hour format",uk:"\u0412\u0438\u043A\u043E\u0440\u0438\u0441\u0442\u043E\u0432\u0443\u0432\u0430\u0442\u0438 12-\u0433\u043E\u0434\u0438\u043D\u043D\u0438\u0439 \u0444\u043E\u0440\u043C\u0430\u0442",ru:"\u0418\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u044C 12-\u0447\u0430\u0441\u043E\u0432\u043E\u0439 \u0444\u043E\u0440\u043C\u0430\u0442"},youDeletedItWarning:{"en-GB":"The messages YOU deleted - are not saved",uk:"\u041F\u043E\u0432\u0456\u0434\u043E\u043C\u043B\u0435\u043D\u043D\u044F \u044F\u043A\u0456 \u0432\u0438\u0434\u0430\u043B\u0438\u043B\u0438 \u0412\u0418 - \u043D\u0435 \u0437\u0431\u0435\u0440\u0456\u0433\u0430\u044E\u0442\u0441\u044F",ru:"\u0421\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u044F \u0443\u0434\u0430\u043B\u0435\u043D\u043D\u044B\u0435 \u0412\u0410\u041C\u0418 - \u043D\u0435 \u0441\u043E\u0445\u0440\u0430\u043D\u044F\u044E\u0442\u0441\u044F"},addUsersInfo:{"en-GB":function(){return`To add or remove users from the ignore list, follow these steps:
1. open their profile
2. press the \u2022\u2022\u2022
3. press "${E.optionLabels[0]["en-GB"]}"
4. \u{1F389}`},uk:function(){return`\u0429\u043E\u0431 \u0434\u043E\u0431\u0430\u0432\u0438\u0442\u0438 \u043A\u043E\u0433\u043E\u0441\u044C \u0434\u043E \u0441\u043F\u0438\u0441\u043A\u0443 \u0456\u0433\u043D\u043E\u0440\u043E\u0432\u0430\u043D\u0438\u0445 \u043A\u043E\u0440\u0438\u0441\u0442\u0443\u0432\u0430\u0447\u0456\u0432, \u0432\u0438\u043A\u043E\u043D\u0430\u0439\u0442\u0435 \u0446\u0456 \u0434\u0456\u0457:
1. \u0432\u0456\u0434\u043A\u0440\u0438\u0442\u0435 \u0457\u0445 \u043F\u0440\u043E\u0444\u0456\u043B\u044C
2. \u043D\u0430\u0442\u0438\u0441\u043D\u0456\u0442\u044C \u2022\u2022\u2022
3. \u043D\u0430\u0442\u0438\u0441\u043D\u0456\u0442\u044C "${E.optionLabels[0].uk}"
4. \u{1F389}`},ru:function(){return`\u0427\u0442\u043E\u0431\u044B \u0434\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u043A\u043E\u0433\u043E-\u0442\u043E \u0432 \u0441\u043F\u0438\u0441\u043E\u043A \u0438\u0433\u043D\u043E\u0440\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0445 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u0435\u0439 - \u0441\u043B\u0435\u0434\u0443\u0439\u0442\u0435 \u044D\u0442\u0438\u043C \u0448\u0430\u0433\u0430\u043C
1. \u043E\u0442\u043A\u0440\u043E\u0439\u0442\u0435 \u0438\u0445 \u043F\u0440\u043E\u0444\u0438\u043B\u044C
2. \u043D\u0430\u0436\u043C\u0438\u0442\u0435 \u2022\u2022\u2022
3. \u043D\u0430\u0436\u043C\u0438\u0442\u0435 "${E.optionLabels[0].ru}"
4. \u{1F389}`}},ignoreBots:{"en-GB":"Ignore bots",uk:"\u0406\u0433\u043D\u043E\u0440\u0443\u0432\u0430\u0442\u0438 \u0431\u043E\u0442\u0456\u0432",ru:"\u0418\u0433\u043D\u043E\u0440\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0431\u043E\u0442\u043E\u0432"},clearUsersLabel:{"en-GB":function(e){return`You have ${e} user${v(e,"","s")} in the ignored users list`},uk:function(e){return`\u0412\u0438 \u043C\u0430\u0454\u0442\u0435 ${e} \u043A\u043E\u0440\u0438\u0441\u0442\u0443\u0432\u0430\u0447${g(e,"\u0430","\u0430","\u0456\u0432")} \u0443 \u0441\u043F\u0438\u0441\u043A\u0443 \u0456\u0433\u043D\u043E\u0440\u043E\u0432\u0430\u043D\u0438\u0445 \u043A\u043E\u0440\u0438\u0441\u0442\u0443\u0432\u0430\u0447\u0456\u0432`},ru:function(e){return`\u0412\u044B \u0438\u043C\u0435\u0435\u0442\u0435 ${e} \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B${g(e,"\u044F","\u044F","\u0435\u0439")} \u0432 \u0441\u043F\u0438\u0441\u043A\u0435 \u0438\u0433\u043D\u043E\u0440\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0445 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u0435\u0439`}},confirmClear:{title:{"en-GB":"Hold on!",uk:"\u041F\u043E\u0447\u0435\u043A\u0430\u0439-\u043D\u043E!",ru:"\u041F\u043E\u043B\u043E\u0436\u0434\u0438-\u043A\u0430!"},description:{"en-GB":function(e){return`This will remove ${e} user${v(e,"","s")} from the ignored users list.
Do you you really want to do that?`},uk:function(e){return`\u0426\u0435 \u043F\u0440\u0438\u0431\u0435\u0440\u0435 ${e} \u043A\u043E\u0440\u0438\u0441\u0442\u0443\u0432\u0430\u0447${g(e,"\u0430","\u0430","\u0456\u0432")} \u0437\u0456 \u0441\u043F\u0438\u0441\u043A\u0443 \u0456\u0433\u043D\u043E\u0440\u043E\u0432\u0430\u043D\u0438\u0445 \u043A\u043E\u0440\u0438\u0441\u0442\u0443\u0432\u0430\u0447\u0456\u0432.
\u0412\u0438 \u0434\u0456\u0439\u0441\u043D\u043E \u0445\u043E\u0447\u0435\u0442\u0435 \u043F\u0440\u043E\u0434\u043E\u0432\u0436\u0438\u0442\u0438?`},ru:function(e){return`\u042D\u0442\u043E \u0443\u0431\u0435\u0440\u0435\u0442 ${e} \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B${g(e,"\u044F","\u044F","\u0435\u0439")} \u0438\u0437 \u0441\u043F\u0438\u0441\u043A\u0430 \u0438\u0433\u043D\u043E\u0440\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0445 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u0435\u0439.
\u0412\u044B \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0442\u0435\u043B\u044C\u043D\u043E \u0445\u043E\u0442\u0438\u0442\u0435 \u043F\u0440\u043E\u0434\u043E\u043B\u0436\u0438\u0442\u044C?`}},yes:{"en-GB":"Yes",uk:"\u0422\u0430\u043A",ru:"\u0414\u0430"},no:{"en-GB":"Cancel",uk:"\u0412\u0456\u0434\u043C\u0438\u043D\u0438\u0442\u0438",ru:"\u041E\u0442\u043C\u0435\u043D\u0438\u0442\u044C"}},removeUserButton:{"en-GB":"REMOVE",uk:"\u041F\u0420\u0418\u0411\u0420\u0410\u0422\u0418",ru:"\u0423\u0411\u0420\u0410\u0422\u042C"}},optionLabels:[{"en-GB":"Add to NoDelete ignored users list",uk:"\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u0438 \u0434\u043E \u0441\u043F\u0438\u0441\u043A\u0443 \u0456\u0433\u043D\u043E\u0440\u043E\u0432\u0430\u043D\u0438\u0445 \u043A\u043E\u0440\u0438\u0441\u0442\u0443\u0432\u0430\u0447\u0456\u0432 \u0443 NoDelete",ru:"\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u0432 \u0441\u043F\u0438\u0441\u043E\u043A \u0438\u0433\u043D\u043E\u0440\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0445 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u0435\u0439 \u0432 NoDelete"},{"en-GB":"Remove from the NoDelete ignore list",uk:"\u041F\u0440\u0438\u0431\u0440\u0430\u0442\u0438 \u0437 \u0441\u043F\u0438\u0441\u043A\u0443 \u0456\u0433\u043D\u043E\u0440\u043E\u0432\u0430\u043D\u0438\u0445 \u043A\u043E\u0440\u0438\u0441\u0442\u0443\u0432\u0430\u0447\u0456\u0432 \u0443 NoDelete",ru:"\u0423\u0431\u0440\u0430\u0442\u044C \u0438\u0437 \u0441\u043F\u0438\u0441\u043A\u0430 \u0438\u0433\u043D\u043E\u0440\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0445 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u0435\u0439 \u0432 NoDelete"}],toastLabels:[{"en-GB":"Added ${user} to the ignored users list",uk:"${user} \u0434\u043E\u0431\u0430\u0432\u043B\u0435\u043D\u043E \u0434\u043E \u0441\u043F\u0438\u0441\u043A\u0443 \u0456\u0433\u043D\u043E\u0440\u043E\u0432\u0430\u043D\u0438\u0445 \u043A\u043E\u0440\u0438\u0441\u0442\u0443\u0432\u0430\u0447\u0456\u0432",ru:"${user} \u0434\u043E\u0431\u0430\u0432\u043B\u0435\u043D\u044B \u0432 \u0441\u043F\u0438\u0441\u043E\u043A \u0438\u0433\u043D\u043E\u0440\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0445 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u0435\u0439"},{"en-GB":"Removed ${user} from the ignored users list",uk:"${user} \u043F\u0440\u0438\u0431\u0440\u0430\u043D\u043E \u0437\u0456 \u0441\u043F\u0438\u0441\u043A\u0443 \u0456\u0433\u043D\u043E\u0440\u043E\u0432\u0430\u043D\u0438\u0445 \u043A\u043E\u0440\u0438\u0441\u0442\u0443\u0432\u0430\u0447\u0456\u0432",ru:"${user} \u0443\u0431\u0440\u0430\u043D\u044B \u0438\u0437 \u0441\u043F\u0438\u0441\u043A\u0430 \u0438\u0433\u043D\u043E\u0440\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0445 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u0435\u0439"}],thisMessageWasDeleted:{"en-GB":"This message was deleted",uk:"\u0426\u0435 \u043F\u043E\u0432\u0456\u0434\u043E\u043C\u043B\u0435\u043D\u043D\u044F \u0431\u0443\u043B\u043E \u0432\u0438\u0434\u0430\u043B\u0435\u043D\u043E",ru:"\u042D\u0442\u043E \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435 \u0431\u044B\u043B\u043E \u0443\u0434\u0430\u043B\u0435\u043D\u043E"}};const P=function(){return vendetta.metro.findByStoreName("LocaleStore").locale},L="en-GB";function i(e,s){let u=E;for(const a of e.split("."))u?.hasOwnProperty(a)?u=u[a]:u=E;if(u===E)return e;let t=u[P()]??u[L]??e;return typeof t=="function"&&!s&&(t=t()),s?{make:t}:t}const F=U.createThemedStyleSheet({container:{flexDirection:"row",alignItems:"center"},image:{marginLeft:5,marginRight:5,width:25,height:25,borderRadius:100},label:{color:A.semanticColors.HEADER_PRIMARY},labelRemove:{color:A.semanticColors.TEXT_WARNING}});function G(e){let{imageSource:s,onImagePress:u,label:t,labelRemove:a="REMOVE",onRemove:d}=e;return React.createElement(React.Fragment,null,React.createElement(D.View,{style:F.container},React.createElement(D.TouchableOpacity,{onPress:d},React.createElement(D.Text,{style:F.labelRemove},a)),React.createElement(D.TouchableOpacity,{onPress:u},React.createElement(D.Image,{style:[F.image],source:s})),React.createElement(D.Text,{style:F.label},t)))}let C,w,k;function O(e){C??=m.findByStoreName("UserStore"),w??=m.findByProps("fetchProfile","getUser","setFlag"),k??=m.findByProps("showUserProfile");async function s(r){const c=k.showUserProfile;C.getUser(r)?c({userId:r}):w.getUser(r).then(function(f){let{id:M}=f;return c({userId:M})})}$.useProxy(o.storage);const[u,t]=n.React.useState(o.storage.ignore.users),a=function(r){const c=u.filter(function(f){return f!==r});o.storage.ignore.users=c,t(c)},d=function(){o.storage.ignore.users=[],t([])};let h=0;return n.React.createElement(n.ReactNative.ScrollView,{style:{flex:1}},n.React.createElement(l.Forms.FormSection,{title:i("settings.titles.settings"),titleStyleType:"no_border"},n.React.createElement(l.Forms.FormRow,{label:i("settings.showTimestamps"),trailing:n.React.createElement(l.Forms.FormSwitch,{value:o.storage.timestamps,onValueChange:function(r){return o.storage.timestamps=r}})}),n.React.createElement(l.Forms.FormRow,{label:i("settings.ewTimestampFormat"),trailing:n.React.createElement(l.Forms.FormSwitch,{value:o.storage.ew,onValueChange:function(r){return o.storage.ew=r}})}),n.React.createElement(l.Forms.FormDivider,null),n.React.createElement(l.Forms.FormRow,{label:i("settings.youDeletedItWarning")})),n.React.createElement(l.Forms.FormSection,{title:i("settings.titles.filters")},n.React.createElement(l.Forms.FormRow,{label:i("settings.ignoreBots"),trailing:n.React.createElement(l.Forms.FormSwitch,{value:o.storage.ignore.bots,onValueChange:function(r){return o.storage.ignore.bots=r}})}),n.React.createElement(l.Forms.FormRow,{label:i("settings.clearUsersLabel",!0)?.make?.(u.length),trailing:n.React.createElement(l.Forms.FormRow.Icon,{source:I.getAssetIDByName("ic_trash_24px")}),onPress:function(){u.length!==0&&T.showConfirmationAlert({title:i("settings.confirmClear.title"),content:i("settings.confirmClear.description",!0)?.make?.(u.length),confirmText:i("settings.confirmClear.yes"),cancelText:i("settings.confirmClear.no"),confirmColor:"brand",onConfirm:d})}}),n.React.createElement(n.ReactNative.ScrollView,{style:{flex:1,marginLeft:15}},u.map(function(r){const c=C.getUser(r)??{};let f=c?.getAvatarURL?.(null,26)?.replace?.(/\.(gif|webp)/,".png");return f||(f="https://cdn.discordapp.com/embed/avatars/1.png?size=48",c.username=`${r} Uncached`,c.discriminator="0",h===0&&(c.username+=", press the avatar"),h++),n.React.createElement(G,{imageSource:{uri:f},onImagePress:function(){s(r)},onRemove:function(){return a(r)},label:c.username+(c.discriminator==0?"":`#${c.discriminator}`),labelRemove:i("settings.removeUserButton")})})),n.React.createElement(l.Forms.FormDivider,null),n.React.createElement(l.Forms.FormRow,{label:i("settings.addUsersInfo")})))}function S(e,s){if(e===void 0)throw new Error("No object passed to make defaults for");if(s===void 0)throw new Error("No defaults object passed to make defaults off of");for(const u of Object.keys(s))typeof s[u]=="object"&&!Array.isArray(s[u])?(typeof e[u]!="object"&&(e[u]={}),S(e[u],s[u])):e[u]??=s[u]}S(o.storage,{ignore:{users:[],channels:[],bots:!1},timestamps:!1,ew:!1,onlyTimestamps:!1});let b,B=[];var _={settings:O,patches:[],onUnload(){this.patches.forEach(function(e){return e()}),this.patches=[]},onLoad(){try{this.patches.push(R.before("dispatch",n.FluxDispatcher,function(s){try{b||(b=m.findByStoreName("MessageStore"));const u=s[0];if(!u||u?.type!=="MESSAGE_DELETE"||!u?.id||!u?.channelId)return;const t=b.getMessage(u.channelId,u.id);if(o.storage.ignore.users.includes(t?.author?.id)||o.storage.ignore.bots&&t?.author?.bot)return;if(B.includes(u.id))return B.splice(B.indexOf(u.id),1),s;B.push(u.id);let a=i("thisMessageWasDeleted");return o.storage.timestamps&&(a+=` (${n.moment().format(o.storage.ew?"hh:mm:ss.SS a":"HH:mm:ss.SS")})`),s[0]={type:"MESSAGE_EDIT_FAILED_AUTOMOD",messageData:{type:1,message:{channelId:u.channelId,messageId:u.id}},errorResponseBody:{code:2e5,message:a}},s}catch(u){console.error(u),alert(`[Nodelete \u2192 dispatcher patch] died
`+u.stack)}}));const e=R.before("render",m.findByProps("ScrollView").View,function(s){try{let u=N.findInReactTree(s,function(r){return r.key===".$UserProfileOverflow"});if(!u||!u.props||u.props.sheetKey!=="UserProfileOverflow")return;const t=u.props.content.props,a=E.optionLabels.map(Object.values).flat();if(t.options.some(function(r){return a.includes(r?.label)}))return;const d=Object.keys(u._owner.stateNode._keyChildMapping).find(function(r){return u._owner.stateNode._keyChildMapping[r]&&r.match(/(?<=\$UserProfile)\d+/)})?.slice?.(13);let h=t.options.findLastIndex(function(r){return r.isDestructive});o.storage.ignore.users.includes(d)?t.options.splice(h+1,0,{label:i("optionLabels.1"),onPress:function(){o.storage.ignore.users.splice(o.storage.ignore.users.findIndex(function(r){return r===d}),1),y.showToast(i("toastLabels.1").replaceAll("${user}",t.header.title)),t.hideActionSheet()}}):t.options.splice(h+1,0,{isDestructive:!0,label:i("optionLabels.0"),onPress:function(){o.storage.ignore.users.push(d),y.showToast(i("toastLabels.0").replaceAll("${user}",t.header.title)),t.hideActionSheet()}})}catch(u){console.error(u);let t=!1;try{t=e()}catch{t=!1}alert(`[NoDelete \u2192 context menu patch] failed. Patch ${t?"dis":"en"}abled
`+u.stack)}});this.patches.push(e)}catch(e){console.error(e),alert(`[NoDelete] dead
`+e.stack)}}};return p.default=_,Object.defineProperty(p,"__esModule",{value:!0}),p})({},vendetta.metro.common,vendetta.plugin,vendetta.storage,vendetta.ui.alerts,vendetta.ui.components,vendetta.ui.assets,vendetta.ui.components.General,vendetta.metro.common.stylesheet,vendetta.ui,vendetta.metro,vendetta.patcher,vendetta.utils,vendetta.ui.toasts);
