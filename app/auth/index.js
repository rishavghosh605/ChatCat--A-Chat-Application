'use strict';
const passport=require('passport');
const config=require('../config');
const h=require('../helpers');
const FacebookStrategy=require('passport-facebook').Strategy;
const TwitterStrategy=require('passport-twitter').Strategy;
module.exports=()=>{
	passport.serializeUser((user,done)=>{//WE use this method to create a user session throughout the various routes 
		done(null,user.id);//The serializeUser function is innvoked when the authorization process ends,so when we run the done method in authProcessor 
		//passport runs this serializeUser function and passesss the user data and createz a session and only stores the userid ,this is the unique key given by mongodb
		passport.deserializeUser((id,done)=>{
			//Find and fetch data from our mongodb collection
			h.findById(id)
				.then(user=>done(null,user))
				.catch(error=>console.log("Error when deserializing the user"));	
		});//whenever a request for that data is recieved passport runs the deserialize method
		//The above function completes the sgin in process for facebook
	});
	let authProcessor=(accessToken,refreshToken,profile,done)=>{
		//Find a user in the local db using  profile id
	 	h.findOne(profile.id)
	 		.then(result=>{//we are chaining the then method
	 			if(result){
	 				done(null,result);//Basically we do not use any callback like error or anything and thus we use null as an argument to ot use the done method as a callback function
	 			}//Invoking the done method gets it out of the authentication pipeline and into passport so it can offer it to the app for consumption
	 			else{
	 				//Create a new user and return 
	 				h.createNewUser(profile)
	 				  .then(newChatUser => done(null,newChatUser))
	 				  .catch(error=>console.log("Error when creating a new user"));//If there are errors the promise will be rejected in which case the error will be catched	
	 			}
	 		});
		//if the user is found, return the user data using the done()
		// if the user is not found,create one in the  local db  and return
		 
	}
	passport.use(new FacebookStrategy(config.fb,authProcessor));
	passport.use(new TwitterStrategy(config.twitter,authProcessor))
}