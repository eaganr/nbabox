function schedule() {	
  var self = this;

	//private vars
	var today = new Date();
  if(today.getHours() < 12) today.setDate(today.getDate() - 1);
	var date = today.getMonth()+1+"/"+today.getDate()+"/"+today.getFullYear();
	//var date = "03/10/2015";
	self.games=[];
  self.loaded = false;

	self.getschedule=function() {
		var maindiv = document.getElementById(self.id());
		self.games = [];
    var accur = 1;
    var d = new Date(date);
    if(today.getDate() === d.getDate() && today.getFullYear() === d.getFullYear() && today.getMonth() === d.getMonth()) {
      accur = 1;
    } 
		$.ajax({
				type : 'POST',
				url : server,           
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
            var homescore = data[i]["home"]["score"];
            var awayscore = data[i]["visitor"]["score"];
            var period = data[i]["period_time"]["period_status"];

						self.games.push({gameid:data[i]["id"], hometeam:hometeam, awayteam:awayteam, homescore:homescore, awayscore:awayscore, period:period});
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
  
  self.movedate = function(dir) {
    var d = new Date(date); 
    d.setDate(d.getDate() + dir);
    date = d.getMonth()+1+"/"+d.getDate()+"/"+d.getFullYear();
    document.getElementById("datepicker").value = date;
    self.getschedule();
  };
  
  var firstdraw = true;

	self.draw=function() {
		var maindiv = document.getElementById(self.id());
    d3.selectAll(".schedule-game")
      .remove();
		d3.select("#"+self.id()).selectAll("h2").remove();
    
    if(firstdraw) {
      var bbutton = document.createElement("button");
      bbutton.innerHTML = "<";
      bbutton.className = "move-btn";
      bbutton.onclick = function() { self.movedate(-1); };
      maindiv.appendChild(bbutton);
  
      var datepicker = document.createElement("input");
      datepicker.id = "datepicker";
      datepicker.value = date;
      maindiv.appendChild(datepicker);

      var fbutton = document.createElement("button");
      fbutton.innerHTML = ">";
      fbutton.className = "move-btn";
      fbutton.onclick = function() { self.movedate(1); };
      maindiv.appendChild(fbutton);

      
      $("#datepicker").datepicker();
      $("#datepicker").change(function() {
        date = $(this).val();
        self.getschedule();
      });
      firstdraw = false;
    }

	  if(self.games.length === 0) {
      var nogames = document.createElement("h2");
      nogames.innerHTML = "No Games Scheduled";
      maindiv.appendChild(nogames);
    }	
	
		for(var i=0;i<self.games.length;i++) {
			var game = document.createElement("div");	
			game.className = "schedule-game";
			if(i >= 8) game.className += " schedule-game-2nd";
			game.gameid=self.games[i].gameid;
			game.onclick=function(e) { 
				d = date.split("/");
				var yr = d[2];
				var mnth = d[0].length > 1 ? d[0] : "0"+d[0];
				var day = d[1].length > 1 ? d[1] : "0"+d[1];
				d = yr+mnth+day;
        //check for cmd-click
        if(e.metaKey || e.ctrlKey) window.open("?gameid="+this.gameid+"&date="+d, "_blank");
        else window.location="?gameid="+this.gameid+"&date="+d;
      };

			var img = document.createElement("img");
			img.src="img/logos/"+self.games[i].awayteam+"_logo.svg";
			img.width=25;
			img.height=25;
			img.className="away-logo";
			game.appendChild(img);
			img = img.cloneNode(true);
			img.className="home-logo";
			img.src="img/logos/"+self.games[i].hometeam+"_logo.svg";
			game.appendChild(img);

      //score or game time
      var period = document.createElement("span");
      period.className="period";
      if(self.games[i]["period"].indexOf("End of") > -1) self.games[i]["period"] = self.games[i]["period"].substring(0,10);
      if(self.games[i]["period"].indexOf("Start of") > -1) self.games[i]["period"] = self.games[i]["period"].substring(0,12);
      period.innerHTML=self.games[i]["period"];
      if(self.games[i]["period"].indexOf(" ET") === -1) {
        var info = document.createElement("span");
        info.className="info";
        info.innerHTML=self.games[i]["awayscore"]+"-"+self.games[i]["homescore"];
        if(self.games[i]["period"] !== "Final") {
          period.className+=" game-live"; 
          info.className+=" game-live"; 
         }
        game.appendChild(info);
      }
      game.appendChild(period);
    

			var txt = document.createElement("div");
			txt.innerHTML = self.games[i].awayteam+" at "+self.games[i].hometeam;
			game.appendChild(txt);
			document.getElementById(self.id()).appendChild(game);
			game.innerHTML += "<br />";
		}
		return self;
	};

	return self;
}
