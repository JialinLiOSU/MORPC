// $("#airquality-title").text("Air Quality (PM2.5)");

var gridnode = find_grid_by_name('aq');
var aq_id = '#' + gridnode.id; // "#plot4";
var aq_pin_id = '#' + gridnode.pinid;

var parseDateaq = d3.time.format("%Y-%m-%d %H:%M:%S").parse;
var parseDateaq2 = d3.time.format("%a %b %d %Y %H:%M:%S").parse;
var formatxaq = d3.time.format("%I:%M");

// Sat Dec 09 2017 14:00:00 GMT-0500 (EST)
// %a %b %d %Y %H:%M:%S
// var parseDateaq = d3.time.format("%a %b %d %Y %H:%M:%S").parse;

//var parseDate = d3.time.format("%Y%m%d").parse;
var aq_color = d3.scale.category10(); // alert(color(0));

var aq_margin = {top: 20, right: 67, bottom: 60, left: 30};
var aq_width, aq_height;
var aq_x, aq_y, aq_xAxis, aq_yAxis, aq_line;
var aq_svg = null;
var aq_linesx = null;
var aq_lines = null;
var aq_labels = null;
var aq_join_fields = null;
var aq_pinned = false;
var aq_gg = null;
var aq_rect = null;

aq_svg = d3.select(aq_id).append("svg");
aq_svgg = aq_svg
    .append("g")
    .attr("transform", "translate(" + aq_margin.left + "," + aq_margin.top + ")");

aq_init(0);

var aq_line = d3.svg.line()
    .interpolate("basis")
    .x(function(d) { return aq_x(d.date); })
    .y(function(d) { return aq_y(d.value); });

function aq_init(init_state) {

    aq_width = $(aq_id).width() - aq_margin.left - aq_margin.right;
    aq_height = $(aq_id).height() - aq_margin.top - aq_margin.bottom;

    aq_svg
        .attr("width", $(aq_id).width())
        .attr("height", $(aq_id).height()-35);

    aq_x = d3.time.scale().range([0, aq_width]);
    aq_xAxis = d3.svg.axis()
        .scale(aq_x)
        .orient("bottom")
        .ticks(4);

    aq_y = d3.scale.linear().range([aq_height, 0]);
    aq_yAxis = d3.svg.axis()
        .scale(aq_y)
        .orient("left")
        .ticks(4);

    if (init_state==0) {
        $.ajax({
            type: "GET",
            // url: "http://gis.osu.edu/misc/airquality/query_airquality_psql.php",
            url: "http://curio.osu.edu/airquality",
            success: handleairqualityinfo
        });
    }
}

var aqsites = {};

function handleairqualityinfo(result, status) {
    aq_data = d3.tsv.parse(result);
    aq_data.forEach(function(d, i) {
        if ( ! (d.site in aqsites)) {
            aqsites[d.site] = {"coordinates": [d.lat, d.lng], "values": []};
        }
        aqsites[d.site].values.push({
            "date": parseDateaq(d.date.slice(0, 19)), // d.date,
            "value": +d.aqi
        })
    });

    aq_color.domain(d3.keys(aqsites));

    draw_aq(0);
    draw_aq_map(0);
}

// make a geojson for mapping
var aq_geojson = {
    "type": "FeatureCollection",
    "features": []
}

var aq_layer = null;

function draw_aq_map(s) {
    aq_join_fields = {};
    for (i=0; i<d3.keys(aqsites).length; i++) {
        aq_join_fields[i] = {"data_id": i};
        key = d3.keys(aqsites)[i];
        aq_geojson.features[i] = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [aqsites[key]["coordinates"][1], aqsites[key]["coordinates"][0]]
            },
            "properties": {
                "id": i,
                "site": key
            }
        };
    }

    function aq_layer_style(feature) {
    	return {
    	    radius: 4,
    	    fillColor: "#ff8888",
    	    color: "#AAA",
    	    weight: 1,
    	    opacity: 1,
    	    fillOpacity: 0.95
    	};
    }

    function onEachAqFeature(feature, layer) {
        id = L.stamp(layer); // assign id to the layer and return it. Better than the above line
    	aq_join_fields[feature.properties.id]["ll_id"] = id;
        layer.on({
            mouseover: function(e) {
                aq_svg.selectAll(".line").classed("aq_highlight", function(dd, i) {
                    return (dd == feature.properties.site); });
                layer.setStyle({
                    weight: 5,
                    color: aq_color(feature.properties.site)
                });
            },
            mouseout: function(e) {
                aq_svg.selectAll(".line").classed("aq_highlight", false); // reset lines
                layer.setStyle({
                    weight: 1,
                    color: "#AAA"
                });
            }
        });
    }

    aq_layer = L.geoJson(aq_geojson, {
    	style: aq_layer_style,
    	pointToLayer: function (feature, latlng) {
    	    return L.circleMarker(latlng);
    	},
    	onEachFeature: onEachAqFeature
    });

}


