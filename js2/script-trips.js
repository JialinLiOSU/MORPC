//$("#trips-title").text("Trips (minutes)");

var gridnode = find_grid_by_name('trips');
var trips_id = '#' + gridnode.id; // "#plot6";
var trips_pin_id = '#' + gridnode.pinid;

var parseDate = d3.time.format("%Y-%m-%d %H").parse;
var datetimeformat2 = d3.time.format("%a"); // %d");
var datetimeformat3 = d3.time.format("%a %I%p");
var formatWholeInt = d3.format("0f");
var trips_margin = {top: 15, right: 5, bottom: 30, left: 5}
var trips_width, trips_height;
var trips_svg;
var trips_name_labels = null;
var trips_pinned =false;
var trips_gg = null;

var routes_join_fields;
var dataByTrip;
var trips2_data;
var bisect;
var date0, date1;

trips_svg = d3.select(trips_id).append("svg");

trips_init(0);

function trips_init(init_state) {
    if (init_state==0) {
        $.ajax({
            type: "GET",
            // url: "http://gis.osu.edu/misc/trips/get-trip-info2.php",
            url: "http://curio.osu.edu/trips",
            success: handletripinfo2
        });
    }
}

// we just set up the data here
// drawing is in another function called here
function handletripinfo2(result, status) {
    trips2_data = d3.tsv.parse(result);

    //d3.tsv("trips-driving-guess.tsv", function(error, data) {

    trips2_data.forEach(function(d, i) {
    	d.date = parseDate(d.date);   // text -> date
    	d.duration = +d.duration/60;  // seconds -> minutes
    });

    // this gets data to different brackets, each is an array elem.
    dataByTrip = d3.nest()
    	.key(function(d) { return d.trip; })
    	.map(trips2_data);

    routes_join_fields = {};
    i = 0;
    $.each(dataByTrip, function(key, value) {
    	routes_join_fields[key] = {"data_id": i };         //
    	i++;
    });

    // alert("good: " + dataByTrip['OSU to Dublin']);
    // alert(dataByTrip['OSU to Dublin'][0].date + " " + dataByTrip['OSU to Dublin'][0].duration);

    bisect = d3.bisector(function(d) { return d.date; }).left;
	date0 = d3.min(dataByTrip['OSU to Dublin'], function(d) { return d.date; });
	date1 = d3.max(dataByTrip['OSU to Dublin'], function(d) { return d.date; });
    //alert("From " + date0 + " to " + date1);

    //alert(Object.keys(dataByTrip));

    var evt = $.Event('completeTrips');
    evt.detail = 'max';
    $(window).trigger(evt);

    draw_trips(0);

}

var gTrip;

