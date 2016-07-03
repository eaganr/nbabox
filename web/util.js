function hexColorDelta(hex1, hex2) {
    if(hex1 === undefined || hex2 === undefined) return 0;
    hex1 = hex1.substring(1);
    hex2 = hex2.substring(1);
    // get red/green/blue int values of hex1
    var r1 = parseInt(hex1.substring(0, 2), 16);
    var g1 = parseInt(hex1.substring(2, 4), 16);
    var b1 = parseInt(hex1.substring(4, 6), 16);
    // get red/green/blue int values of hex2
    var r2 = parseInt(hex2.substring(0, 2), 16);
    var g2 = parseInt(hex2.substring(2, 4), 16);
    var b2 = parseInt(hex2.substring(4, 6), 16);
    // calculate differences between reds, greens and blues
    var r = 255 - Math.abs(r1 - r2);
    var g = 255 - Math.abs(g1 - g2);
    var b = 255 - Math.abs(b1 - b2);
    // limit differences between 0 and 1
    r /= 255;
    g /= 255;
    b /= 255;
    // 0 means opposit colors, 1 means same colors
    return (r + g + b) / 3;
}


var teamcolors = function(val, color2) {
    var color;
    for(var i=0;i<teams.length;i++) {
      if(teams[i].abbreviation === val) color = "#"+teams[i]["color"];
    }
    if(color2) {
      var diff = hexColorDelta(color, color2);
      if(diff > 0.8) {
        for(var i=0;i<teams.length;i++) {
          if(teams[i].abbreviation === val) color = "#"+teams[i]["color2"];
        }
      }
    }
    return color? color : "black";
};
