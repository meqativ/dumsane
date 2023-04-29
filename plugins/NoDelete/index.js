const {
	plugin: { storage },
} = vendetta;

let delet = {}; 
/*
{
  <id>: {
    arg: <[MessageData]>,
    flag: <1|2>  // 1 = I FUCKING CACHED IT FOR THE FIRST TIME, 2 = DUDE THIS MSG ALREADY CACHED AND DELETED AND MODIFIED
  }
}

*/


const p = console.log;

const plugin = {
	onLoad() {
		this.onUnload = vendetta.patcher.before(
			"dispatch",
			vendetta.metro.common.FluxDispatcher,
			(args) => {
				const [event] = args;
        let message = "This message was deleted";
				if (event.type === "MESSAGE_DELETE") {
          
          // if msg hasnt been cached, literally log SHIT
          if( !delet[event.id] ) {
            args[0] = {
  						type: "MESSAGE_EDIT_FAILED_AUTOMOD",
  						messageData: {
  							type: 1,
  							message: {
  								channelId: event.channelId,
  								messageId: event.id,
  							},
  						},
  						errorResponseBody: {
  							code: 200000,
  							message,
  						},
  					};
            
            delet[event.id] = {
              arg: args,
              flag: 1
            };
            
            return args;
          }
          
          // if msg already cached, check if flag is 1, if so do literally nothing and change flag to 2
          if( delet[event.id] && delet[event.id]['flag'] == 1 ) {
            
            delet[event.id]['flag'] = 2;
            
            // console.log(delet)
            return delet[event.id]["arg"];
          };
          
          // just delet if flag is 2
          if( delet[event.id] && delet[event.id]['flag'] == 2 ) {
						delete delet[event.id], delet;
						return args;
					}
				}
			}
		);
	},
};

export default plugin;
