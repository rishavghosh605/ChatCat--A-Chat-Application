'use strict';
if(process.env.NODE_ENV==="production"){
	//Offer production stage environment variables
	//When the app is deployed on heroku and we provision a redis store you will not be given the hostname password and port keys seperatelyinstead they will be made
	//available through an env variable called: process.env.REDIS_URL:: 
	let redisURI=require('url').parse(process.env.REDIS_URL);
	let redisPassword=redisURI.auth.split(':')[1];//redisURI.auth givrs us access to the password string whose second part is required that is after the ":" symbol so we split th estring into two elements and select the second one
	module.exports={
		host:process.env.host||"",
		dbURI:process.env.dbURI,
		sessionSecret:process.env.sessionSecret,
		fb:{
		clientID:process.env.fbClientID,
		clientSecret:process.env.fbClientSecret,
		callbackURL:process.env.host+"/auth/facebook/callback",
		profileFields:["id","displayName","photos"]
		},
		twitter:{
			consumerKey:process.env.twConsumerKey,
			consumerSecret:process.env,twConsumerSecret,
			callbackURL:process.env.host+"/auth/twitter/callback",
			profileFields:["id","displayName","photos"]
		},
		redis:{
			host:redisURI.hostname,
			port:redisURI.port,
			password:redisPassword
		}
	}
}
else
{
	//Offer development stage environment variables
	module.exports=require('./development.json');

}