function draw_trips(s) {
    // Setting up
	trips_width = $(trips_id).width() - trips_margin.left - trips_margin.right;
    trips_height = $(trips_id).height() - 35 - trips_margin.bottom - trips_margin.top;
    // trips_width = 230 - trips_margin.left - trips_margin.right;
	// trips_height = 200 - trips_margin.bottom - trips_margin.top;

    trips_svg
        .attr("width", $(trips_id).width())
        .attr("height", $(trips_id).height()-35);

    var x0 = d3.scale.ordinal()
    	.domain(Object.keys(dataByTrip))  // use the keys to set number of sub-plots on x
    	.rangeBands([0, trips_width], .1, 0);

    var x1 = d3.time.scale()
    	.domain([date0, date1])
    	.range([0, x0.rangeBand()]);

    if (s==0) {
        trips_svg
        	.data([{}])  // create an ampty array of dictionary
        	.each(function(d, i) { d.primary = new Function("d", "return d.duration;"); d.secondary = null; });

        trips_gg = trips_svg.append("g")
            .on("mouseenter", function(d, i) {
                if (!trips_pinned)
                    map.addLayer(routes_layer);})
            .on("mouseleave", function(d, i) {
                if (!trips_pinned)
                    map.removeLayer(routes_layer);})
            ;

        // strange that trips_gg doesn't need a rect. there is original a rect so that's maybe why...

        trips_gg.append("g")
        	.selectAll("g")
        	.data(x0.domain())
        	.enter().append("g")
        	.attr("class", "g-bracket")
        	.attr("transform", function(d) { return "translate(" + x0(d) + ",0)"; });
            // make parallel plots (or will stack)

        trips_svg.each(function(chart, i) {
        	var svgx = d3.select(this);
            var gChart = d3.select(this).select("g");

        	var format = formatWholeInt;

        	var y = d3.scale.linear()
        	    .domain([0.45*d3.min(trips2_data, function(d) { return d.duration; }),
        		     d3.max(trips2_data, function(d) { return d.duration; })])
        	    .range([trips_height, 0]);

            // if (s==0)
        	var yAxis = d3.svg.axis()
        	    .scale(y)
        	    .orient("left")
        	    .tickValues(d3.range(.05, 1, .05))
        	    .tickSize(-x0.rangeBand())
        	    .tickFormat("");

        	var area = d3.svg.area()
        	    .x(function(d) { return x1(d.date); })
        	    .y0(trips_height)
        	    .y1(function(d) { return y(d.primary); });

        	var h = Math.round(y(
        	    d3.max(trips2_data, chart.secondary ?
        		   function(d) { return Math.max(chart.primary(d), chart.secondary(d)); }
        		   : chart.primary)));

        	svgx.attr("height", (trips_height - h) + trips_margin.top + trips_margin.bottom);
        	gChart.attr("transform", "translate(" + trips_margin.left + "," + (trips_margin.top - h + .5) + ")");

        	var y0 = h = trips_height;

        	var line = d3.svg.line()
        	    .x(function(d) { return x1(d.date); });

        	// sv eglements with data
        	gTrip = gChart.selectAll(".g-bracket")
        	    .datum(function(trip) {
            		return dataByTrip[trip].map(function(d, i) {
            		    return {
            			date: d.date, //new Date(d.date, 0, 1),
            			primary: chart.primary(d),
            			secondary: chart.secondary ? chart.secondary(d) : undefined
            		    };
            		});
        	    });

        	gTrip.append("path")
        	    .attr("class", "g-area")
        	    .attr("d", area);

        	gTrip.append("g")
        	    .attr("class", "g-y g-axis")
        	    .call(yAxis);

        	gTrip.append("g")
        	    .attr("class", "g-x g-axis")
        	    .append("line")
        	    .attr("x2", x0.rangeBand())
        	    .attr("y1", y0)
        	    .attr("y2", y0);

        	gTrip.append("path")
        	    .attr("class", "g-line g-primary")
        	    .attr("d", line.y(function(d) { return y(d.primary); }));

        	var circles = gTrip.append("circle")
        	    .attr("class", "g-value g-primary")
        	    .attr("transform", function(d) { return "translate(" +
        					     x1(d[d.length - 1].date) + "," +
        					     y(d[d.length - 1].primary) + ")"; })
        	    .attr("r", 3)
        	    // .style("fill", "red")  // set later
        	    .style("display", "none");

        	//tripkeys = Object.keys(dataByTrip);

        	date1 = d3.max(dataByTrip['OSU to Dublin'], function(d) {
        	    return d.date; });

        	trips_name_labels = gTrip.append("text") // add subtitle for each graph
        	    .attr("y", trips_height)
        	    .attr("dy", "-2.5em")
        	    .attr("x", x0.rangeBand()/2)
        	    .style("font-size", "10px")
                    .style("fill", "#aaa")
        	    .text(function(d, i) { return Object.keys(dataByTrip)[i]; })
        	    .call(wrap, x0.rangeBand())
        	;

        	gTrip.append("text")
        	    .attr("class", "g-label-value g-start")
        	    .call(valueLabel, date0);

        	gTrip.append("text")
        	    .attr("class", "g-label-value g-end")
        	    .call(valueLabel, date1);

        	gTrip.append("text")
        	    .attr("class", "g-label-year g-start")
        	    .attr("dy", ".71em")
        	    .call(dateLabel, date0);

        	gTrip.append("text")
        	    .attr("class", "g-label-year g-end")
        	    .attr("dy", ".71em")
        	    .call(dateLabel, date1);

        	gTrip.append("rect")
        	    .attr("class", "g-overlay")
        	    .attr("x", -4)
        	    .attr("width", x0.rangeBand() + 8)
        	    .attr("height", trips_height + 18)
        	    .on("mouseover", mouseover)
        	    .on("mousemove", mousemove)
        	    .on("mouseout", mouseout);

        	function mouseover(d, i) {
        	    gTrip.selectAll(".g-end").style("display", "none");
        	    gTrip.selectAll(".g-value").style("display", null);
        	    mousemove.call(this);
        	    ll_id = routes_join_fields[Object.keys(dataByTrip)[i]].ll_id;
        	    //alert(Object.keys(dataByTrip)[i] + ", " + d + " " + i + " " + ll_id);
        	    var layer = routes_layer.getLayer(ll_id); //find a layer using id
        	    layer.fireEvent('mouseover');
        	    trips_name_labels.style("fill", function(d, ii) {return ii==i? "#111" : "#aaa";});
        	}

        	function mousemove(d, i) {
        	    var date = x1.invert(d3.mouse(this)[0]);
        	    gTrip.selectAll(".g-label-value.g-start").call(valueLabel, date);
        	    gTrip.selectAll(".g-label-year.g-start").call(dateLabel, date, true);
        	    circles.attr("transform", function(d) {
            		var v = d[bisect(d, date, 0, d.length - 1)],
            		    k = d3.select(this).classed("g-primary") ? "primary" : "secondary";
            		return "translate(" + x1(v.date) + "," + y(v[k]) + ")"; })
        	    .style("fill", function(d, ii) { return ii==i?"#9f9":"#f99";});
        	}

        	function mouseout(d, i) {
        	    gTrip.selectAll(".g-end").style("display", null);
        	    gTrip.selectAll(".g-label-value.g-start").call(valueLabel, date0);
        	    gTrip.selectAll(".g-label-year.g-start").call(dateLabel, date0);
        	    gTrip.selectAll(".g-label-year.g-end").call(dateLabel, date1);
        	    circles.style("display", "none");
        	    ll_id = routes_join_fields[Object.keys(dataByTrip)[i]].ll_id;
        	    var layer = routes_layer.getLayer(ll_id); //find a layer using id
        	    layer.fireEvent('mouseout');
        	    trips_name_labels.style("fill", "#aaa");
        	    circles.style("fill", "#f99");
        	}

        	function valueLabel(text, date) {
        	    var x2 = d3.scale.linear().domain(x1.range());

        	    text.each(function(d) {
            		var text = d3.select(this),
            		    i = bisect(d, date, 0, d.length - 1),
            		    j = Math.round(i / (d.length - 1) * (d.length - 12)),
            		    v = d[i],
            		    x = x1(v.date),
            		    primary = "primary",
            		    secondary = "secondary",
            		    max = "max";

            		if (text.classed("g-secondary")) {
            		    primary = "secondary";
            		    secondary = "primary";
            		}

            		if (v[primary] < v[secondary] && v[primary] > .04) {
            		    max = "min";
            		    text.attr("dy", "1em").attr("y", 4);
            		} else {
            		    text.attr("dy", null).attr("y", -4);
            		}

            		text.text(formatWholeInt(v[primary]))
            		    .attr("transform", "translate("
            			  + x2.range([0, x0.rangeBand() - this.getComputedTextLength()])(x) + ","
            			  + (y(d3[max](d.slice(j, j + 12), function(d) { return d[primary]; })))
            			  + ")");
        	    });
        	}

        	function dateLabel(text, date, hover) {
        	    var x2 = d3.scale.linear().domain(x1.range());
        	    text.each(function(d) {
            		var v = d[bisect(d, date, 0, d.length - 1)],
            		    x = x1(v.date);
            		d3.select(this)
            		    .text(hover?datetimeformat3(v.date):datetimeformat2(v.date))
            		    .attr("transform", "translate(" +
            			  x2.range([0, x0.rangeBand() - this.getComputedTextLength()])(x) +
            			  "," + (h + 6) + ")")
            		    .style("display", hover || v.primary >= 0 ? null : "none");
        	    });
        	}
        });   // trips_svg.foreach
    } // if (s==0)



    //////////////////////////////////////////// MAPPING ///////////////////

    // create a dictionary-like hash table to store the ids
    // joined by a key
    // in this case, the key is just the id, that exists in both data and geojson

    if (s==0) {
    // get the geojson layer for the cities
    d3.json("data/routes.geojson", function(error, data) {
    	// first needs to ensure an id in each feature, this will overwrite id if existed
    	data.features.forEach(function(d, i) {
    	    d.properties.id = i;
    	});
    	routes_layer = L.geoJson(data, {
    	    style: function (feature) {
        		edgeColor = "#F77";
        		return {
        		    color: edgeColor,
        		    opacity: 1,
        		    weight: 4
        		};
            },
    	    onEachFeature: onEachRouteFeature
        	});
    });
}

    function onEachRouteFeature(feature, layer) {
    	id = L.stamp(layer); // assign id to the layer and return it. Better than the above line
    	routes_join_fields[feature.properties.name]["ll_id"] = id;
    	layer.on({
    	    mouseover: function(e) {
        		i = feature.properties.id;
        		var l = e.target;
        		l.setStyle({
        		    weight: 13
        		    // color: '#9f9'
        		});
        		if (!L.Browser.ie && !L.Browser.opera) {
        		    // l.bringToFront();
        		}
        		id = routes_join_fields[feature.properties.name].data_id;
        		trips_name_labels.style("fill", function(d, ii) {return ii==id? "#111" : "#aaa";});
    	    },
    	    mouseout: function(e) {
        		routes_layer.resetStyle(e.target);
        		trips_name_labels.style("fill", "#aaa");
    	    }
    	});
    }

}


// https://bl.ocks.org/mbostock/7555321
function wrap(text, width) {
    text.each(function() {
	var text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.1, // ems
            y = text.attr("y"),
            dy = parseFloat(text.attr("dy")),
            tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
	while (word = words.pop()) {
	    line.push(word);
	    tspan.text(line.join(" "));
	    if (tspan.node().getComputedTextLength() > width) {
		line.pop();
		tspan.text(line.join(" "));
		line = [word];
		tspan = text.
		    append("tspan").
		    attr("x", 0).
		    attr("y", y).
		    attr("dy", ++lineNumber * lineHeight + dy + "em").
		    text(word);
	    }
	}
    });
}

$(trips_pin_id).click(function() {
    $(this).toggleClass("highlight");
    if ($(this).attr("class").includes("highlight")) {
	   map.addLayer(routes_layer);
       trips_pinned = true;
    }
    else {
        map.removeLayer(routes_layer);
        trips_pinned = false;
    }
});
