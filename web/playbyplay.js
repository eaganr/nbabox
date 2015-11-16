function playbyplay() {  
  var self = this;

  var totalperiods = 4;
  
  self.selector=function(s) {
    if(s) {
      self.selector.val=s;
      return self;
    }
    return self.selector.val;
  }
  
	var hometeam;
	var awayteam;
	
  self.homeplayers=function(h) {
    if(h) {
      for(var k in h) {
				if(!hometeam) hometeam = h[k]["team"];
        h[k] = {player_code:h[k]["player_code"], on_court:h[k]["on_court"], team:h[k]["team"], pts:[], miss:[], ast:[], rebs:[], stls:[], tos:[], blks:[], fls:[], mins:[]};
      }
      self.homeplayers.val=h;
      return self;
    }
    return self.homeplayers.val ? self.homeplayers.val : [];
  }  

 	self.homelineups=[];
  self.awaylineups=[];
  self.currenthomelineup = {players:[], start:null, end:null};
  self.currentawaylineup = {players:[], start:null, end:null};

	function addtocurrent(playername, player, team, specific) {
		var lineup = specific;
		if(specific === undefined) {
			if(hometeam === team) lineup = self.currenthomelineup;
			if(awayteam === team) lineup = self.currentawaylineup;
		}

		var found = false;
		for(var i=0;i<lineup["players"].length;i++) {
			if(lineup["players"][i]["player_code"] === player["player_code"]) found = true;
		}
		if(!found && lineup["players"].length < 5) {
			player["playername"] = playername;
			lineup["players"].push(player);
		}
	}


	function changelineup(playerin, playerout, team, evt) {
		//home
		if(hometeam === team || team === "both") {
			var nextlineup = JSON.parse(JSON.stringify(self.currenthomelineup));
			var scorediff =  parseInt(evt["visitor_score"]) - parseInt(evt["home_score"]);
			self.currenthomelineup["end"] = evt;
			nextlineup["start"] = evt;
			self.homelineups.push(JSON.parse(JSON.stringify(self.currenthomelineup)));
			
			if(playerin && playerout) {
				for(var i=0;i<nextlineup["players"].length;i++) {
					if(nextlineup["players"][i]["player_code"] === playerout["player_code"]) {
						nextlineup["players"].splice(i, 1);
						break;
					}
				}
				nextlineup["players"].push(playerin);
			}
			else {
				nextlineup["players"] = [];
			}
			self.currenthomelineup = nextlineup; 
		}
		//away
		if(awayteam === team || team === "both") {
			var nextlineup = JSON.parse(JSON.stringify(self.currentawaylineup));
			var scorediff =  parseInt(evt["home_score"]) - parseInt(evt["visitor_score"]);
			self.currentawaylineup["end"] = evt;
			nextlineup["start"] = evt;
			self.awaylineups.push(JSON.parse(JSON.stringify(self.currentawaylineup)));
			
			if(playerin && playerout) {
				for(var i=0;i<nextlineup["players"].length;i++) {
					if(nextlineup["players"][i]["player_code"] === playerout["player_code"]) {
						nextlineup["players"].splice(i, 1);
						break;
					}
				}
				nextlineup["players"].push(playerin);
			}
			else {
				nextlineup["players"] = [];
			}
			self.currentawaylineup = nextlineup; 
		}
	}

	function combinelineups() {
		var lineups = [self.homelineups, self.awaylineups];
		for(var a=0;a<lineups.length;a++) {
			var lineup = lineups[a];
			var templineup = [];
			for(var i=0;i<lineup.length;i++) {
				var notzero = false;
				while(!notzero) {
					if("description" in lineup[i]["end"] && lineup[i]["end"]["description"].indexOf("Start Period") > -1) lineup[i]["end"]["clock"] = "12:00"; 
					if("description" in lineup[i]["start"] && lineup[i]["start"]["description"].indexOf("Start Period") > -1) lineup[i]["start"]["clock"] = "12:00"; 
					var secs = timetoseconds(lineup[i]["end"]["period"], lineup[i]["end"]["clock"]) - timetoseconds(lineup[i]["start"]["period"], lineup[i]["start"]["clock"]);
					if(secs != 0) notzero = true;
					else i++;
				}

				var players1 = lineup[i]["players"];

				var found = false;
				for(var j=0;j<templineup.length;j++) {
					var players2 = templineup[j]["players"];
					var match = 0;
					for(var n=0;n<players1.length;n++) {
						for(var p=0;p<players2.length;p++) {
							if(players1[n]["playername"] === players2[p]["playername"]) match++;
						}
					}	
					if(match === 5) {
						found = true;
						var diff = (lineup[i]["end"]["home_score"]-lineup[i]["end"]["visitor_score"])-(lineup[i]["start"]["home_score"]-lineup[i]["start"]["visitor_score"]);
						if(a === 1) diff = diff*-1;
						templineup[j]["diff"] += diff;
						templineup[j]["secs"] += secs;
						templineup[j]["num"]++;
					}
				}
				//if not found add to templineup
				if(!found) {
					if(lineup[i]["players"].length === 4) {
						console.log(lineup[i]);
					}
					var diff = (lineup[i]["end"]["home_score"]-lineup[i]["end"]["visitor_score"])-(lineup[i]["start"]["home_score"]-lineup[i]["start"]["visitor_score"]);
					if(a === 1) diff = diff*-1;
					templineup.push({players:lineup[i]["players"],
													 diff:diff,
													 num:1,
													 secs:secs});
				}	
			}
			if(a === 0)  self.homelineups = templineup;
			if(a === 1)  self.awaylineups = templineup;
		}
	}

  self.awayplayers=function(a) {
    if(a) {
      for(var k in a) {
				if(!awayteam) awayteam = a[k]["team"];
        a[k] = {player_code:a[k]["player_code"], on_court:a[k]["on_court"], team:a[k]["team"], pts:[], miss:[], ast:[], rebs:[], stls:[], tos:[], blks:[], fls:[], mins:[]};
      }
      self.awayplayers.val=a;

      return self;
    }
    return self.awayplayers.val ? self.awayplayers.val : [];
  }  

  self.data=function(d) {
    if(d) {
      self.data.val=d;
      return self;
    }
    return self.data.val ? self.data.val : [];
  }

  self.scoringmargins = [{margin:0, time:"12:00", period:1}];

  function mincorrect(evt, player, playername, period, evt) {
    //fixes missing minutes from starts of quarters
		addtocurrent(playername, player, player["team"]);
    var recent = player.mins[player.mins.length-1];
    if(player.mins.length === 0 || (recent.outtime !== null && recent.outperiod < period)) {
      var intime = "12:00";
      if(period > 4) intime = "5:00";
      player.mins.push({intime:intime, inperiod:period, outtime:null, outperiod:null});
      recent = player.mins[player.mins.length-1];
			lineupcorrect(period, intime, player, playername);
    }
    //if play an entire quarter, no substitution
    if(recent.outtime === null && recent.inperiod < period) {
      recent.outtime = "0:00";
      recent.outperiod = recent.inperiod;

      var intime = "12:00";
      if(period > 4) intime = "5:00";
      player.mins.push({intime:intime, inperiod:period, outtime:null, outperiod:null});
    }
  }
	
	function lineupcorrect(period, intime, player, playername) {
			var t = timetoseconds(period, intime);	
			//add to lineup, may be missing
			var lineup;
			var current;
			if(player["team"] === hometeam) {
				lineup = self.homelineups;
				current = self.currenthomelineup;
			}
			if(player["team"] === awayteam) {
				lineup = self.awaylineups;
				current = self.currentawaylineup;
			}
			for(var j=0;j<lineup.length;j++) {
				var s = timetoseconds(lineup[j]["start"]["period"], lineup[j]["start"]["clock"]);
				var e = timetoseconds(lineup[j]["end"]["period"], lineup[j]["end"]["clock"]);
				if(t >= s && t < e) {
					addtocurrent(playername, player, player["team"], lineup[j]);
				}
			}

			if("description" in current["start"] && current["start"]["description"].indexOf("Start Period") > -1) current["start"]["clock"] = period < 5? "12:00" : "5:00"; 
			var s = timetoseconds(current["start"]["period"], current["start"]["clock"]);
			if(playername === "Sessions") console.log(current);
			if(t > s) addtocurrent(playername, player, player["team"], lineup[j]);
	}


  self.parse=function() {
    for(var k in self.homeplayers.val) {
      self.homeplayers.val[k] = {player_code:self.homeplayers.val[k]["player_code"], on_court:self.homeplayers.val[k]["on_court"], team:self.homeplayers.val[k]["team"], pts:[], miss:[], ast:[], rebs:[], stls:[], tos:[], blks:[], fls:[], mins:[]};
    }
    for(var k in self.awayplayers.val) {
      self.awayplayers.val[k] = {player_code:self.awayplayers.val[k]["player_code"], on_court:self.awayplayers.val[k]["on_court"], team:self.awayplayers.val[k]["team"], pts:[], miss:[], ast:[], rebs:[], stls:[], tos:[], blks:[], fls:[], mins:[]};
    }
		
		self.homelineups = [];
		self.awaylineups = [];
	  self.currenthomelineup = {players:[], start:{clock:"12:00", period:"1", home_score:"0", visitor_score:"0"}, end:null};
 		self.currentawaylineup = {players:[], start:{clock:"12:00", period:"1", home_score:"0", visitor_score:"0"}, end:null};

    self.scoringmargins = [{margin:0, time:"12:00", period:1}];
    var period = 0;
    var subtract = false;
    for(var i=0;i<self.data().length;i++) {
      var evt = self.data()[i];
      var desc = evt["description"];
      if(desc.indexOf("Start Period") > -1) {
        if(subtract) {
          subtract = false;
        }
        else  {
					period++;
					evt["period"] = period;
					if(period != 1) changelineup(null, null, "both", evt);
				}
      }
      if(period > totalperiods) totalperiods = period;
      if(period === 0) {
        subtract = true;
        period = 1;
      }
      evt["period"] = period===0? 1 : period;
      //create player stats
      var teams = [self.homeplayers(), self.awayplayers()];
      for(var n=0;n<teams.length;n++) {
        var players = teams[n];
        if(desc.indexOf("PTS)") > -1) {
          var sections = desc.split("(");
          var assisted = desc.indexOf("AST)") > -1;
          var found = 0;
          for(var k in players) {
            if((sections[0].indexOf(k + " ") > -1 || sections[0].indexOf(k+",") > -1 || evt["player_code"] === players[k]["player_code"]) && evt["team_abr"] === players[k]["team"]) {
              var pt = {time:evt.clock,
                        period:period,
                        pts:parseInt(sections[1].split(" PTS)")[0]),
                        margin:parseInt(evt["home_score"]) - parseInt(evt["visitor_score"]),
                        evt:i};
              players[k].pts.push(pt);
              pt.desc = desc;
              self.scoringmargins.push(pt);
              mincorrect(evt, players[k], k, period, evt);
            }
            if(assisted) {
              if(sections[1].indexOf(k + " ") > -1 && evt["team_abr"] === players[k]["team"]) {
                players[k].ast.push({time:evt.clock, period:period, evt:i});
              	mincorrect(evt, players[k], k, period, evt);
              }
            }  
          }
        }
        if(desc.indexOf(" Missed") > -1) {
          for(var k in players) {
            if((desc.split(" Missed")[0].indexOf(k + " ") > -1 || evt["player_code"] === players[k]["player_code"]) && evt["team_abr"] === players[k]["team"]) {
                players[k].miss.push({time:evt.clock, period:period, evt:i});
              	mincorrect(evt, players[k], k, period, evt);
                break;
            }
          }
        }
        if(desc.indexOf("Rebound") > -1 && desc.indexOf("Team Rebound") === -1) {
          for(var k in players) {
            if((desc.split("Rebound")[0].indexOf(k + " ") > -1 || evt["player_code"] === players[k]["player_code"]) && evt["team_abr"] === players[k]["team"]) {
                players[k].rebs.push({time:evt.clock, period:period, evt:i});
              	mincorrect(evt, players[k], k, period, evt);
                break;
            }
          }
        }
        if(desc.indexOf("Steal") > -1) {
          for(var k in players) {
            if(desc.split("TO)")[1].indexOf(k + " ") > -1 && evt["team_abr"] !== players[k]["team"]) {
                players[k].stls.push({time:evt.clock, period:period, evt:i});
              	mincorrect(evt, players[k], k, period, evt);
                break;
            }
          }
        }
        if(desc.indexOf("Turnover") > -1) {
          for(var k in players) {
            if((desc.split("Turnover")[0].indexOf(k + " ") > -1 || evt["player_code"] === players[k]["player_code"]) && evt["team_abr"] === players[k]["team"]) {
                players[k].tos.push({time:evt.clock, period:period, evt:i});
              	mincorrect(evt, players[k], k, period, evt);
                break;
            }
          }
        }
        if(desc.indexOf("Block: ") > -1) {
          for(var k in players) {
            if(desc.split("Block: ")[1].indexOf(k+" ") > -1 && evt["team_abr"] !== players[k]["team"]) {
                players[k].blks.push({time:evt.clock, period:period, evt:i});
              	mincorrect(evt, players[k], k, period, evt);
                break;
            }
          }
        }
        if(desc.indexOf("Foul:") > -1) {
          for(var k in players) {
            if((desc.split("Foul:")[0].indexOf(k+" ") > -1 || evt["player_code"] === players[k]["player_code"]) && evt["team_abr"] === players[k]["team"]) {
                players[k].fls.push({time:evt.clock, period:period, evt:i});
              	mincorrect(evt, players[k], k, period, evt);
                break;
            }
          }
        }
        if(desc.indexOf("Substitution ") > -1  && evt["team_abr"] === players[Object.keys(players)[0]]["team"]) {
          var subs = desc.split("replaced by");
					var inplayer;
					var outplayer;
          for(var j in players) {
            //in
            if(subs[1].indexOf(j) > -1) {
							players[j]["playername"] = j;
							inplayer = players[j];
              var len = players[j].mins.length;
              if(len > 0 && players[j].mins[len-1].outtime === null) {
                players[j].mins[len-1].outtime = "0:00";
                players[j].mins[len-1].outperiod = players[j].mins[len-1].inperiod;
              }
              players[j].mins.push({intime:evt.clock, inperiod:period, outtime:null, outperiod:null});
            }
            //out
            if(subs[0].indexOf(j) > -1 || evt["player_code"] === players[j]["player_code"]) {
							players[j]["playername"] = j;
							mincorrect(evt, players[j], j, period, evt);
							outplayer = players[j];
              var len = players[j].mins.length;
              if(len > 0) {
                players[j].mins[len-1].outtime = evt.clock;
                players[j].mins[len-1].outperiod = period;
              }
              else {
                var intime = "12:00";
                if(period > 4) intime = "5:00";
                players[j].mins.push({intime:intime, inperiod:period, outtime:evt.clock, outperiod:period});
              }
            }
          }
					changelineup(inplayer, outplayer, players[Object.keys(players)[0]]["team"], evt);
        }
      }
    }

    //sort scoring by time
    self.scoringmargins.sort(function(a,b) {
      if(a.period === b.period) {
        var mindiff = parseInt(a.time.split(":")[0]) - parseInt(b.time.split(":")[0]);
        var secdiff = parseInt(a.time.split(":")[1]) - parseInt(b.time.split(":")[1]);
        if(mindiff === 0) return secdiff > 0? -1 : 1;
        return mindiff > 0? -1 : 1;
      }
      return a.period > b.period? 1 : -1;
    });

    for(var i=0;i<self.homeplayers().length;i++) {
      if(self.homeplayers()[i].mins.length === 0) {
        self.homeplayers.val.splice(i,1);
        i--;
      }
    }
    for(var i=0;i<self.awayplayers().length;i++) {
      if(self.awayplayers()[i].mins.length === 0) {
        self.awayplayers.val.splice(i,1);
        i--;
      }
    }
	
		var evt = self.data()[self.data().length-1];
		self.currenthomelineup["end"] = evt; 
		self.currentawaylineup["end"] = evt; 
		self.homelineups.push(JSON.parse(JSON.stringify(self.currenthomelineup)));
		self.awaylineups.push(JSON.parse(JSON.stringify(self.currentawaylineup)));

		combinelineups();

    return self;
  };

  self.w=function(w) {
    if(w) {
      self.w.val=w;
      return self;
    }
    return self.w.val ? self.w.val : 1000;
  }

  self.h=function(h) {
    if(h) {
      self.h.val=h;
      return self;
    }
    return self.h.val ? self.h.val : 500;
  }
  
  self.margins=function(m) {
    if(m) {
      self.margins.val=m;
      return self;
    }
    return self.margins.val ? self.margins.val : {top:50,right:20,left:50,bottom:20};
  }

  timetoseconds=function(p,t) {
    var m = parseInt(t.split(":")[0]);
    var sec = parseInt(t.split(":")[1]);
    if(p <= 4) return (p-1)*720 + (12-m)*60-sec;
    return 2880 + (p-5)*300 + (5-m)*60-sec;
  }

  var menuwidth=300;
  var menuheight=50;
  var totalseconds=2880;

  updatemenu=function(seconds) {
    //set time and period text
    var x = self.xScale(seconds);
    if(x > self.margins().left && x <= self.w() - self.margins().right) {
      var timelabel = "";
      if(seconds === totalseconds) timelabel = "4 - 0:00";
      else {
        var period,m,s;
        if(seconds <= 2880) {
          period = Math.floor(seconds/720);
          m = 12-Math.floor((seconds-720*period)/60);
          s = 60-Math.floor(seconds-720*period-60*(12-m));
          m--;
        }
        else {
          period = Math.floor((seconds-2880)/300)+4;
          m = 5-Math.floor((seconds-2880-300*(period-4))/60);
          s = 60-Math.floor(seconds-2880-300*(period-4)-60*(5-m));
          m--;
        }
        if(s === 60) {
          s = 0;
          m += 1;
        }
        if(s < 10) s = "0"+s;
        timelabel = period+1 + " - " + m+":"+s; 
      }

      //set plays in menu
      var currentscore = "";
      for(var i=0;i<self.data().length;i++) {
        var pt = self.data()[i];
        if(pt.sCORE !== null) currentscore = pt.sCORE;
        if(timetoseconds(pt["period"], pt["clock"]) >= seconds) {
          if(!rollover) {
            var txt = pt["description"].split("] ")[1];
            if(txt != null) {
              txt = txt.split("(")[0];
              self.vis.select(".play-text").text(txt);
            }
            else self.vis.select(".play-text").text("");
          }
          break;
        }
      }
      self.vis.select(".hover-line").attr("x1",x).attr("x2",x);
      //end of quarters
      if(timelabel === "2 - 12:00") timelabel = "End of 1st Qtr";
      if(timelabel === "3 - 12:00") timelabel = "Halftime";
      if(timelabel === "4 - 12:00") timelabel = "End of 3rd Qtr";
      if(timelabel === "4 - 0:00" && self.data()[self.data().length-1]["home_score"] !== self.data()[self.data().length-1]["visitor_score"]) timelabel = "Game Over";


      timelabel = timelabel + " / " + pt["visitor_score"] + " - " + pt["home_score"];
      self.vis.select(".time-text")
        .text(timelabel);

      if(x > self.w()-self.margins().right-menuwidth) x = self.w()-self.margins().right-menuwidth;
      self.vis.select(".hover-menu").attr("transform", "translate("+x+",0)")
        .attr("opacity",100);
    }
  }

  self.homecolor = function(c) {
    if(c) {
      self.homecolor.val = c;
      return self;
    }
    return self.homecolor.val;
  }

  self.awaycolor = function(c) {
    if(c) {
      self.awaycolor.val = c;
      return self;
    }
    return self.awaycolor.val;
  }

  var rollover = false;

  var statson = {"Points":true, "Misses":false, "Assists":true, "Rebounds":false, "Steals": false, "TOs":false, "Blocks": false, "Fouls":false};

  self.draw=function() {
    var extraticks = [];
    if(self.data()[self.data().length-1].period > 4) {
      extraticks.push(2880);
      totalseconds = (self.data()[self.data().length-1].period-4) * 300 + 2880;
      for(var i=4;i<self.data()[self.data().length-1].period-1;i++) {
        extraticks.push(2880+300*(i-3));
      }
    }

    self.vis=d3.select(self.selector());
    document.getElementById(self.selector().substring(1)).innerHTML="<linearGradient id=\"score-gradient\" gradientUnits=\"userSpaceOnUse\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"553\"><stop offset=\"0%\"></stop><stop offset=\"50%\"></stop><stop offset=\"50%\"></stop><stop offset=\"100%\"></stop></linearGradient>";
    $(self.selector() + " stop")[0].setAttribute("stop-color",self.awaycolor());
    $(self.selector() + " stop")[1].setAttribute("stop-color",self.awaycolor());
    $(self.selector() + " stop")[2].setAttribute("stop-color",self.homecolor());
    $(self.selector() + " stop")[3].setAttribute("stop-color",self.homecolor());


    self.xScale = d3.scale.linear().range([self.margins().left, self.w() - self.margins().right]).domain([0, totalseconds]);



    //get limits
    var max = 0;
    var min = 0;
    for(var i=0;i<self.scoringmargins.length;i++) {
      var m = self.scoringmargins[i].margin;
      if(m === "TIE") m = 0;
      else m = parseInt(m);
      m *= -1;
      self.scoringmargins[i].margin = m;

      if(m > max) max = m;
      if(m < min) min = m;
    }

    if(Math.abs(min) > max) max = -1*min;
    else min = -1*max;

    max += 5;
    min -= 5;

    self.yScale = d3.scale.linear().range([self.h(), self.margins().top]).domain([min, max]);
    var xAxis = d3.svg.axis()
      .scale(self.xScale)
      .tickValues([]);

    //dashed line quarter markers
    var ticks = [720,1440,2160].concat(extraticks);
    for(var i=0;i<ticks.length;i++) {
      self.vis.append("svg:line")  
        .attr("class", "quarter-line")
        .attr("x1",self.xScale(ticks[i]))
        .attr("x2",self.xScale(ticks[i]))
        .attr("y1",self.yScale(self.yScale.domain()[0])).attr("y2", self.yScale(self.yScale.domain()[1]))
        .attr("stroke","grey")
        .attr("stroke-dasharray", "10,10")
      var q;
      if(i === 0) q = "2nd Quarter";
      if(i === 1) q = "3rd Quarter";
      if(i === 2) q = "4th Quarter";
      if(i === 3) q = "1st OT";
      if(i === 4) q = "2nd OT";

      self.vis.append("svg:text")
        .attr("class", "quarter-label")
        .attr("transform","translate("+self.xScale(ticks[i]+15)+",59)")
        .style("font-size", "11px")
        .attr("fill", "grey")
        .text(q);
    }


    var yAxis = d3.svg.axis()
      .scale(self.yScale)
      .tickFormat(function(t) { return Math.abs(t); })
      .orient("left");
    
    self.vis.append("svg:g")
      .attr("class", "xaxis")
      .attr("transform", "translate(0," + self.yScale(0) + ")")
      .call(xAxis);

    self.vis.append("svg:g")
      .attr("class", "yaxis")
      .attr("transform", "translate(" + (self.margins().left) + ",0)")
      .call(yAxis)
      .selectAll("text").attr("font-size", "11px");

    self.vis.selectAll(".domain")
      .attr("stroke", "black")
      .attr("stroke-width", 2)
      .attr("fill","none");

    var lineGen = d3.svg.line()
      .x(function(d) {
          var x = self.xScale(3+timetoseconds(d.period, d.time));
          return x;
      })
      .y(function(d) {
          var margin = 0;
          if(!isNaN(d.margin)) margin = parseInt(d.margin);
          return self.yScale(margin);
      })
      .interpolate("monotone");
    var latest = self.data()[self.data().length-1];
    self.scoringmargins.push({margin:self.scoringmargins[self.scoringmargins.length-1].margin, time:latest.clock, period:latest.period});
    for(var i=0;i<self.scoringmargins.length;i++) {
      if(!self.scoringmargins[i].time) {
        self.scoringmargins.splice(i, 1);
        i--;
      }
    }

    self.vis.append('svg:path')
      .attr('d', lineGen(self.scoringmargins))
      .attr('stroke', 'url(#score-gradient)')
      .attr('stroke-width', 4)
      .attr('fill', 'none');


    //player minutes
    var yplayers = {};
    var playergroups = [self.homeplayers(),self.awayplayers()];
    for(var n=0;n<playergroups.length;n++) {
      var players = playergroups[n];
      var j = n === 0? -1 : Object.keys(players).length;
      for(var p in players) {
        j = n === 0? j+1 : j-1;
        var player = players[p];
        var y = self.yScale(-0.5+self.yScale.domain()[n]*(j+1)/(Object.keys(players).length+1));
        yplayers[y] = p;
        self.vis.append("svg:text")
          .attr("class","player-name")
          .attr("pline", y)
          .attr("transform","translate(52,"+(y-5)+")")
          .attr("dy", ".35em")
          .style("font-size", "10px")
          .text(p);

        for(var i=0;i<player.mins.length;i++) {
          var min = player.mins[i];
          if(min.outperiod === null) {
            if(player["on_court"] == 1) {
              min.outperiod = self.data()[self.data().length-1]["period"];
              min.outtime = self.data()[self.data().length-1]["clock"];
            }
            else {
              min.outperiod = min.inperiod;
              min.outtime = "0:00";
            }
          }

          self.vis.append("svg:line")  
            .attr("class", "min-line")
            .attr("x1",self.xScale(timetoseconds(min.inperiod,min.intime)))
            .attr("x2",self.xScale(timetoseconds(min.outperiod,min.outtime)))
            .attr("y1",y).attr("y2",y)
            .attr("stroke","#3399FF")
            .attr("stroke-linecap","round")
            .attr("stroke-width", 1)
            .attr("pline", y);
        }


        for(var i=0;i<player.fls.length;i++) {
          var fl = player.fls[i];
          self.vis.append("svg:circle")
            .attr("class","fl-dot")
            .attr("fill","#FF00CC")
            .attr("opacity",statson["Fouls"]? 1:0)
            .attr("event", fl["evt"])
            .attr("r",3)
            .attr("cx",self.xScale(timetoseconds(fl.period,fl.time)))
            .attr("cy",y);
        }
        for(var i=0;i<player.blks.length;i++) {
          var blk = player.blks[i];
          self.vis.append("svg:circle")
            .attr("class","blk-dot")
            .attr("fill","#33FFCC")
            .attr("opacity",statson["Blocks"]?1:0)
            .attr("event", blk["evt"])
            .attr("r",3)
            .attr("cx",self.xScale(timetoseconds(blk.period,blk.time)))
            .attr("cy",y);
        }
        for(var i=0;i<player.tos.length;i++) {
          var to = player.tos[i];
          self.vis.append("svg:circle")
            .attr("class","to-dot")
            .attr("fill","red")
            .attr("opacity",statson["TOs"]?1:0)
            .attr("event", to["evt"])
            .attr("r",3)
            .attr("cx",self.xScale(timetoseconds(to.period,to.time)))
            .attr("cy",y);
        }
        for(var i=0;i<player.stls.length;i++) {
          var stl = player.stls[i];
          self.vis.append("svg:circle")
            .attr("class","stl-dot")
            .attr("fill","#CC66FF")
            .attr("opacity",statson["Steals"]?1:0)
            .attr("event", stl["evt"])
            .attr("r",3)
            .attr("cx",self.xScale(timetoseconds(stl.period,stl.time)))
            .attr("cy",y);
        }
        for(var i=0;i<player.rebs.length;i++) {
          var reb = player.rebs[i];
          self.vis.append("svg:circle")
            .attr("class","reb-dot")
            .attr("fill","blue")
            .attr("opacity",statson["Rebounds"]? 1 : 0)
            .attr("event", reb["evt"])
            .attr("r",3)
            .attr("cx",self.xScale(timetoseconds(reb.period,reb.time)))
            .attr("cy",y);
        }
        for(var i=0;i<player.miss.length;i++) {
          var miss = player.miss[i];
          self.vis.append("svg:circle")
            .attr("class","miss-dot")
            .attr("fill","#996633")
            .attr("opacity",statson["Misses"]?1:0)
            .attr("event", miss["evt"])
            .attr("r",3)
            .attr("cx",self.xScale(timetoseconds(miss.period,miss.time)))
            .attr("cy",y);
        }
        for(var i=0;i<player.ast.length;i++) {
          var ast = player.ast[i];
          self.vis.append("svg:circle")
            .attr("class","assist-dot")
            .attr("fill","green")
            .attr("opacity",statson["Assists"]?1:0)
            .attr("event", ast["evt"])
            .attr("r",3)
            .attr("cx",self.xScale(timetoseconds(ast.period,ast.time)))
            .attr("cy",y);
        }
        for(var i=0;i<player.pts.length;i++) {
          var pt = player.pts[i];
          self.vis.append("svg:circle")
            .attr("class","point-dot")
            .attr("fill","orange")
            .attr("opacity",statson["Points"]?1:0)
            .attr("event", pt["evt"])
            .attr("r",3)
            .attr("cx",self.xScale(timetoseconds(pt.period,pt.time)))
            .attr("cy",y);
        }


      }
    }

    //click events for circles
    self.vis.selectAll("circle")
      .style("cursor", neutral.period === "Final"? "pointer": "")
      .on("click", function(d) {
          //show video of play
          if(neutral.period === "Final") {
          var evt = d3.select(this).attr("event");
          var url = "http://stats.nba.com/cvp.html?GameID="+gameID+"&GameEventID="+self.data()[evt]["event"]+"&mtype=&mtitle=";
          //var url = "http://stats.nba.com/movement/#!/?GameID="+gameID+"&GameEventID="+self.data()[evt]["event"]+"&mtype=&mtitle=";
          document.getElementById("video-title").innerHTML = self.data()[evt]["description"];
          d3.select("#video-frame")
            .attr("src", url)
            .attr("width", 604)
            .attr("height", 350);
          if(d3.select("#video").style("display") === "none") $("#video").slideToggle();
        }
      })
      .on("mouseover", function() { 
        d3.select(this).attr("r", 5);
        var txt = self.data()[d3.select(this).attr("event")]["description"];
        if(d3.select(this).attr("class") === "assist-dot") txt = txt.split(")")[1].split("(")[0]; 
        else if(d3.select(this).attr("class") === "stl-dot") txt = txt.split(")")[1].split("(")[0]; 
        else if(d3.select(this).attr("class") === "miss-dot") txt = txt.split("] ")[1].split(" Block")[0]; 
        else if(d3.select(this).attr("class") === "blk-dot") txt = txt.split("Missed ")[1].split(" (")[0]; 
        else txt = txt.split("] ")[1].split("(")[0]
        self.vis.select(".play-text").text(txt);
        rollover = true;
      })
      .on("mouseout", function() { d3.select(this).attr("r", 3); rollover = false;});

    var latest = self.data()[self.data().length-1];
    var t = timetoseconds(totalperiods, latest.clock);

    self.vis.append('svg:line')
      .attr("class", "hover-line")
      .attr("x1",self.xScale(t)).attr("x2",self.xScale(t))
      .attr("y1",0).attr("y2",self.h())
      .attr("stroke","black")
      .attr("stroke-width", 2)
      .style("pointer-events", "none");

    //hover menu, follows mouse
    var menu = self.vis.append('svg:g')
      .attr("class", "hover-menu")
      .attr("transform", "translate(0,0)")
      .attr("width", menuwidth)
      .attr("height", menuheight)
      .style("z-index",50);

    menu.append("svg:rect")
      .attr("stroke","black")
      .attr("stroke-width", 2)
      .attr("fill","white")
      .attr("width", menuwidth)
      .attr("height", menuheight);

    menu.append("svg:text")
      .attr("class", "time-text")
      .attr("transform","translate(5,10)")
      .attr("dy", ".35em")
      .style("font-size", "15px")
      .text("1 - 12:00");

    menu.append("svg:text")
      .attr("class", "play-text")
      .attr("transform","translate(5,30)")
      .attr("dy", ".35em")
      .style("font-size", "15px")
      .text("Line 1");

    updatemenu(t);
      
    //legend
    self.vis.append("svg:rect")
      .attr("class","legend-rect")
      .attr("fill","orange")
      .attr("transform","translate(33,"+(self.h()+10)+")")
      .attr("opacity", statson["Points"] ? 1:0.3)
      .attr("width",15)
      .attr("height",15)
      .attr("text","Points");
    self.vis.append("svg:text")
      .attr("class","legend-text")
      .attr("transform","translate(53,"+(self.h()+16)+")")
      .attr("dy", ".35em")
      .style("font-size", "15px")
      .text("Points");

    self.vis.append("svg:rect")
      .attr("class","legend-rect")
      .attr("fill","#996633")
      .attr("transform","translate(97,"+(self.h()+10)+")")
      .attr("opacity", statson["Misses"] ? 1:0.3)
      .attr("width",15)
      .attr("height",15)
      .attr("text","Misses");
    self.vis.append("svg:text")
      .attr("class","legend-text")
      .attr("transform","translate(117,"+(self.h()+16)+")")
      .attr("dy", ".35em")
      .style("font-size", "15px")
      .text("Misses");

    self.vis.append("svg:rect")
      .attr("class","legend-rect")
      .attr("fill","green")
      .attr("transform","translate(167,"+(self.h()+10)+")")
      .attr("opacity", statson["Assists"] ? 1:0.3)
      .attr("width",15)
      .attr("height",15)
      .attr("text","Assists");
    self.vis.append("svg:text")
      .attr("class","legend-text")
      .attr("transform","translate(187,"+(self.h()+16)+")")
      .attr("dy", ".35em")
      .style("font-size", "15px")
      .text("Assists");

    self.vis.append("svg:rect")
      .attr("class","legend-rect")
      .attr("fill","blue")
      .attr("opacity", statson["Rebounds"] ? 1:0.3)
      .attr("transform","translate(240,"+(self.h()+10)+")")
      .attr("width",15)
      .attr("height",15)
      .attr("text","Rebounds");
    self.vis.append("svg:text")
      .attr("class","legend-text")
      .attr("transform","translate(260,"+(self.h()+16)+")")
      .attr("dy", ".35em")
      .style("font-size", "15px")
      .text("Rebounds");

    self.vis.append("svg:rect")
      .attr("class","legend-rect")
      .attr("fill","#CC66FF")
      .attr("opacity", statson["Steals"] ? 1:0.3)
      .attr("transform","translate(325,"+(self.h()+10)+")")
      .attr("width",15)
      .attr("height",15)
      .attr("text","Steals");
    self.vis.append("svg:text")
      .attr("class","legend-text")
      .attr("transform","translate(345,"+(self.h()+16)+")")
      .attr("dy", ".35em")
      .style("font-size", "15px")
      .text("Steals");

    self.vis.append("svg:rect")
      .attr("class","legend-rect")
      .attr("fill","red")
      .attr("opacity", statson["TOs"] ? 1:0.3)
      .attr("transform","translate(385,"+(self.h()+10)+")")
      .attr("width",15)
      .attr("height",15)
      .attr("text","TOs");
    self.vis.append("svg:text")
      .attr("class","legend-text")
      .attr("transform","translate(405,"+(self.h()+16)+")")
      .attr("dy", ".35em")
      .style("font-size", "15px")
      .text("TOs");

    self.vis.append("svg:rect")
      .attr("class","legend-rect")
      .attr("fill","#33FFCC")
      .attr("opacity", statson["Blocks"] ? 1:0.3)
      .attr("transform","translate(435,"+(self.h()+10)+")")
      .attr("width",15)
      .attr("height",15)
      .attr("text","Blocks");
    self.vis.append("svg:text")
      .attr("class","legend-text")
      .attr("transform","translate(455,"+(self.h()+16)+")")
      .attr("dy", ".35em")
      .style("font-size", "15px")
      .text("Blocks");

    self.vis.append("svg:rect")
      .attr("class","legend-rect")
      .attr("fill","#FF00CC")
      .attr("opacity", statson["Fouls"] ? 1:0.3)
      .attr("transform","translate(500,"+(self.h()+10)+")")
      .attr("width",15)
      .attr("height",15)
      .attr("text","Fouls");
    self.vis.append("svg:text")
      .attr("class","legend-text")
      .attr("transform","translate(520,"+(self.h()+16)+")")
      .attr("dy", ".35em")
      .style("font-size", "15px")
      .text("Fouls");

    self.vis.selectAll(".legend-text, .legend-rect")
      .on("click", function(d) {
        var txt = d3.select(this).text();
        txt = txt ? txt : d3.select(this).attr("text");
        var op, selector;
        if(txt === "Points") selector = ".point-dot";
        if(txt === "Misses") selector = ".miss-dot";
        if(txt === "Assists") selector = ".assist-dot";
        if(txt === "Rebounds") selector = ".reb-dot";
        if(txt === "Steals") selector = ".stl-dot";
        if(txt === "TOs") selector = ".to-dot";
        if(txt === "Blocks") selector = ".blk-dot";
        if(txt === "Fouls") selector = ".fl-dot";
        op = Math.abs(self.vis.select(selector).attr("opacity")-1);
        self.vis.selectAll(selector).attr("opacity",op)
          .style("pointer-events", op+0.3==1.3 ? "" : "none");
        self.vis.select(".legend-rect[text='"+txt+"']")
          .attr("opacity", op + 0.3);
        statson[txt] = op+0.3==1.3;
      });

    self.vis.on("mousemove",function(d,i) {
        var x = d3.mouse(this)[0];
        var y = d3.mouse(this)[1];
        var seconds = self.xScale.invert(x);
        updatemenu(seconds);

        //highlight player minutes
        var close = 10000;
        var yfound;
        for(var yp in yplayers) {
          if(Math.abs(y-yp) < close) {
            close = Math.abs(y-yp);
            yfound = yp;
          }
        }
        self.vis.selectAll(".min-line")
          .attr("stroke","#3399FF");
        self.vis.selectAll(".player-name")
          .attr("stroke", "");
        self.vis.selectAll('[pline="'+yfound+'"]')
          .attr("stroke","#CDCD4D");
      })
      .on("mouseout", mouseoff);

    mouseoff();

    return self;
  };

  function mouseoff() {
    var latest = self.data()[self.data().length-1];
    var t = timetoseconds(latest.period, latest.clock);
    updatemenu(t);

    self.vis.selectAll(".min-line")
      .attr("stroke","#3399FF");
    self.vis.selectAll(".player-name")
      .attr("stroke","");
   }


  return self;
}
