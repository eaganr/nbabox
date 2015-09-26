function boxscore(id, data) {  
  var self = this;
  self.data=data;
  self.id=id;

  var table = document.createElement("table");
  table.setAttribute("cellspacing",0);
  var stats = {playerName:"Player",
               mIN:"Min",
               fGM:"FGM-A",
               fG3M:"3PM-A",
               pTS:"Pts",
               rEB:"Reb",
               aST:"Ast",
               sTL:"Stl",
               bLK:"Blk",
               tO:"TO",
               pF:"PF",
               plusMinus:"+/-"
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
      if(k === "fGM") player[k] = (player[k]? player[k] : 0)+"-"+(player["fGA"]? player["fGA"] : 0);
      if(k === "fG3M") player[k] = (player[k]? player[k] : 0)+"-"+(player["fG3A"]? player["fG3A"] : 0);

      td = document.createElement("td");
      td.innerHTML = player[k]!==null ? player[k] : 0;
      tr.appendChild(td);
    }
    table.appendChild(tr);
  }
  document.getElementById(self.id).appendChild(table);
  return self;
}
