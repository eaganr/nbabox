function pie(selector, data) {	
  var self = this;
	self.data=data;
	self.selector=selector;

	self.w=960,
	self.h=300,
	self.radius= Math.min(self.w, self.h) / 2;

	self.color = d3.scale.ordinal()
		.range(["#ff0000", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ffaaaa"]);
	self.arc = d3.svg.arc()
		.outerRadius(self.radius -10)
		.innerRadius(0)

	self.pie = d3.layout.pie()
		.sort(null)
		.value(function(d) { return d.points; });

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
		.style("fill", function(d) { return self.color(d.data.points); });

	self.g.append("text")
		.attr("transform", function(d) { return "translate(" + self.arc.centroid(d) + ")"; })
		.attr("dy", ".35em")
		.style("text-anchor", "middle")
		.style("font-size", "10px")
		.style("z-index", "100")
		.text(function(d) { return d.data.player + " - " + d.data.points; });

	return self;
}
