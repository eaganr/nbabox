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
			self.homeplayers.val=h.map(function(d) { return {playerName:d, pts:[], ast:[], rebs:[], mins:[]}; });
			return self;
		}
		return self.homeplayers.val ? self.homeplayers.val : [];
	}	

	self.awayplayers=function(a) {
		if(a) {
			self.awayplayers.val=a.map(function(d) { return {playerName:d, pts:[], ast:[], rebs:[], mins:[]}; });
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
							}
							if(assisted) {
								if(sections[2].indexOf(players[j].playerName) > -1) {
									players[j].ast.push({time:evt.pCTIMESTRING, period:evt.pERIOD});
								}
							}	
						}
					}
					if(desc.indexOf("REBOUND") > -1) {
						for(var j=0;j<players.length;j++) {
							if(desc.indexOf(players[j].playerName) > -1) {
									players[j].rebs.push({time:evt.pCTIMESTRING, period:evt.pERIOD});
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
									players[j].mins.push({intime:"12:00", inperiod:evt.pERIOD, outtime:evt.pCTIMESTRING, outperiod:evt.pERIOD});
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
		return self.margins.val ? self.margins.val : {top:20,right:20,left:50,bottom:20};
	}

	self.timetoseconds=function(p,t) {
		var m = parseInt(t.split(":")[0]);
		var sec = parseInt(t.split(":")[1]);
		return (p-1)*720 + (12-m)*60-sec;
	}

	var menuwidth=300;
	var menuheight=50;

	updatemenu=function(seconds) {
		//set time and period text
		var x = self.xScale(seconds);
		if(x > self.margins().left && x <= self.w() - self.margins().right) {
			var timelabel = "";
			if(seconds === 2880) timelabel = "4 - 0:00";
			else {
				var period = Math.floor(seconds/720);
				var m = 12-Math.floor((seconds-720*period)/60);
				var s = 60-Math.floor(seconds-720*period-60*(12-m));
				m-=1;
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
			self.vis.select(".hover-menu").attr("transform", "translate("+x+", 0)")
				.attr("opacity",100);
		}
	}


	self.draw=function() {
		self.vis=d3.select(self.selector());
		self.xScale = d3.scale.linear().range([self.margins().left, self.w() - self.margins().right]).domain([0, 2880]);

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

		self.yScale = d3.scale.linear().range([self.h() - self.margins().top, self.margins().bottom]).domain([min, max]);
		var	xAxis = d3.svg.axis()
			.scale(self.xScale)
			.tickValues([0,720,1440,2160,2880])
			.tickFormat(function(d) { 
				if(d === 2880) return "0:00";
				var period = Math.floor(d/720);
				var m = 12-Math.floor((d-720*period)/60);
				var s = d-720*period-60*(12-m);
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
			.attr('stroke', 'green')
			.attr('stroke-width', 2)
			.attr('fill', 'none');

		var latest = self.data()[self.data().length-1];
		var t = self.timetoseconds(latest.pERIOD, latest.pCTIMESTRING);

		self.vis.append('svg:line')
			.attr("class", "hover-line")
			.attr("x1",self.xScale(t)).attr("x2",self.xScale(t))
			.attr("y1",0).attr("y2",self.h() - self.margins().top)
			.attr("stroke","black")
			.attr("stroke-width", 2);

		var menu = self.vis.append('svg:g')
			.attr("class", "hover-menu")
			.attr("transform", "translate(0,0)")
			.attr("width", menuwidth)
			.attr("height", menuheight);

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
