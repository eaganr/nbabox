function lineups() {
	var self = this;
	var sort;
	var negsort;

	self.data=function(d) {
		if(d) {
			self.data.val=d;
			if(sort) self.sortby(sort, negsort);
			else {
				self.sortby("num");
			}
			return self;
		}
		return self.data.val;
	}

	self.color=function(c) {
		if(c) {
			self.color.val = c;
			return self;
		}
		return self.color.val;
	}

	self.sortby=function(val, neg) {
		sort = val;
		negsort = neg;
		var d = self.data();
		d = d.sort(function(a,b) {
			if(neg) return a[val] - b[val];
			return b[val] - a[val];
		});
		self.data.val=d;
		return self;
	}

	self.limit=function(l) {
		if(!self.limit.val) self.limit.val = 3;
		if(l) {
			self.limit.val += l;
			if(self.limit.val < 3) self.limit.val = 3;
			if(self.limit.val > self.data().length) self.limit.val = self.data().length;
			return self;
		}
		return self.limit.val;
	}


  self.id=function(i) {
    if(i) {
      self.id.val=i;
      return self;
    }
    return self.id.val;
  }

	self.draw=function() {
		var div = document.getElementById(self.id());
		div.innerHTML = "";
		for(var i=0;i<self.data().length && i<=self.limit()-1;i++) {
			var line = self.data()[i];
			var row = document.createElement("div");
			row.className = "lineup";
			for(var n=0;n<5;n++) {
				var player = document.createElement("div");
				player.className = "lineup-player";

				var pic = document.createElement("img");
				pic.className = "lineup-pic";
				var pname = document.createElement("span");
				pname.className = "lineup-name";
				pname.innerHTML = "unknown";

				if(line["players"].length > n) {
					pic.src = "img/players/"+line["players"][n]["player_code"]+".png"
          pic.setAttribute("player_code", line["players"][n]["player_code"]);
          pic.onerror = function() {
					  this.src = "http://i.cdn.turner.com/nba/nba/.element/img/2.0/sect/statscube/players/large/"+this.getAttribute("player_code")+".png"

            //server to save
            $.ajax({
                type : 'POST',
                url : 'http://eaganr.com:3000',           
                data: {
                  func: "savePlayerPic",
                  code : this.getAttribute("player_code"),
                },
                success:function (data) {
                  console.log("success");  
                }
            });

          };
					pname.innerHTML = line["players"][n]["playername"];
				}

				player.appendChild(pic);
				player.appendChild(pname);
				row.appendChild(player);
			}
			
			var used = document.createElement("div");
			used.className = "lineup-used";
			used.innerHTML = i === 0 ? '<div class="sort-btn" key="num">Used</div>': '<div style="opacity:0">Used</div>';
			if(i === 0 && sort === "num") used.innerHTML += '<img class="arrow" src="img/'+(negsort? "up" : "down") + '.png" width="20" height="20" />';
			used.innerHTML += "<br />";
			used.innerHTML += line["num"];

			//calculate mins from seconds
			var m = Math.floor(line["secs"] / 60);
			var s = line["secs"] - 60*m;
			if(s < 10) s = "0"+s;

			var mins = document.createElement("div");
			mins.className = "lineup-mins";
			mins.innerHTML = i === 0 ? '<div class="sort-btn" key="secs">Mins</div>': '<div style="opacity:0">Mins</div>';
			if(i === 0 && sort === "secs") mins.innerHTML += '<img class="arrow" src="img/'+(negsort? "up" : "down") + '.png" width="20" height="20" />';
			mins.innerHTML += "<br />";
			mins.innerHTML += m+":"+s;

			var pm = document.createElement("div");
			pm.className = "lineup-pm";
			pm.innerHTML = i === 0 ? '<div class="sort-btn" key="diff">+/-</div>': '<div style="opacity:0">+/-</div>';
			if(i === 0 && sort === "diff") pm.innerHTML += '<img class="arrow" src="img/'+(negsort? "up" : "down") + '.png" width="20" height="20" />';
			pm.innerHTML += "<br />";
			pm.innerHTML += (line["diff"] > 0 ? "+" : "")+line["diff"];

			row.appendChild(used);
			row.appendChild(mins);
			row.appendChild(pm);
			div.appendChild(row);
			d3.select("#"+self.id()).selectAll(".lineup-pic")
				.style("border-radius", "100px")
				.style("background-color", self.color());
		}
		//add buttons
		var less = document.createElement("input");
		less.className = "limit-btn";
		less.type="image";
		less.src="img/minus.svg";
		less.onclick = function() { 
			self.limit(-100);
			self.draw();
		};
		var more = document.createElement("input");
		more.className = "limit-btn";
		more.type="image";
		more.src="img/plus.svg";
		more.onclick = function() { 
			self.limit(100);
			self.draw();
		};
		if(self.limit() !== 3) div.appendChild(less);
		if(self.limit() !== self.data().length) div.appendChild(more);

		d3.select("#"+self.id()).selectAll(".sort-btn")
			.on("click", function() {
				var key = d3.select(this).attr("key");
				if(sort === key) {
					if(negsort) self.sortby(key);
					else self.sortby(key, true);
				}
				else self.sortby(key);
				self.draw();
			})
			.style("cursor", "pointer");

		return self;
	}

	return self;
}
