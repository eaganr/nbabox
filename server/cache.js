
var folder = "/root/nbabox/"

var request = require('request');  

//logging
var fs = require('fs');
var util = require('util');
var log_file = fs.createWriteStream(__dirname + '/server.log', {flags : 'w'});
var log_stdout = process.stdout;

console.log = function(d) { //
  log_file.write(util.format(d) + '\n');
  log_stdout.write(util.format(d) + '\n');
};



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
function requestBoxScore(res, gameID, date) {
  var url = "http://data.nba.com/10s/json/cms/noseason/game/"+date+"/"+gameID+"/boxscore.json";
  request(url, function (error, response, body) {
    if(!error && response.statusCode == 200) {
      var response = JSON.parse(body);
      if(response["sports_content"]["game"]["period_time"]["period_status"].indexOf(" ET") === -1) {
        fs.writeFile(folder+"cache/minute/boxscore/"+gameID+"boxscore"+getTime()+".json", JSON.stringify(response), function(err2) {
          if(err2) console.log(err2);
          console.log("box saved");
        });
      }
      res.jsonp(response);
    }
  });
}

//period = 1 - minute, 2 - hour, 3 - day
function getBoxScore(res, period, gameID, date) {
  addOne(gameID);
  var j = [];
  if(period > 0) j = getFile("minute", "boxscore", gameID);
  if((j.length === 0 || j["sports_content"]["game"]["id"] == "" ) && (period > 1 || gameID == "")) j = getFile("hour", "boxscore", gameID);
  if((j.length === 0 || j["sports_content"]["game"]["id"] == "" ) && (period > 1 || gameID == "")) j = getFile("day", "boxscore", gameID);

  if(j.length === 0) requestBoxScore(res, gameID, date);
  else res.jsonp(j);
}

//period = minute,hour,day
function getFile(period, filetype, id) {
  var j = [];

  if(filetype === "schedule") {
		var dates = id.split("/");
		var yr = dates[2];
		var day = dates[1].length > 1 ? dates[1] : "0"+dates[1];
		var mnth = dates[0].length > 1 ? dates[0] : "0"+dates[0];
		id = yr+mnth+day;
	}

  var gameid = 0;
  var currgame = 0;
  var files = fs.readdirSync(folder+"cache/"+period+"/"+filetype);
  for(var i=0;i<files.length;i++) {
    var f = files[i];
    if(id != "" && f.indexOf(id+filetype) > -1) {
      j = require(folder+"cache/"+period+"/"+filetype+"/"+f);
      break;
    }
    if(id === "") {
      var gid = parseInt(f.substring(0,10));
      if(gid > gameid) {
        gameid = gid;
        currgame = i;
      }
    }
  }
  if(id === "" && files.length > 0) {
    j = require(folder+"cache/"+period+"/"+filetype+"/"+files[currgame]);
  }
  return j;
}


//play by play
function requestPlayByPlay(res, gameID, date, plays, q) {
  var url = "http://data.nba.com/10s/json/cms/noseason/game/"+date+"/"+gameID+"/pbp_"+q+".json";
  request(url, function (error, response, body) {
    if(!error && response.statusCode == 200) {
      var response = JSON.parse(body);
      response = response["sports_content"]["game"]["play"];
      plays = plays.concat(response);
      q++;
      requestPlayByPlay(res, gameID, date, plays, q);
    } 
    if(!body) {
      fs.writeFile(folder+"cache/minute/playbyplay/"+gameID+"playbyplay"+getTime()+".json", JSON.stringify(plays), function(err2) {
        if(err2) console.log(err2);
      });
      res.jsonp(plays);
    }
  });
}


//period = 1 - minute, 2 - hour, 3 - day
function getPlayByPlay(res, period, gameID, date) {
  var j = [];
  if(period > 0) j = getFile("minute", "playbyplay", gameID);
  if(j.length === 0 && period > 1) j = getFile("hour", "playbyplay", gameID);
  if(j.length === 0 && period > 2) j = getFile("day", "playbyplay", gameID);

  if(j.length === 0) requestPlayByPlay(res, gameID, date, [], 1);
  else res.jsonp(j);
}

//schedule
function requestSchedule(res, date) {
	var dates = date.split("/");
	var yr = dates[2];
	var day = dates[1].length > 1 ? dates[1] : "0"+dates[1];
	var mnth = dates[0].length > 1 ? dates[0] : "0"+dates[0];
	date = yr+mnth+day;
  var url = "http://data.nba.com/json/cms/noseason/scoreboard/"+date+"/games.json";
  request(url, function (error, response, body) {
    if(!error && response.statusCode == 200) {
      var response = JSON.parse(body);
      fs.writeFile(folder+"cache/minute/schedule/"+date+"schedule"+getTime()+".json", JSON.stringify(response), function(err2) {
        if(err2) console.log(err2);
      });
      res.jsonp(response);
    }
  });
}

//period = 1 - minute, 2 - hour, 3 - day
function getSchedule(res, period, date) {
  var j = [];
  if(period > 0) j = getFile("minute", "schedule", date);
  if(j.length === 0 && period > 1) j = getFile("hour", "schedule", date);
  if(j.length === 0 && period > 2) j = getFile("day", "schedule", date);

  if(j.length === 0) requestSchedule(res, date);
  else res.jsonp(j);
}

function getVideoURL(gameid, eventid, res) {
  var url = "http://stats.nba.com/stats/videoevents?GameEventID="+eventid+"&GameID="+gameid;
  request(url, function (error, response, body) {
    if(!error && response.statusCode == 200) {
      var response = JSON.parse(body);
      var uid = response["resultSets"]["Meta"]["videoUrls"][0]["uuid"];
      url = "http://www.nba.com/video/wsc/league/"+uid+".xml";
      request(url, function (error, response, body) {
        if(!error && response.statusCode == 200) {
          try {
            res.jsonp([body.split('key="turner_mp4_768x432_1500">')[1].split('</file>')[0]]);
          }
          catch(ex) { console.log(ex) }
        }
      });
    }
  });
}

//requestBoxScore("0041400406");
//console.log(getFile("minute","0041400406"));

function savePlayerPic(code, res) {
  var url = "https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/"+code+".png";
  request.head(url, function(err, res, body){
    request(url).pipe(fs.createWriteStream(folder+"web/img/players/"+code+".png")).on('close', function() {
      //res.send("");

    });
  });

}


//MySQL page views
var mysql = require('mysql');
var settings = require("./settings.js");
var connection = mysql.createConnection(
  {
    host     : settings.host,
    user     : settings.user,
    password : settings.password,
    database : settings.database,
  }
);
connection.connect();

function addOne(gameid) {
  var d = new Date();
  d.setHours(d.getHours());

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
}


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
    res.header("Access-Control-Allow-Origin", "*");
    if(req.body.func === "getBoxScore") getBoxScore(res,req.body.accur? req.body.accur : 3,req.body.gameID, req.body.date);
    if(req.body.func === "getPlayByPlay") getPlayByPlay(res,req.body.accur? req.body.accur : 3,req.body.gameID, req.body.date);
    if(req.body.func === "getSchedule") getSchedule(res,req.body.accur? req.body.accur : 3,req.body.date);
    if(req.body.func === "savePlayerPic") savePlayerPic(req.body.code, res); 
    if(req.body.func === "getVideoURL") getVideoURL(req.body.gameid, req.body.eventid, res); 
  });
}).call(this);

