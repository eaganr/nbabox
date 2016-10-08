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
function requestBoxScore(res, gameID, date) {
  var fs = require('fs');
  var request = require('request');  
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
function getBoxScore(res, period, gameID, date, finger) {
  addOne(gameID, finger);
  var j = [];
  if(period > 0) j = getFile("minute", "boxscore", gameID);
  if((j.length === 0 || j["sports_content"]["game"]["id"] == "" ) && (period > 1 || gameID == "")) j = getFile("hour", "boxscore", gameID);
  if((j.length === 0 || j["sports_content"]["game"]["id"] == "" ) && (period > 1 || gameID == "")) j = getFile("day", "boxscore", gameID);

  if(j.length === 0) requestBoxScore(res, gameID, date);
  else res.jsonp(j);
}

//period = minute,hour,day
function getFile(period, filetype, id) {
  var fs = require('fs');
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
  var request = require('request');  
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
      var fs = require('fs');
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
  var fs = require('fs');
  var request = require('request');  
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

//requestBoxScore("0041400406");
//console.log(getFile("minute","0041400406"));

function savePlayerPic(code, res) {
  var fs = require('fs');
  var request = require('request');  
	var url = "http://i.cdn.turner.com/nba/nba/.element/img/2.0/sect/statscube/players/large/"+code+".png"
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

function addOne(gameid,finger) {
  var d = new Date();

  query = 'INSERT INTO pageview (timestamp, gameid, fingerprint) VALUES ("'+d+'","'+gameid+'","'+finger+'");';
  connection.query(query, function(err, rows, fields) {
    if(err) console.log(err);
  });

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

  var dt = year+"-"+month+"-"+day;
  var query = 'SELECT views from views WHERE date="'+dt+'" AND gameid="'+gameid+'";';
  connection.query(query, function(err, rows, fields) {
    if(err) console.log(err);
    if(rows.length) {
      var v = +rows[0]["views"];
      v++;
  
      query = 'UPDATE views SET views='+v+' WHERE date="'+dt+'" AND gameid="'+gameid+'";';
      connection.query(query, function(err, rows, fields) {
        if(err) console.log(err);
      });
    }
    else {
      query = 'INSERT INTO views (date, views, gameid) VALUES ("'+dt+'",1,"'+gameid+'");';
      connection.query(query, function(err, rows, fields) {
        if(err) console.log(err);
      });
    }
  });
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
    if(req.body.func === "getBoxScore") getBoxScore(res,req.body.accur? req.body.accur : 3,req.body.gameID, req.body.date, req.body.finger);
    if(req.body.func === "getPlayByPlay") getPlayByPlay(res,req.body.accur? req.body.accur : 3,req.body.gameID, req.body.date);
    if(req.body.func === "getSchedule") getSchedule(res,req.body.accur? req.body.accur : 3,req.body.date);
    if(req.body.func === "savePlayerPic") savePlayerPic(req.body.code, res); 
  });
}).call(this);

