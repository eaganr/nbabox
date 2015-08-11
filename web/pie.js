function pie(selector, data, value, diff, label) {	
  var self = this;
	self.value = value;
	self.diff = diff;
	self.data=[];
	for(var i=0;i<data.length;i++) {
		if(data[i][self.value] >0) self.data.push(data[i]);
	}
	self.selector=selector;

	self.w=400,
	self.h=300,
	self.radius= Math.min(self.w, self.h) / 2;

	self.label=label? label : function(d) { return d.data[self.value]; }

	self.color = d3.scale.category20();
	self.arc = d3.svg.arc()
		.outerRadius(self.radius -10)
		.innerRadius(0)

	self.pie = d3.layout.pie()
		.sort(null)
		.value(function(d) { return d[self.value]; });

	self.svg = d3.select(self.selector).append("svg")
		.attr("width", self.w)
		.attr("height", self.h)
		.append("g")
		.attr("transform", "translate(" + self.w /2 + "," + self.h / 2 + ")");

	self.g = self.svg.selectAll(".arc")
		.data(self.pie(self.data))
		.enter().append("g")
		.attr("class", "arc");

	self.g.append("path")
		.attr("d", self.arc)
		.style("fill", function(d) { return self.color(d.data[diff]); });

	self.g.append("text")
		.attr("transform", function(d) { return "translate(" + self.arc.centroid(d) + ")"; })
		.attr("dy", ".35em")
		.style("text-anchor", "middle")
		.style("font-size", "10px")
		.style("z-index", "100")
		.text(self.label);

	return self;
}
