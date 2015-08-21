function playbyplay(id, data, homeplayers, awayplayers) {	
  var self = this;
	self.data=data;
	self.id=id;

	self.homeplayers=homeplayers.map(function(d) { return {playerName:d, pts:[], ast:[], rebs:[], mins:[]}; });
	self.awayplayers=awayplayers.map(function(d) { return {playerName:d, pts:[], ast:[], rebs:[], mins:[]}; });

	var table = document.createElement("table");
	table.setAttribute("cellspacing",0);
	var header = document.createElement("tr");
	header.innerHTML = "<th>Home Team</th><th>Time</th><th>Away Team</th>";
	table.appendChild(header);

	var tr;
	var td;
	for(var i=0;i<data.length;i++) {

		var evt = data[i];
		//create player stats
		var desc = evt.hOMEDESCRIPTION;
		var descs = ["hOMEDESCRIPTION", "vISITORDESCRIPTION"];
		var teams = [self.homeplayers, self.awayplayers];
		for(var n=0;n<descs.length;n++) {
			var desc = evt[descs[n]];
			var players = teams[n];
			if(desc !== null) {
				if(desc.indexOf("PTS)") > -1) {
					var sections = desc.split("(");
					var assisted = desc.indexOf("AST)") > -1;
					var found = 0;
					for(var j=0;j<players.length;j++) {
						if(sections[0].indexOf(players[j].playerName) > -1) {
								players[j].pts.push({time:evt.pCTIMESTRING, period:evt.pERIOD, pts:parseInt(sections[1].split("PTS)")[0])});
						}
						if(assisted) {
							if(sections[2].indexOf(players[j].playerName) > -1) {
								players[j].ast.push({time:evt.pCTIMESTRING, period:evt.pERIOD});
							}
						}	
					}
				}
				if(desc.indexOf("REBOUND") > -1) {
					for(var j=0;j<players.length;j++) {
						if(desc.indexOf(players[j].playerName) > -1) {
								players[j].rebs.push({time:evt.pCTIMESTRING, period:evt.pERIOD});
								break;
						}
					}
				}
				if(desc.indexOf("SUB:") > -1) {
					var subs = desc.split("SUB:")[1];
					for(var j=0;j<players.length;j++) {
						//in
						if(subs.split("FOR")[0].indexOf(players[j].playerName) > -1) {
							var len = players[j].mins.length;
							if(len > 0 && players[j].mins[len-1].outtime === null) {
								players[j].mins[len-1].outtime = "0:00";
								players[j].mins[len-1].outperiod = players[j].mins[len-1].inperiod;
							}
							players[j].mins.push({intime:evt.pCTIMESTRING, inperiod:evt.pERIOD, outtime:null, outperiod:null});
						}
						//out
						if(subs.split("FOR")[1].indexOf(players[j].playerName) > -1) {
							var len = players[j].mins.length;
							if(len > 0) {
								players[j].mins[len-1].outtime = evt.pCTIMESTRING;
								players[j].mins[len-1].outperiod = evt.pERIOD;
							}
							else {
								players[j].mins.push({intime:"12:00", inperiod:evt.pERIOD, outtime:evt.pCTIMESTRING, outperiod:evt.pERIOD});
							}
						}
					}
						
				}
			}
		
		}

		tr = document.createElement("tr");
		td = document.createElement("td");
		td.innerHTML = evt.hOMEDESCRIPTION;
		tr.appendChild(td);
		td = document.createElement("td");
		td.innerHTML = evt.pERIOD + " - " + evt.pCTIMESTRING;
		tr.appendChild(td);
		td = document.createElement("td");
		td.innerHTML = evt.vISITORDESCRIPTION;
		tr.appendChild(td);
		table.appendChild(tr);
	}
	document.getElementById(self.id).appendChild(table);
	return self;
}
