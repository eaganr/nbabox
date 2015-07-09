var folder = "/root/nbabox/"


function getTimeStamp(filename) {
	var stamp = filename.substring(filename.length-17, filename.length-5);
	return stamp;
}


function toTime(dateString) {
	var year = parseInt(dateString.substring(0,4));
	var month = parseInt(dateString.substring(4,6))-1;
	var day = parseInt(dateString.substring(6,8));
	var hour = parseInt(dateString.substring(8,10));
	var minute = parseInt(dateString.substring(10,12));
	return new Date(year,month,day,hour,minute);
}


function updateCache() {
	var fs = require('fs');

	//minute check
	var files = fs.readdirSync(folder+"cache/minute");
	for(var i=0;i<files.length;i++) {
		var filename = files[i];
		var fileDate = toTime(getTimeStamp(filename));
		var thisMin = new Date();
		thisMin.setSeconds(0);
		if(thisMin - fileDate > 60000) {
			//move file to hour folder
			fs.rename(folder+"cache/minute/"+filename,
				      folder+"cache/hour/"+filename,
				      function(err) {
				      	if(err) console.log(err);
				      }
				     );
		}
	}

	//hour check
	var files = fs.readdirSync(folder+"cache/hour");
	for(var i=0;i<files.length;i++) {
		var filename = files[i];
		var fileDate = toTime(getTimeStamp(filename));
		var thisHour = new Date();
		thisHour.setMinutes(0);
		if(thisHour - fileDate > 3600000) {
			//move file to hour folder
			fs.rename(folder+"cache/hour/"+filename,
				      folder+"cache/day/"+filename,
				      function(err) {
				      	if(err) console.log(err);
				      }
				     );
		}
	}

	//day check
	var files = fs.readdirSync(folder+"cache/day");
	for(var i=0;i<files.length;i++) {
		var filename = files[i];
		var fileDate = toTime(getTimeStamp(filename));
		var thisDay = new Date();
		thisDay.setHours(0);
		if(thisDay - fileDate > 86400000) {
			//move file to hour folder
			fs.unlink(folder+"cache/day/"+filename,
				      function(err) {
				      	if(err) console.log(err);
				      }
				     );
		}
	}
}


updateCache();
