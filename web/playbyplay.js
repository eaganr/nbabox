function playbyplay() {	
  var self = this;
	
	self.selector=function(s) {
		if(s) {
			self.selector.val=s;
			return self;
		}
		return self.selector.val;
	}
	
	self.homeplayers=function(h) {
		if(h) {
			self.homeplayers.val=h.map(function(d,i) { return {playerName:d, pts:[], ast:[], rebs:[], stls:[], tos:[], blks:[], fls:[], mins:i<5 ? [{inperiod:1, intime:"12:00", outperiod:null, outtime:null}] : []}; });
			return self;
		}
		return self.homeplayers.val ? self.homeplayers.val : [];
	}	

	self.awayplayers=function(a) {
		if(a) {
			self.awayplayers.val=a.map(function(d,i) { return {playerName:d, pts:[], ast:[], rebs:[], stls:[], tos:[], blks:[], fls:[], mins:i<5 ? [{inperiod:1, intime:"12:00", outperiod:null, outtime:null}] : []}; });
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

	function mincorrect(evt, player) {
		//fixes missing minutes from starts of quarters
		var recent = player.mins[player.mins.length-1];
		if(player.mins.length === 0 || (recent.outtime !== null && recent.outperiod < evt.pERIOD)) {
			var intime = "12:00";
			if(evt.pERIOD > 4) intime = "5:00";
			player.mins.push({intime:intime, inperiod:evt.pERIOD, outtime:null, outperiod:null});
			recent = player.mins[player.mins.length-1];
		}
		//if play an entire quarter, no substitution
		if(recent.outtime === null && recent.inperiod < evt.pERIOD) {
			recent.outtime = "0:00";
			recent.outperiod = recent.inperiod;

			var intime = "12:00";
			if(evt.pERIOD > 4) intime = "5:00";
			player.mins.push({intime:intime, inperiod:evt.pERIOD, outtime:null, outperiod:null});
		}
	}


	self.parse=function() {
		for(var i=0;i<self.data().length;i++) {
			var evt = self.data()[i];
			//create player stats
			var descs = ["hOMEDESCRIPTION", "vISITORDESCRIPTION"];
			var teams = [self.homeplayers(), self.awayplayers()];
			for(var n=0;n<descs.length;n++) {
				var desc = evt[descs[n]];
				var players = teams[n];
				if(desc !== null) {
					if(desc.indexOf("PTS)") > -1) {
						var sections = desc.split("(");
						var assisted = desc.indexOf("AST)") > -1;
						var found = 0;
						for(var j=0;j<players.length;j++) {
							if(sections[0].indexOf(players[j].playerName) > -1) {
								var pt = {time:evt.pCTIMESTRING,
													period:evt.pERIOD,
													pts:parseInt(sections[1].split("PTS)")[0]),
													margin:evt.sCOREMARGIN};
								players[j].pts.push(pt);
								pt.desc = desc;
								self.scoringmargins.push(pt);
								mincorrect(evt, players[j]);
							}
							if(assisted) {
								if(sections[2].indexOf(players[j].playerName) > -1) {
									players[j].ast.push({time:evt.pCTIMESTRING, period:evt.pERIOD});
									mincorrect(evt, players[j]);
								}
							}	
						}
					}
					if(desc.indexOf("REBOUND") > -1) {
						for(var j=0;j<players.length;j++) {
							if(desc.indexOf(players[j].playerName) > -1) {
									players[j].rebs.push({time:evt.pCTIMESTRING, period:evt.pERIOD});
									mincorrect(evt, players[j]);
									break;
							}
						}
					}
					if(desc.indexOf("STEAL") > -1) {
						for(var j=0;j<players.length;j++) {
							if(desc.indexOf(players[j].playerName) > -1) {
									players[j].stls.push({time:evt.pCTIMESTRING, period:evt.pERIOD});
									mincorrect(evt, players[j]);
									break;
							}
						}
					}
					if(desc.indexOf("Turnover") > -1) {
						for(var j=0;j<players.length;j++) {
							if(desc.indexOf(players[j].playerName) > -1) {
									players[j].tos.push({time:evt.pCTIMESTRING, period:evt.pERIOD});
									mincorrect(evt, players[j]);
									break;
							}
						}
					}
					if(desc.indexOf("BLOCK") > -1) {
						for(var j=0;j<players.length;j++) {
							if(desc.indexOf(players[j].playerName) > -1) {
									players[j].blks.push({time:evt.pCTIMESTRING, period:evt.pERIOD});
									mincorrect(evt, players[j]);
									break;
							}
						}
					}
					if(desc.indexOf("FOUL") > -1 || desc.indexOf(".Foul") > -1) {
						for(var j=0;j<players.length;j++) {
							if(desc.indexOf(players[j].playerName) > -1) {
									players[j].fls.push({time:evt.pCTIMESTRING, period:evt.pERIOD});
									mincorrect(evt, players[j]);
									break;
							}
						}
					}
					if(desc.indexOf("SUB:") > -1) {
						var subs = desc.split("SUB:")[1];
						for(var j=0;j<players.length;j++) {
							//in
							if(subs.split("FOR")[0].indexOf(players[j].playerName) > -1) {
								var len = players[j].mins.length;
								if(len > 0 && players[j].mins[len-1].outtime === null) {
									players[j].mins[len-1].outtime = "0:00";
									players[j].mins[len-1].outperiod = players[j].mins[len-1].inperiod;
								}
								players[j].mins.push({intime:evt.pCTIMESTRING, inperiod:evt.pERIOD, outtime:null, outperiod:null});
							}
							//out
							if(subs.split("FOR")[1].indexOf(players[j].playerName) > -1) {
								var len = players[j].mins.length;
								if(len > 0) {
									players[j].mins[len-1].outtime = evt.pCTIMESTRING;
									players[j].mins[len-1].outperiod = evt.pERIOD;
								}
								else {
									var intime = "12:00";
									if(evt.pERIOD > 4) intime = "5:00";
									players[j].mins.push({intime:"5:00", inperiod:evt.pERIOD, outtime:evt.pCTIMESTRING, outperiod:evt.pERIOD});
								}
							}
						}
					}
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

	self.timetoseconds=function(p,t) {
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
				if(s < 10) s = "0"+s;
				timelabel = period+1 + " - " + m+":"+s; 
			}

			//set plays in menu
			var currentscore = "";
			for(var i=0;i<self.data().length;i++) {
				var pt = self.data()[i];
				if(pt.sCORE !== null) currentscore = pt.sCORE;
				if(self.timetoseconds(pt.pERIOD, pt.pCTIMESTRING) >= seconds) {
					var txt = pt.hOMEDESCRIPTION ? pt.hOMEDESCRIPTION : pt.vISITORDESCRIPTION;
					if(txt != null) {
						txt = txt.split("(")[0];
						self.vis.select(".play-text").text(txt);
					}
					else self.vis.select(".play-text").text("");
					break;
				}
			}
			self.vis.select(".hover-line").attr("x1",x).attr("x2",x);
			timelabel = timelabel + " / " + currentscore;
			self.vis.select(".time-text")
				.text(timelabel);

			if(x > self.w()-self.margins().right-menuwidth) x = self.w()-self.margins().right-menuwidth;
			self.vis.select(".hover-menu").attr("transform", "translate("+x+",0)")
				.attr("opacity",100);
		}
	}


	self.draw=function() {
		var extraticks = [];
		if(self.data()[self.data().length-1].pERIOD > 4) {
			totalseconds = (self.data()[self.data().length-1].pERIOD-4) * 300 + 2880;
			for(var i=4;i<self.data()[self.data().length-1].pERIOD;i++) {
				extraticks.push(2880+300*(i-3));
			}
		}

		self.vis=d3.select(self.selector());
		self.xScale = d3.scale.linear().range([self.margins().left, self.w() - self.margins().right]).domain([0, totalseconds]);



		//get limits
		var max = 0;
		var min = 0;
		for(var i=0;i<self.scoringmargins.length;i++) {
			var m = self.scoringmargins[i].margin;
			if(m === "TIE") m = 0;
			else m = parseInt(m);

			if(m > max) max = m;
			if(m < min) min = m;
		}

		if(Math.abs(min) > max) max = -1*min;
		else min = -1*max;

		max += 5;
		min -= 5;

		self.yScale = d3.scale.linear().range([self.h(), self.margins().top]).domain([min, max]);
		var	xAxis = d3.svg.axis()
			.scale(self.xScale)
			.tickValues([720,1440,2160,2880].concat(extraticks))
			.tickFormat(function(seconds) { 
				var period,m,s;
				if(seconds === 2880) return extraticks.length ? "5 - 5:00" : "4 - 0:00";
				if(seconds < 2880) {
					period = Math.floor(seconds/720);
					m = 12-Math.floor((seconds-720*period)/60);
					s = 60-Math.floor(seconds-720*period-60*(12-m));
					m--;
					if(seconds%720 === 0) {
						m = 12;
						s = 0;
					}
				}
				else {
					period = Math.floor((seconds-2880)/300)+4;
					m = 5-Math.floor((seconds-2880-300*(period-4))/60);
					s = 60-Math.floor(seconds-2880-300*(period-4)-60*(5-m));
					m--;
					if((seconds-2880)%300 === 0) {
						period--;
						m = 0;
						s = 0;
					}
				}
				if(s < 10) s = "0"+s;
				return period+1 + " - " + m+":"+s; 
			});
		var yAxis = d3.svg.axis()
			.scale(self.yScale)
			.orient("left");
		
		self.vis.append("svg:g")
			.attr("class", "xaxis")
			.attr("transform", "translate(0," + self.yScale(0) + ")")
			.call(xAxis);

		self.vis.select(".domain").style("stroke-dasharray", ("3, 3"));

		self.vis.append("svg:g")
			.attr("class", "y axis")
			.attr("transform", "translate(" + (self.margins().left) + ",0)")
			.call(yAxis);

		var lineGen = d3.svg.line()
			.x(function(d) {
					return self.xScale(self.timetoseconds(d.period, d.time));
			})
			.y(function(d) {
					var margin = 0;
					if(!isNaN(d.margin)) margin = parseInt(d.margin);
					return self.yScale(margin);
			})
			.interpolate("basis");

		self.vis.append('svg:path')
			.attr('d', lineGen(self.scoringmargins))
			.attr('stroke', 'steelblue')
			.attr('stroke-width', 2)
			.attr('fill', 'none');


		//player minutes
		var homeplayers = self.homeplayers().reverse();
		var playergroups = [self.awayplayers(),self.homeplayers()];
		for(var n=0;n<playergroups.length;n++) {
			var players = playergroups[n];
			for(var j=0;j<players.length;j++) {
				var player = players[j]
				var y = 240/players.length*(j+1)+250*n + self.margins().top;
				var y = self.yScale(self.yScale.domain()[n]*(j+1)/(players.length+1));
				self.vis.append("svg:text")
					.attr("class","player-name")
					.attr("transform","translate(52,"+(y-5)+")")
					.attr("dy", ".35em")
					.style("font-size", "10px")
					.text(player.playerName);

				for(var i=0;i<player.mins.length;i++) {
					var min = player.mins[i];
					if(min.outperiod === null) {
						min.outperiod = self.data()[self.data().length-1].pERIOD;
						min.outtime = "0:00";
					}
					self.vis.append("svg:line")	
						.attr("class", "min-line")
						.attr("x1",self.xScale(self.timetoseconds(min.inperiod,min.intime)))
						.attr("x2",self.xScale(self.timetoseconds(min.outperiod,min.outtime)))
						.attr("y1",y).attr("y2",y)
						.attr("stroke","black")
						.attr("stroke-width", 1);
				}


				for(var i=0;i<player.fls.length;i++) {
					var fl = player.fls[i];
					self.vis.append("svg:circle")
						.attr("class","fl-dot")
						.attr("fill","#FF00CC")
						.attr("opacity",0)
						.attr("r",3)
						.attr("cx",self.xScale(self.timetoseconds(fl.period,fl.time)))
						.attr("cy",y);
				}
				for(var i=0;i<player.blks.length;i++) {
					var blk = player.blks[i];
					self.vis.append("svg:circle")
						.attr("class","blk-dot")
						.attr("fill","#33FFCC")
						.attr("opacity",0)
						.attr("r",3)
						.attr("cx",self.xScale(self.timetoseconds(blk.period,blk.time)))
						.attr("cy",y);
				}
				for(var i=0;i<player.tos.length;i++) {
					var to = player.tos[i];
					self.vis.append("svg:circle")
						.attr("class","to-dot")
						.attr("fill","red")
						.attr("opacity",0)
						.attr("r",3)
						.attr("cx",self.xScale(self.timetoseconds(to.period,to.time)))
						.attr("cy",y);
				}
				for(var i=0;i<player.stls.length;i++) {
					var stl = player.stls[i];
					self.vis.append("svg:circle")
						.attr("class","stl-dot")
						.attr("fill","purple")
						.attr("opacity",0)
						.attr("r",3)
						.attr("cx",self.xScale(self.timetoseconds(stl.period,stl.time)))
						.attr("cy",y);
				}
				for(var i=0;i<player.rebs.length;i++) {
					var reb = player.rebs[i];
					self.vis.append("svg:circle")
						.attr("class","reb-dot")
						.attr("fill","blue")
						.attr("opacity",0)
						.attr("r",3)
						.attr("cx",self.xScale(self.timetoseconds(reb.period,reb.time)))
						.attr("cy",y);
				}
				for(var i=0;i<player.ast.length;i++) {
					var ast = player.ast[i];
					self.vis.append("svg:circle")
						.attr("class","assist-dot")
						.attr("fill","green")
						.attr("opacity",1)
						.attr("r",3)
						.attr("cx",self.xScale(self.timetoseconds(ast.period,ast.time)))
						.attr("cy",y);
				}
				for(var i=0;i<player.pts.length;i++) {
					var pt = player.pts[i];
					self.vis.append("svg:circle")
						.attr("class","point-dot")
						.attr("fill","orange")
						.attr("opacity",1)
						.attr("r",3)
						.attr("cx",self.xScale(self.timetoseconds(pt.period,pt.time)))
						.attr("cy",y);
				}


			}
		}


		var latest = self.data()[self.data().length-1];
		var t = self.timetoseconds(latest.pERIOD, latest.pCTIMESTRING);

		self.vis.append('svg:line')
			.attr("class", "hover-line")
			.attr("x1",self.xScale(t)).attr("x2",self.xScale(t))
			.attr("y1",0).attr("y2",self.h())
			.attr("stroke","black")
			.attr("stroke-width", 2);

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
			.attr("transform","translate(100,"+(self.h()+10)+")")
			.attr("width",15)
			.attr("height",15)
			.attr("text","Points");
		self.vis.append("svg:text")
			.attr("class","legend-text")
			.attr("transform","translate(120,"+(self.h()+16)+")")
			.attr("dy", ".35em")
      .style("font-size", "15px")
			.text("Points");

		self.vis.append("svg:rect")
			.attr("class","legend-rect")
			.attr("fill","green")
			.attr("transform","translate(167,"+(self.h()+10)+")")
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
			.attr("opacity", 0.3)
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
			.attr("fill","purple")
			.attr("opacity", 0.3)
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
			.attr("opacity", 0.3)
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
			.attr("opacity", 0.3)
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
			.attr("opacity", 0.3)
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
				if(txt === "Assists") selector = ".assist-dot";
				if(txt === "Rebounds") selector = ".reb-dot";
				if(txt === "Steals") selector = ".stl-dot";
				if(txt === "TOs") selector = ".to-dot";
				if(txt === "Blocks") selector = ".blk-dot";
				if(txt === "Fouls") selector = ".fl-dot";
				op = Math.abs(self.vis.select(selector).attr("opacity")-1);
				self.vis.selectAll(selector).attr("opacity",op);
				self.vis.select(".legend-rect[text='"+txt+"']")
					.attr("opacity", op + 0.3);
			});

		self.vis.append("svg:rect")
			.attr("fill","blue")
			.attr("opacity",0)
			.attr("width",1000)
			.attr("height",500)
			.on("mousemove",function(d,i) {
				var x = d3.mouse(this)[0];
				var seconds = self.xScale.invert(x);
				updatemenu(seconds);
			})
			.on("mouseout",function(d,i) {
				var latest = self.data()[self.data().length-1];
				var t = self.timetoseconds(latest.pERIOD, latest.pCTIMESTRING);
				updatemenu(t);
			});

		return self;
	};


	return self;
}
