/*
TODO: 
	- cache for minute, hour, day
	- cron to move/delete old cache files
	- cron to autopull live game data to cache



*/

var folder = "/root/nbabox/"

//time
function getTime() {
	var d = new Date();
	var year = d.getFullYear()+"";

	var month = d.getMonth()+1;
	if(month<10) {
		month = "0"+month;
	}
	else month = month + "";

	var day = d.getDate();
	if(day<10) {
		day = "0"+day;
	}
	else day = day + "";

	var hour = d.getHours();
	if(hour<10) {
		hour = "0"+hour;
	}
	else month = month + "";

	var minute = d.getMinutes();
	if(minute<10) {
		minute = "0"+minute;
	}
	else minute = minute + "";

	var stamp = ""+year+month+day+hour+minute;
	return stamp;
}

function toTime(dateString) {
	var year = parseInt(dateString.substring(0,4));
	var month = parseInt(dateString.substring(4,6))-1;
	var day = parseInt(dateString.substring(6,8));
	var hour = parseInt(dateString.substring(8,10));
	var minute = parseInt(dateString.substring(10,12));
	return new Date(year,month,day,hour,minute);
}

//box score
function requestBoxScore(res, gameID) {
	var nba = require('nba');
	var fs = require('fs');
	nba.api.boxScoreScoring({gameId: gameID}, function (err, response) {
		if(err) console.log(err);
		fs.writeFile(folder+"cache/minute/"+gameID+"boxscore"+getTime()+".json", JSON.stringify(response), function(err2) {
			if(err2) console.log(err2);
			console.log("saved");
			res.jsonp(response);
		});
	});
}

//period = 1 - minute, 2 - hour, 3 - day
function getBoxScore(res, period, gameID) {
	var j = [];
	if(period > 0) j = getFile("minute", gameID);
	if(j.length === 0 && period > 1) j = getFile("hour", gameID);
	if(j.length === 0 && period > 2) j = getFile("day", gameID);

	if(j.length === 0) requestBoxScore(res, gameID);
	else res.jsonp(j);
}

//period = minute,hour,day
function getFile(period, gameID) {
	var fs = require('fs');
	var j = [];
	var files = fs.readdirSync(folder+"cache/"+period);
	for(var i=0;i<files.length;i++) {
		var f = files[i];
		if(f.indexOf(gameID+"boxscore") > -1) {
			j = require(folder+"cache/"+period+"/"+f);
			break;
		}
	}
	return j;
}

//requestBoxScore("0041400406");
//console.log(getFile("minute","0041400406"));

//port listen, communicate with frontend
(function() {
	var express=require('express');
	var app=express();
	var bodyParser = require('body-parser');
	app.use(bodyParser.urlencoded({extended:false}));	

	var server=app.listen(3000,function(){
		console.log("We have started our server on port 3000");
	});

  app.post('/',function(req,res){
		console.log(req.body);
		var gameID = req.body.gameID;
		res.header("Access-Control-Allow-Origin", "*");
		var box = getBoxScore(res,3,gameID);
	});
}).call(this);

