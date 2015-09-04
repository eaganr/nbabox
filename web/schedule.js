function schedule() {	
  var self = this;

	//private vars
	var url = "http://stats.nba.com/stats/scoreboard/?callback=?&LeagueID=00&DayOffset=0&GameDate=";
	var today = new Date();
	//var date = today.getMonth()+1+"/"+today.getDate()+"/"+today.getFullYear();
	var date = "03/10/2015";
	self.games=[];

	self.getschedule=function() {
		var fullurl = url+date;
		self.games = [];
		$.getJSON(fullurl, function(data) {
			data = data.resultSets[2].rowSet;
			for(var i=0;i<data.length;i++) {
				var hometeam, awayteam;
				for(var j=0;j<teams.length;j++) {
					if(teams[j].teamId === data[i][1]) hometeam = teams[j].abbreviation;
					if(teams[j].teamId === data[i][2]) awayteam = teams[j].abbreviation;
				}
				self.games.push({gameid:data[i][0], hometeam:hometeam, awayteam:awayteam});
			}
			self.draw();
		});
		return self;
	}

	self.id=function(id) {
		if(id) {
			self.id.val=id;
			return self;
		}
		return self.id.val;
	};

	self.draw=function() {
		var maindiv = document.getElementById(self.id());
		maindiv.innerHTML = "";
		var datepicker = document.createElement("input");
		datepicker.id = "datepicker";
		maindiv.appendChild(datepicker);
		maindiv.innerHTML+="<br />";
		
		$("#datepicker").datepicker();
		$("#datepicker").change(function() {
			date = $(this).val();
			self.getschedule();
		});

		
	
		for(var i=0;i<self.games.length;i++) {
			var game = document.createElement("a");	
			game.href="?gameid="+self.games[i].gameid;
			game.innerHTML = self.games[i].awayteam+" vs. "+self.games[i].hometeam;
			document.getElementById(self.id()).appendChild(game);
			game.innerHTML += "<br />";
		}
		return self;
	};

	return self;
}
