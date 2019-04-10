'use strict';
const h=require('../helpers');
module.exports=(io,app)=>{
	let allrooms=app.locals.chatrooms; 
	
	//Pipeline basically a namespace for the rooms page
	io.of('/roomslist').on('connection',socket=>{
		socket.on('getChatrooms',()=>{
			socket.emit('chatRoomsList',JSON.stringify(allrooms));
		});
		socket.on('createNewRoom',newRoomInput=>{
			console.log("New room is created");
			//Check to see if a room with the same title exists or not if not create  one and broadcast it to everyone
			if(!h.findRoomsByName(allrooms,newRoomInput)){
				//A new room is created and broadcasted
				allrooms.push({
					room:newRoomInput,
					roomID:h.randomHex(),
					users:[]
				});
				console.log(allrooms);
				//Broadcasting only to creator
				socket.emit('chatRoomsList',JSON.stringify(allrooms));
				//To emit or broadcast the updated list to every user connected to the roos page
				socket.broadcast.emit('chatRoomsList',JSON.stringify(allrooms));
			}
		});
	});

	//Pipeline basically a namespace for the chatroom
	io.of('/chatter').on('connection',socket=>{
		//To recieve the join event
		socket.on('join',data=>{
			console.log("user wants to join");
			let usersList=h.addUserToRoom(allrooms,data,socket);

			if(usersList!== undefined)
			{
				//Update the list of all active users as shown on the chatroom page
				socket.broadcast.to(data.roomID).emit('updateUsersList',JSON.stringify(usersList.users));
				socket.emit('updateUsersList',JSON.stringify(usersList.users));
				console.log(usersList);		
				console.log("allrooms",allrooms)	
			}
		});


		
		//When a socket exits
		socket.on('disconnect',()=>{
			//Find the room to which the socket is connected to and purge the user
			let room =h.removeUserFromRoom(allrooms,socket);
			if(room!== undefined){ 
			socket.broadcast.to(room.roomID).emit('updateUsersList',JSON.stringify(room.users));
			}
		});
		//When a new message arrives
		socket.on('newMessage',data=>{
			socket.broadcast.to(data.roomID).emit('inMessage',JSON.stringify(data));
		});

	});

}