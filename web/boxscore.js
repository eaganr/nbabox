function boxscore(id, data) {	
  var self = this;
	self.data=data;
	self.id=id;

	var table = document.createElement("table");
	var stats = {playerName:"Player", mIN:"Min", pTS:"Pts", rEB:"Reb", aST:"Ast"};
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
			td = document.createElement("td");
			td.innerHTML = player[k]!==null ? player[k] : 0;
			tr.appendChild(td);
		}
		table.appendChild(tr);
	}
	document.getElementById(self.id).appendChild(table);
	return self;
}