function draw_aq(s) {
    // var first_obj = aqsites[d3.keys(aqsites)[0]];
    // aq_x.domain(d3.extent(first_obj["values"], function(d) {return d.date;}));

    aq_x.domain([
    	d3.min(d3.keys(aqsites), function(key) {
    	    return d3.min(aqsites[key].values, function(v) { return v.date; }); }),
        d3.max(d3.keys(aqsites), function(key) {
    	    return d3.max(aqsites[key].values, function(v) { return v.date; }); })
    ]);
    aq_y.domain([
    	d3.min(d3.keys(aqsites), function(key) {
    	    return d3.min(aqsites[key].values, function(v) { return v.value; }); }),
        d3.max(d3.keys(aqsites), function(key) {
    	    return d3.max(aqsites[key].values, function(v) { return v.value; }); })
    ]);

    if (s == 0) {
        aq_svg
            .on("mouseenter", function(d, i) {
                if (!aq_pinned)
                    map.addLayer(aq_layer);})
            .on("mouseleave", function(d, i) {
                if (!aq_pinned)
                    map.removeLayer(aq_layer);})
            ;

        aq_svgg.append("g")
        	.attr("class", "x axis")
        	.attr("transform", "translate(0," + aq_height + ")")
        	.call(aq_xAxis);

        aq_svgg.append("g")
        	.attr("class", "y axis")
        	.call(aq_yAxis)
        	// .append("text")
        	// .attr("transform", "rotate(-90)")
        	// .attr("y", 6)
        	// .attr("dy", ".71em")
        	// .style("text-anchor", "end")
            // .style("fill", "grey")
        	// .text("Ozone Index")
            ;

        aq_gg = aq_svgg.append("g");

        aq_rect = aq_gg.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", aq_width)
            .attr("height", aq_height)
            .style("fill", "none")
            .style("pointer-events", "all")
            // .style("display", "none")
            .on("mousemove",  function (d, i) {
                    var date = aq_x.invert(d3.mouse(this)[0]);
                    aq_svg.selectAll(".aq_circles").style("display", "block").call(aq_value_circles, date);
                })
            .on("mouseout", function aq_mouseout(d, i) {
                // aq_svg.selectAll(".aq_circles").style("display", "none");
                })
            ;


    }
    else {
        aq_svg.selectAll(".x.axis").call(aq_xAxis);
        aq_svg.selectAll(".y.axis").call(aq_yAxis);
        aq_svg.selectAll(".aq_lines").remove()
    }

    // aq_gg.append("rect")
    //     .attr("x", -20)
    //     .attr("y", -20)
    //     .attr("width", aq_width+40)
    //     .attr("height", aq_height+40)
    //     .style('visibility', 'hidden')
    //     .style("pointer-events", "all")
    //     ;

    aq_lines = aq_gg.selectAll(".aq_lines")
    	.data(d3.keys(aqsites))
    	.enter().append("g")
    	.attr("class", "aq_lines")
        .style("pointer-events", "none")
        // .on("mouseover", function(d, i) {
        //     aq_svg.selectAll(".line").classed("aq_highlight", function(dd, i) {
        //         return (dd == d);
        //     });
        //     if (map.hasLayer(aq_layer)) {
        //         var ll_id = aq_join_fields[i].ll_id;
        //         var l = aq_layer.getLayer(ll_id); //find a layer using id
        //         l.setStyle({
        //             color: aq_color(d),
        //             weight: 5,
        //             // fillOpacity: 0.5,
        //             opacity: 0.8
        //         });
        //         if (!L.Browser.ie && !L.Browser.opera) {
        //             l.bringToFront();
        //         }
        //     }
        // })
        // .on("mouseout", function(d, i) {
        //     aq_svg.selectAll(".line").classed("aq_highlight", false); // reset lines
        //     if (map.hasLayer(aq_layer)) {
        //         var ll_id = aq_join_fields[i].ll_id;
        //         var l = aq_layer.getLayer(ll_id); //find a layer using id
        //         l.setStyle({
        //             color: "#AAA",
        //             weight: 1,
        //             // fillOpacity: 1,
        //             opacity: 1
        //         });
        //     }
        // })
        ;

    aq_lines.append("path")
    	.attr("class", "line")
    	.attr("d", function(d) { return aq_line(aqsites[d].values); })
    	.style("stroke", function(d) { return aq_color(d); })
        ;

    aq_lines.append("circle")
        .attr("class", "aq_circles")
        .attr("r", 4)
        .style("fill", function(d) { return aq_color(aqsites[d].name); })
        .style("stroke", "#000")
        .style("stroke-width", "none")
        .style("display", "none");

    // sort the last values and then bind them as datum for each label
    var last_aq_vals = [];
    for (d in aqsites) {
        last_aq_vals.push( {site: d, value: aqsites[d].values.slice(-1)[0].value, date: aqsites[d].values.slice(-1)[0].date });
    }
    last_aq_vals.sort(function(a, b) {return b.value - a.value; });
    last_aq_valsobj = {};
    for (i=0; i<last_aq_vals.length; i++) {
        last_aq_valsobj[last_aq_vals[i].site] = {date:last_aq_vals[i].date, value: i};
    }
    aq_labels = aq_lines.append("text")
        .attr("class", "aq_text_label")
        .style("fill", function(d) { return aq_color(d); })
        .text(function(d) { if (d.includes("Columbus")) d = "Columbus"; return d; })
        // .attr("x", 3)
    	.attr("dy", ".35em")
    	.attr("font-size", "10px")
    	// .datum(function(d) { return aqsites[d].values.slice(-1)[0] })
        .datum(function(d) { return {site:d, date:last_aq_valsobj[d].date, value:last_aq_valsobj[d].value }; })
    	// .attr("transform", function(d) { return "translate(" + aq_x(d.date) + "," + aq_y(d.value) + ")"; })
        .attr("x", function(d) { return aq_width+10 /*+aq_x(d.date)*/; })
        .attr("y", function(d) { return aq_height/2 + d.value*15; })
        .style("pointer-events", "all")
        .on("mouseover", function(d, i) {
            aq_svg.selectAll(".line").classed("aq_highlight", function(dd, i) {
                return (dd == d.site);
            });
            if (map.hasLayer(aq_layer)) {
                var ll_id = aq_join_fields[i].ll_id;
                var l = aq_layer.getLayer(ll_id); //find a layer using id
                l.setStyle({
                    color: aq_color(d.site),
                    weight: 5,
                    // fillOpacity: 0.5,
                    opacity: 0.8
                });
                if (!L.Browser.ie && !L.Browser.opera) {
                    l.bringToFront();
                }
            }
        })
        .on("mouseout", function(d, i) {
            aq_svg.selectAll(".line").classed("aq_highlight", false); // reset lines
            if (map.hasLayer(aq_layer)) {
                var ll_id = aq_join_fields[i].ll_id;
                var l = aq_layer.getLayer(ll_id); //find a layer using id
                l.setStyle({
                    color: "#AAA",
                    weight: 1,
                    // fillOpacity: 1,
                    opacity: 1
                });
            }
        })
        ;

    // aq_rect
    //     .attr("width", aq_width)
    //     .attr("height", aq_height);

    var aq_bisect = d3.bisector(function(d) { return d.date; }).right;

    function aq_value_circles(data, date) {
        // $("#debug").html("");

        data.each(function(dd, i) {
            d = aqsites[dd];
            var k = aq_bisect(d.values, date);
            if (k >= d.values.length)
                return;

            var v1 = d.values[k - 1],
                v2 = d.values[k],
                interpolate = d3.interpolateNumber(v1.value, v2.value),
                range = v2.date - v1.date,
                v = interpolate((date - v1.date) / range); // solved!

            // $("#debug").append(formatxaq(v1.date) + " " + formatxaq(date) + " " + formatxaq(v2.date) + " | " + "k=" + k + ", " + ((date % range)/range).toFixed(2) + "range=" + range + ": " + v1.value + " " + v2.value + " -> " + v + "<br/>");

            var tt = d3.select(this);
            var cur_level = get_cur_level(v, aq_bins);
            tt.attr("transform",  function() {return "translate(" + aq_x(date) + "," + aq_y(v) + ")";});
            tt.style("fill", aq_colors[cur_level]);

            if (map.hasLayer(aq_layer)) {
                ll_id = aq_join_fields[i].ll_id;
                var l = aq_layer.getLayer(ll_id); //find a layer using id
                circleSize = v/1.5;
                l.setStyle({
                    fillColor: aq_colors[cur_level],
                    radius: circleSize
                });
                if (!L.Browser.ie && !L.Browser.opera) {
                    l.bringToFront();
                }
            }
        });
    }

    aq_rect
        .attr("width", aq_width)
        .attr("height", aq_height);


    if (s==0) { // create an event
        var evt = $.Event('completeAQ');
        evt.detail = 'done';
        $(window).trigger(evt);

        var evt = $.Event('completePlot');
        evt.detail = 'air quality';
        $(window).trigger(evt);

    }

}


$(aq_pin_id).click(function() {
    $(this).toggleClass("highlight");
    if ($(this).attr("class").includes("highlight")) {
	   map.addLayer(aq_layer);
       aq_pinned = true;
    }
    else {
	   map.removeLayer(aq_layer);
       aq_pinned = false;
    }
});



// ps
// http://bl.ocks.org/zoopoetics/7684278
