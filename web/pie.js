function pie(selector) {	
  var self = this;
	self.value=function(v) {
		if(v) {
			self.value.val = v;
			return self;
		}
		return self.value.val;
	};

	self.diff=function(d) {
		if(d) {
			self.diff.val=d;
			//sort data according to diff
			var dat = self.data();
			var sorted = 0; 
			for(var i=0;i<dat.length;i++) {
				if(dat[i][self.diff()] < dat[sorted][self.diff()]) {
					var temp = dat[sorted];
					dat[sorted] = dat[i];
					dat[i] = temp;
					sorted = 0;
					i = sorted+1;
				}
			}

			return self;
		}
		return self.diff.val ? self.diff.val : self.value();
	};

	self.data=function(d) {
		if(d) {
			self.total=0;
			self.data.val=[];
			for(var i=0;i<d.length;i++) {
				if(d[i][self.value()] >0) self.data.val.push(d[i]);
				self.total+=d[i][self.value()];
			}
			return self;
		}
		return self.data.val;
	};

	self.selector = function(s) {
		if(s) {
			self.selector.val=s;
			return self;
		}
		return self.selector.val;
	};
	if(selector) self.selector.val = selector;

	self.w=function(w) {
		if(w) {
			self.w.val=w;
			return self;
		}
		return self.w.val? self.w.val : 320;
	};

	self.h=function(h) {
		if(h) {
			self.h.val=h;
			return self;
		}
		return self.h.val? self.h.val : 320;
	};

	self.radius=function() {
		 return Math.min(self.w(), self.h()) / 2;
	};

	self.label=function(l) {
		if(l) {
			self.label.val=l;
			return self;
		}
		return self.label.val ? self.label.val : function(d) { return d.data[self.value()]; };
	};

	self.title=function(t) {
		if(t) {
			self.title.val=t;
			return self;
		}
		return self.title.val ? self.title.val : self.value();
	}

	self.color=function(c,reset) {
		if(reset) {
			self.color.val=c;
			return self;
		}
		var val = self.color.val ? self.color.val(c) : d3.scale.category20()(c);
		if(!self.color.color1) self.color.color1=val;
		else {
			var diff = hexColorDelta(self.color.color1.substring(1), val.substring(1));
			console.log(diff);
			if(diff > 0.8) {
				 val = self.color.val(c, true);
			}
		}
		return val;
	};
	self.color.val=d3.scale.category20();
	self.color.color1="";

	function hexColorDelta(hex1, hex2) {
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


	self.arc=function() {
		var arc=d3.svg.arc()
			.outerRadius(self.radius() -20)
			.innerRadius(0)
		return arc;
	};

	self.pie=function(data) {
		var p=d3.layout.pie()
			.sort(null)
			.value(function(d) { return d[self.value()]; });
		return p(data);
	};

	self.draw=function() {
		self.svg = d3.select(self.selector()).append("svg")
			.attr("width", self.w()*1.2)
			.attr("height", self.h()*1.2)
			.append("g")
			.attr("transform", "translate(" + self.w() /2 + "," + self.h() / 2 + ")");

		self.title = self.svg.append("text")
			.attr("transform", "translate(" + 0 + "," + (self.h()/-2+5) + ")")
			.attr("dy", ".35em")
			.style("text-anchor", "middle")
			.style("font-size", "15px")
			.attr("dy", ".35em")
      .style("text-anchor", "middle")
      .style("font-size", "15px")
			.style("z-index", "100")
			.text(self.title());

		self.g = self.svg.selectAll(".arc")
			.data(self.pie(self.data()))
			.enter().append("g")
			.attr("class", "arc");

		self.g.append("path")
			.attr("d", self.arc())
			.style("fill", function(d) { return self.color(d.data[self.diff()]); })
			.on("mouseover",function(d) {
				self.svg.select(".label[diff=\""+d.data[self.diff()]+"\"]")
					.attr("opacity",100);
			})
			.on("mouseout",function(d) {
				self.svg.select(".label[diff=\""+d.data[self.diff()]+"\"]")
					.attr("opacity",self.data().length < 5 || d.data[self.value()] > self.total / 7? 100 : 0);
			});
	
		self.svg.selectAll(".label")
			.data(self.pie(self.data()))
			.enter().append("text")
			.attr("transform", function(d) { return "translate(" + self.arc().centroid(d) + ")"; })
			.attr("diff",function(d) { return d.data[self.diff()]})
			.attr("dy", ".35em")
			.attr("class", "label")
			.attr("fill", function(d) { 
				var c = self.color(d.data[self.diff()]).substring(1);
				if(hexColorDelta("ffffff", c) > 0.5) return "#000000";
				return "#ffffff";
			})
			.attr("opacity",function(d) { 
				if(self.data().length < 5 || d.data[self.value()] > self.total / 7) return 100;
				else return 0;
			})
			.style("text-anchor", "middle")
			.style("font-size", "10px")
			.style("z-index", "100")
			.text(self.label());

		return self;
	};

	return self;
}
