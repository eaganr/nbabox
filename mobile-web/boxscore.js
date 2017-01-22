function boxscore(id, data) {  
  var self = this;
  self.data=data;
  self.id=id;

  var table = document.createElement("table");
  table.className = "box-table";
  table.setAttribute("cellspacing",0);
  var stats = {first_name:"Player",
               minutes:"Min",
               points:"Pts",
               field_goals_made:"FGM/A",
               three_pointers_made:"3PM/A",
               free_throws_made:"FTM/A",
               rebounds_offensive:"OfR",
               rebounds_defensive:"DeR",
               total_rebounds:"Rebs",
               assists:"Ast",
               steals:"Stl",
               blocks:"Blk",
               turnovers:"TO",
               fouls:"PF",
               plus_minus:"+/-"
              };
  var header = document.createElement("tr");
  var th;
  for(var k in stats) {
      th = document.createElement("th");
      th.innerHTML = stats[k];
      header.appendChild(th);
  }
  table.appendChild(header);

  var tr;
  var td;
  for(var i=0;i<data.length;i++) {
    var player = data[i];
    tr = document.createElement("tr");
    for(var k in stats) {
      //modify and format      
      var val = player[k];
      if(k === "minutes") val = player[k]+":"+(player["seconds"].length > 1 ? player["seconds"] : "0"+player["seconds"]);
      if(k === "points") val = " "+player[k]+" ";
      if(k === "first_name") {
				val = (player[k] + " " + player["last_name"]).substring(0,18);
				val = val.split(" ")[0] + " " + val.split(" ")[1];
			}
      if(k === "field_goals_made") val = player[k]+"-"+player["field_goals_attempted"];
      if(k === "three_pointers_made") val = player[k]+"-"+player["three_pointers_attempted"];
      if(k === "free_throws_made") val = player[k]+"-"+player["free_throws_attempted"];
      if(k === "total_rebounds") val = parseInt(player["rebounds_offensive"]) + parseInt(player["rebounds_defensive"]);
			if(k === "plus_minus") val = (parseInt(player[k]) > 0? "+" : "") + player[k];
      td = document.createElement("td");
      td.innerHTML = val!==null ? val : 0;
      tr.appendChild(td);
    }
    table.appendChild(tr);
  }
  document.getElementById(self.id).innerHTML = "";
  document.getElementById(self.id).appendChild(table);
  return self;
}
