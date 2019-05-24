// this is for vmt data

var gridnode = find_grid_by_name('vmt');
var cogo_id = '#' + gridnode.id; // "#plot1";
var cogo_pin_id = '#' + gridnode.pinid;

var cogo_layer = null;



var cogo_margin = { top: 20, right: 5, bottom: 90, left: 30 }; // bottom incl. legend and text
var cogo_color = d3.scale.ordinal()
    .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

var cogo_width, cogo_height, cogo_x, cogo_y, cogo_xAxis, cogo_yAxis;


// cogo_svg = d3.select(cogo_id).append("svg");

// cogo_svgg = cogo_svg
//     .append("g")
//     .attr("transform", "translate(" + cogo_margin.left + "," + cogo_margin.top + ")");

// cogo_hoverInfo = cogo_svgg.append("g").append('text');


cogo_width = $(cogo_id).width() - cogo_margin.left - cogo_margin.right;
cogo_height = $(cogo_id).height() - cogo_margin.top - cogo_margin.bottom;


var data = [9524.4, 0, 9231.9, 9514.7, 9482.8];

var width = cogo_width,
    Height = cogo_height,
    barHeight = Height / 5 - 20;



var y = d3.scale.linear()
    .domain([0, d3.max(data)])
    .range([Height, 20]);

var x = d3.scale.ordinal()
    .domain(["2013", "2014", "2015", "2016", "2017"])
    .rangeRoundBands([0, $(cogo_id).width()], 1);

var chart = d3.select(cogo_id).append("svg")
    .attr("width", $(cogo_id).width())
    .attr("height", $(cogo_id).height());

var barWidth = width / data.length;

var bar = chart.selectAll("g")
    .data(data)
    .enter().append("g")
    .attr("transform", function (d, i) { return "translate(" + i * barWidth + ",0)"; });

bar.append("rect")
    .attr("y", function (d) { return y(d); })
    .attr("height", function (d) { return Height - y(d); })
    .attr("width", barWidth - 1)
    .style("fill", "steelblue");

bar.append("text")
    .attr("x", barWidth / 2)
    .attr("y", function (d) { return y(d) + 3; })
    .attr("dy", ".75em")
    .text(function (d) { return d; });


var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");
var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");
bar.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + Height + ")")
    .call(xAxis);
bar.append("g")
    .attr("class", "y axis")
    .call(yAxis);