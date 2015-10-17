function schedule() {	
  var self = this;

	//private vars
	var today = new Date();
  if(today.getHours() < 15) today.setDate(today.getDate() - 1);
	var date = today.getMonth()+1+"/"+today.getDate()+"/"+today.getFullYear();
	//var date = "03/10/2015";
	self.games=[];
  self.loaded = false;

	self.getschedule=function() {
		var maindiv = document.getElementById(self.id());
		if(maindiv) maindiv.innerHTML = "";
		self.games = [];
    var accur = 3;
    var d = new Date(date);
    if(today.getDate() === d.getDate() && today.getFullYear() === d.getFullYear() && today.getMonth() === d.getMonth()) {
      accur = 1;
    } 
		$.ajax({
				type : 'POST',
				url : 'http://eaganr.com:3000',           
				data: {
					func: "getSchedule",
					date : date,
          accur : accur
				},
				success:function (data) {
          data = data["sports_content"]["games"]["game"];
          
					for(var i=0;i<data.length;i++) {
            var hometeam = data[i]["home"]["abbreviation"];
            var awayteam = data[i]["visitor"]["abbreviation"];
						self.games.push({gameid:data[i]["id"], hometeam:hometeam, awayteam:awayteam});
					}
          self.loaded = true;
					self.draw();
				}
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
  
  self.date=function() {
    return date;
  }
  
  var movedate = function(dir) {
    var d = new Date(date); 
    d.setDate(d.getDate() + dir);
    date = d.getMonth()+1+"/"+d.getDate()+"/"+d.getFullYear();
    self.getschedule();
  };

	self.draw=function() {
		var maindiv = document.getElementById(self.id());
		maindiv.innerHTML = "";

    var bbutton = document.createElement("button");
    bbutton.innerHTML = "<";
    bbutton.className = "move-btn";
    bbutton.onclick = function() { movedate(-1); };
    maindiv.appendChild(bbutton);

		var datepicker = document.createElement("input");
		datepicker.id = "datepicker";
    datepicker.value = date;
		maindiv.appendChild(datepicker);

    var fbutton = document.createElement("button");
    fbutton.innerHTML = ">";
    fbutton.className = "move-btn";
    fbutton.onclick = function() { movedate(1); };
    maindiv.appendChild(fbutton);

		
		$("#datepicker").datepicker();
		$("#datepicker").change(function() {
			date = $(this).val();
			self.getschedule();
		});

		
	
		for(var i=0;i<self.games.length;i++) {
			var game = document.createElement("div");	
			game.className = "schedule-game";
			game.gameid=self.games[i].gameid;
			game.onclick=function() { 
        d = date.replace(new RegExp("/", 'g'), "-");
        if(d.length === 9) d = d.substring(0,3)+"0"+d.substring(3);
        d = d.substring(6)+d.substring(0,2)+d.substring(3,5);
        window.location="?gameid="+this.gameid+"&date="+d;
      };

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
