function boxscore(id, data) {  
  var self = this;
  self.data=data;
  self.id=id;

  var table = document.createElement("table");
  table.setAttribute("cellspacing",0);
  var stats = {first_name:"Player",
               minutes:"Min",
               field_goals_made:"FGM-A",
               three_pointers_made:"3PM-A",
               points:"Pts",
               rebounds_offensive:"Reb",
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
      if(k === "first_name") player[k] = player[k] + " " + player["last_name"];
      if(k === "field_goals_made") player[k] = player[k]+"-"+player["field_goals_attempted"];
      if(k === "three_pointers_made") player[k] = player[k]+"-"+player["three_pointers_attempted"];
      td = document.createElement("td");
      td.innerHTML = player[k]!==null ? player[k] : 0;
      tr.appendChild(td);
    }
    table.appendChild(tr);
  }
  document.getElementById(self.id).appendChild(table);
  return self;
}
