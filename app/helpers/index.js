'use strict';
const router=require('express').Router();
const db=require('../db');
const crypto=require('crypto');

// Iterate through the routes object and mount the routes
let _registerRoutes=(routes,method)=>{
	for(let key in routes){
		if(typeof routes[key]==='object' && routes[key]!== null && !(routes[key] instanceof Array)){
			_registerRoutes(routes[key],key);
	}else{
		//Register thw routes
		if(method==='get'){
			router.get(key,routes[key]);
		}else if(method==='post'){
			router.post(key,routes[key]);
		}
		else
		{
			router.use(routes[key]);
		}
	}

   }
}
let route=routes=>{
	_registerRoutes(routes);
	return router;
}
//Find a single user based on a key 	
//FindOne finds exactly one record
//Some methods like the one below are equipped to return promises
let findOne=profileID=>{
	return  db.userModel.findOne({
		'profileId':profileID
	});
}
//Method used to create a new function createnewUser that accepts a profile object and returns A NEW PROMISE
let createNewUser=profile=>{
	return new Promise((resolve,reject)=>{
		//Set values to the new instance of the model created-chatUser
		let newChatUser=new db.userModel({
			profileId:profile.id,
			fullName:profile.displayName,
			profilePic:profile.photos[0].value || ''//If profile pic not available we save it as blank
		});
		//Save the nuilt document
		newChatUser.save(error=>{
			if(error){
				console.log('Create New User Error');
				reject(error);//We reject the promise
			}else{
				resolve(newChatUser);//We resolve the promise and return the instance to the new chat user
			}
		});
	});
}

//the ES6 promisified version of findById
let findById=id=>{
	return new Promise((resolve,reject)=>{
		db.userModel.findById(id,(error,user)=>{
			if(error){
				reject(error);
			}
			else{
				resolve(user);
			}
		});
			
	});
}

//A middleware that checks to see if the user is authenticated & logged in 
let isAuthenticated=(req,res,next)=>{
	if(req.isAuthenticated())//This req.isAuthenticated method is provided by passport itself to check in the credentials of a user
	{
		next();
	}
	else{
		res.redirect('/');
	}
}

let findRoomsByName=(allrooms,room)=>{
	let findRoom=allrooms.findIndex((element,index,array)=>{
		if(element.room===room){
			return true;
		}
		else
		{
			return false;
		}
	});
	return findRoom>-1?true:false
}

let randomHex=()=>{
	return crypto.randomBytes(24).toString('hex');
}

//To find a chatroom with a given ID
let findRoomById=(allrooms,roomID)=>{
	return allrooms.find((element,index,array)=>{
		if(element.roomID===roomID){
			return true;
		}
		else{
			return false;
		}
	});
}

//Add user to a chatroom
let addUserToRoom=(allrooms,data,socket)=>{
	//Get the room object
	let getRoom=findRoomById(allrooms,data.roomID);
	if(getRoom!== undefined){

		//Get the  active user's ID(ObjectID as used in session)
		
		var userdata=Object.values(socket.request.sessionStore['sessions']);
		console.log("userdata",userdata);
		let userID=JSON.parse(userdata[userdata.length-1]).passport.user;
		//Check to see if the user already exists in the chatroom
		let checkUser=getRoom.users.findIndex((element,index,array)=>{
			if(element.userID===userID){
				return true;
			}
			else{
				return false;
			}
		});
		//If the user is already present in the room,remove him first
		if(checkUser>-1){
			getRoom.users.splice(checkUser,1);
		}

		//Push the user into the room's user array
		getRoom.users.push({
			socketID:socket.id,
			userID,
			user:data.user,
			userPic:data.userPic
		}); 

		//Join the room channel
		socket.join(data.roomID);
		//Return the updated room object
		return getRoom;
	}
}

// To find and purge when the socket disconnects
let removeUserFromRoom=(allrooms,socket)=>{
	for(let room of allrooms){
		//Find the user 
		//Writing array with find Index is not required generally element suffices
		let findUser=room.users.findIndex((element,index,array)=>{
			if(element.socketID===socket.id)
			{
				return true;
			}
			else
			{
				return false;
			}
			//return element.socketID===socket.id? true :false
		});

		if(findUser>-1){
			socket.leave(room.roomID);
			room.users.splice(findUser,1);

			return room;
		}
	}
}
module.exports={
	route,
	findOne,
	createNewUser,
	findById,
	isAuthenticated,
	findRoomsByName,
	randomHex,
	findRoomById,
	addUserToRoom,
	removeUserFromRoom

}