'use strict';

const config = require('./config');
const redis=require('redis').createClient;//This  ethod will let us create an instance of the client interface  
const adapter=require('socket.io-redis');
// Social Authentication Logic
require('./auth')();

//Create  an IO server instance 
let ioServer=app=>{
	app.locals.chatrooms=[];
	const server=require('http').Server(app);
	const io=require('socket.io')(server);
	//We will force socket.io to use websockets using a two step process 
	//First Step 
	io.set('transports',['websocket']); 
	//we want socket.io to snd and recieve its buffer from redis
	//for sending or publishing first a client interface is instantiated  , it is called pubClient
	let pubCLient=redis(config.redis.port,config.redis.host,{
		auth_pass:config.redis.password
	});
	//Used to subscribe or get data back from redis, we used two seperate interfaces because the redis driver that we are using does not accept a password by default so if we are going to perform authentication in production ,create two seperate  interfaces where the create client method provides 
	//us  a way to use password using auth_pass property
	let subClient=redis(config.redis.port,config.redis.host,{
		return_buffers :true,//the return_buffers is required as redis will return data in a string but we need data in its original buffer state and thus we set it to true
		auth_pass:config.redis.password
	});
	//for interfacing redis with socket.io  use the io.adapter metho to use a custom socet.io adapter
	io.adapter(adapter({
		pubCLient,
		subClient
	}));	
 	io.use((socket,next)=>{
		require('./session')(socket.request,{},next);
	});
	require('./socket')(io,app);
	return server;
}
module.exports={
	router:require('./routes')(),
	session:require('./session'),
	ioServer
}