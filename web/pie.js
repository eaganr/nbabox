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
			return self;
		}
		return self.diff.val ? self.diff.val : self.value();
	};

	self.data=function(d) {
		if(d) {
			self.data.val=[];
			for(var i=0;i<d.length;i++) {
				if(d[i][self.value()] >0) self.data.val.push(d[i]);
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
		return self.w.val? self.w.val : 400;
	};

	self.h=function(h) {
		if(h) {
			self.h.val=h;
			return self;
		}
		return self.h.val? self.h.val : 300;
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

	self.color=function(c,reset) {
		if(reset) {
			self.color.val=c;
			return self;
		}
		return self.color.val ? self.color.val(c) : d3.scale.category20()(c);
	};
	self.color.val=d3.scale.category20();

	self.arc=function() {
		var arc=d3.svg.arc()
			.outerRadius(self.radius() -10)
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
			.attr("width", self.w())
			.attr("height", self.h())
			.append("g")
			.attr("transform", "translate(" + self.w() /2 + "," + self.h() / 2 + ")");

		self.g = self.svg.selectAll(".arc")
			.data(self.pie(self.data()))
			.enter().append("g")
			.attr("class", "arc");

		self.g.append("path")
			.attr("d", self.arc())
			.style("fill", function(d) { return self.color(d.data[self.diff()]); });

		self.g.append("text")
			.attr("transform", function(d) { return "translate(" + self.arc().centroid(d) + ")"; })
			.attr("dy", ".35em")
			.style("text-anchor", "middle")
			.style("font-size", "10px")
			.style("z-index", "100")
			.text(self.label());

		return self;
	};

	return self;
}
