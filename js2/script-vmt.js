// this is for vmt data

var gridnode = find_grid_by_name('vmt');
var cogo_id = '#' + gridnode.id; // "#plot1";
var cogo_pin_id = '#' + gridnode.pinid;

var cogo_layer = null;

var format_date_wmdh = d3.time.format("%a %b %d %I %p"); // Format hover date text
var cogo_parseDate = d3.time.format("%Y-%m-%d %I:%M:%S %p").parse;

var cogo_margin = { top: 20, right: 5, bottom: 90, left: 30 }; // bottom incl. legend and text
var cogo_color = d3.scale.ordinal()
    .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

var cogo_width, cogo_height, cogo_x, cogo_y, cogo_xAxis, cogo_yAxis;

var cogo_data = null;
var cogo_svg = null;
var cogo_svgg = null;
var cogo_station;
var cogo_legend;
var cogo_hoverLine;
var cogo_hoverInfo;
var cogo_pinned = false;
var cogo_gg = null;

// cogo_svg = d3.select(cogo_id).append("svg");

// cogo_svgg = cogo_svg
//     .append("g")
//     .attr("transform", "translate(" + cogo_margin.left + "," + cogo_margin.top + ")");

// cogo_hoverInfo = cogo_svgg.append("g").append('text');


cogo_width = $(cogo_id).width() - cogo_margin.left - cogo_margin.right;
cogo_height = $(cogo_id).height() - cogo_margin.top - cogo_margin.bottom;
// cogo_width = $(cogo_id).width() ;
// cogo_height = $(cogo_id).height() ;

// cogo_svg
//     .attr("width", $(cogo_id).width())
//     .attr("height", $(cogo_id).height() - 35);

// cogo_x = d3.scale.ordinal()
//     .rangeRoundBands([0, cogo_width], .1);
// cogo_xAxis = d3.svg.axis()
//     .scale(cogo_x)
//     .orient("bottom");

// cogo_y = d3.scale.linear()
//     .rangeRound([cogo_height, 0]);
// cogo_yAxis = d3.svg.axis()
//     .scale(cogo_y)
//     .orient("left")
//     .ticks(4)
//     .tickFormat(d3.format(".2s"));

var data = [9524.4, 0, 9231.9, 9514.7, 9482.8];

var width = cogo_width,
    Height = cogo_height,
    barHeight = Height / 5 - 20;

// var x = d3.scale.linear()
//     .domain([0, d3.max(data)])
//     .range([0, width-30]);

// var chart = d3.select(cogo_id).append("svg")
//     .attr("width",  $(cogo_id).width())
//     .attr("height", $(cogo_id).height() );

// var bar = chart.selectAll("g")
//     .data(data)
//     .enter().append("g")
//     .attr("transform", function (d, i) { return "translate(0," + i * barHeight + ")"; });

// bar.append("rect")
//     .attr("width", x)
//     .attr("height", barHeight - 1)
//     .style("fill","purple");

// bar.append("text")
//     .attr("x", function (d) { return x(d) + 3; })
//     .attr("y", barHeight / 2)
//     .attr("dy", ".35em")
//     .text(function (d) { return d; })
//     .style("fill","red");

var y = d3.scale.linear()
    .domain([0, d3.max(data)])
    .range([Height, 20]);

var x = d3.scale.linear()
    .domain([2013, 2017])
    .range([2013, 2017]);

var chart = d3.select(cogo_id).append("svg")
    .attr("width", $(cogo_id).width())
    .attr("height", $(cogo_id).height());

var barWidth = width / data.length;

var bar = chart.selectAll("g")
    .data(data)
    .enter().append("g")
    .attr("transform", function (d, i) { return "translate(" + i * barWidth + ",0)"; });
var x = y(data);
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
bar.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(" + Height + ",0)")
    .call(xAxis);