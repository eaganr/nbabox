function boxscore(id, data) {  
  var self = this;
  self.data=data;
  self.id=id;

  var table = document.createElement("table");
  table.setAttribute("cellspacing",0);
  var stats = {5:"Player",
               8:"Min",
               9:"FGM-A",
               12:"3PM-A",
               26:"Pts",
               20:"Reb",
               21:"Ast",
               22:"Stl",
               23:"Blk",
               24:"TO",
               25:"PF",
               27:"+/-"
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
      if(k === "9") player[k] = (player[k]? player[k] : 0)+"-"+(player[10]? player[10] : 0);
      if(k === "12") player[k] = (player[k]? player[k] : 0)+"-"+(player[13]? player[13] : 0);

      td = document.createElement("td");
      td.innerHTML = player[k]!==null ? player[k] : 0;
      tr.appendChild(td);
    }
    table.appendChild(tr);
  }
  document.getElementById(self.id).appendChild(table);
  return self;
}
