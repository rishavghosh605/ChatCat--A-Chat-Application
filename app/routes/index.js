 'use strict';
const h=require('../helpers');
const config=require('../config');
const passport=require('passport');
module.exports=()=>{
	let routes={
		'get':{
			'/':(req,res,next)=>{
				res.render('login');
			},
			'/rooms':[h.isAuthenticated,(req,res,next)=>{
				res.render('rooms',{
					user:req.user,
					host:config.host
				});
			}],
			'/chat/:id':[h.isAuthenticated,(req,res,next)=>{
				//A chatroom must be found which has a valid given ID
				//Then the folllowing chatroom is rendered
				let getRoom=h.findRoomById(req.app.locals.chatrooms,req.params.id);
				if(getRoom === undefined){
					return next;
				}
				else{
					res.render('chatroom',{
						user:req.user,
						host:config.host,
						room:getRoom.room,
						roomID:getRoom.roomID
					});
				}
			}],
			'/auth/facebook':passport.authenticate('facebook'),//Ready to use function provided by passport.js--authenticate()
			'/auth/facebook/callback':passport.authenticate('facebook',{
				successRedirect:'/rooms',
				failureRedirect:'/'
			}),//To reach back to our app we build the following ca llback route	
			'/auth/twitter':passport.authenticate('twitter'),//Ready to use function provided by passport.js--authenticate()
			'/auth/twitter/callback':passport.authenticate('twitter',{
				successRedirect:'/rooms',
				failureRedirect:'/'
			}),
			'/logout':(req,res,next)=>{
					req.logout();
					res.redirect('/');
				}
			},
		'post':{

		},
		'NA':(req,res,next)=>{
			res.status(404).sendFile(process.cwd()+"/views/404.htm");
		}
	}



return h.route(routes);
}


