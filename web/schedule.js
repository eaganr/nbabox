function schedule() {	
  var self = this;

	//private vars
	var url = "http://stats.nba.com/stats/scoreboard/?callback=?&LeagueID=00&DayOffset=0&GameDate=";
	var today = new Date();
	//var date = today.getMonth()+1+"/"+today.getDate()+"/"+today.getFullYear();
	var date = "03/10/2015";
	self.games=[];

	self.getschedule=function() {
		var maindiv = document.getElementById(self.id());
		if(maindiv) maindiv.innerHTML = "";
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
		
		$("#datepicker").datepicker();
		$("#datepicker").change(function() {
			date = $(this).val();
			self.getschedule();
		});

		
	
		for(var i=0;i<self.games.length;i++) {
			var game = document.createElement("div");	
			game.className = "schedule-game";
			game.gameid=self.games[i].gameid;
			game.onclick=function() { window.location="?gameid="+this.gameid;};

			var img = document.createElement("img");
			img.src="http://stats.nba.com/media/img/teams/logos/"+self.games[i].awayteam+"_logo.svg";
			img.width=25;
			img.height=25;
			img.className="away-logo";
			game.appendChild(img);
			img = img.cloneNode(true);
			img.className="home-logo";
			img.src="http://stats.nba.com/media/img/teams/logos/"+self.games[i].hometeam+"_logo.svg";
			game.appendChild(img);

			var txt = document.createElement("div");
			txt.innerHTML = self.games[i].awayteam+" vs. "+self.games[i].hometeam;
			game.appendChild(txt);
			document.getElementById(self.id()).appendChild(game);
			game.innerHTML += "<br />";
		}
		return self;
	};

	return self;
}
