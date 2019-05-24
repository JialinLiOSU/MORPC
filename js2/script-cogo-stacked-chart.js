// this is for cogo data
// use prefix: cogo_

var gridnode = find_grid_by_name('vmt');
var cogo_id = '#' + gridnode.id; // "#plot1";
var cogo_pin_id = '#' + gridnode.pinid;

var cogo_layer = null;

var format_date_wmdh = d3.time.format("%a %b %d %I %p"); // Format hover date text
var cogo_parseDate = d3.time.format("%Y-%m-%d %I:%M:%S %p").parse;

var cogo_margin = {top: 20, right: 5, bottom: 90, left: 30}; // bottom incl. legend and text
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

cogo_svg = d3.select(cogo_id).append("svg");

cogo_svgg = cogo_svg
    .append("g")
    .attr("transform", "translate(" + cogo_margin.left + "," + cogo_margin.top + ")");

cogo_hoverInfo = cogo_svgg.append("g").append('text');

cogo_init(0);

function cogo_init(init_state) {
    cogo_width = $(cogo_id).width() - cogo_margin.left - cogo_margin.right;
    cogo_height = $(cogo_id).height() - cogo_margin.top - cogo_margin.bottom;

    cogo_svg
        .attr("width", $(cogo_id).width())
        .attr("height", $(cogo_id).height()-35);

    cogo_x = d3.scale.ordinal()
        .rangeRoundBands([0, cogo_width], .1);
    cogo_xAxis = d3.svg.axis()
        .scale(cogo_x)
        .orient("bottom");

    cogo_y = d3.scale.linear()
        .rangeRound([cogo_height, 0]);
    cogo_yAxis = d3.svg.axis()
        .scale(cogo_y)
        .orient("left")
        .ticks(4)
        .tickFormat(d3.format(".2s"));

    // cogo_hoverLine.attr("y1", 0).attr("y2", cogo_height + 10);

    if (init_state == 0) {

        $.ajax({
            type: "GET",
            // url: "http://gis.osu.edu/misc/cogo/get-cogo.php",
            url: "http://curio.osu.edu/cogobikes",
            success: handlecogoinfo
        });
    }
}

var cogo_join_fields;

function handlecogoinfo(result, status) {

    cogo_data = JSON.parse(result);
    var currentdatetime = cogo_parseDate(cogo_data.executionTime);
    cogo_data = cogo_data.stationBeanList;

    //$("#cogo-title").text("COGO Bikes [" + format_date_wmdh(currentdatetime) + "]");

    cogo_color.domain(d3.keys(cogo_data[0]).filter(function(key) {
        return key == "availableBikes" || key == "availableDocks"; }));

    // create a dictionary-like hash table to store the ids
    // joined by a key
    // in this case, the key is just the id, that exists in both data and geojson
    cogo_join_fields = {};

    cogo_data.forEach(function(d, i) {
    	var y0 = 0;
    	d.id = i;
    	d.key = i;
    	cogo_join_fields[d.key] = {"data_id": d.id };         // if sort, key needs update
    	//    d.vals = color.domain().map(function(name) {
    	//         return {name: name, y0: y0, y1: y0 += +d[name]}; });
    	// force bikes at the bottom, and docks on the top
    	d.vals = [ {name: "availableBikes", y0: y0, y1:d.availableBikes, id: i},
    		   {name: "availableDocks", y0: d.availableBikes,
    		    y1: d.availableBikes + d.availableDocks, id:i}]
    	d.total = d.vals[d.vals.length - 1].y1;
    });

    // This part is important in setting up the data
    // It sorts the data, if necessary
    // and assign the key to each of the array items in vals

    cogo_data.sort(function(a, b) { return b.vals[0].y1 - a.vals[0].y1; });
    // Add the key item to the vals for mouse
    cogo_data.forEach(function(d, i) {
    	d.vals.forEach(function(x) {
    	    x["key"] = i
    	});
    });

    // make a geojson for mapping
    var cogo_geojson = {
    	"type": "FeatureCollection",
    	"features": []
    }

    cogo_data.forEach(function(d, i) {
    	cogo_geojson.features[i] = {
    	    "type": "Feature",
    	    "geometry": {
        		"type": "Point",
                "coordinates": [d.longitude, d.latitude]
    	    },
    	    "properties": {
        		"bikes": d.availableBikes,
                "status": d.status,
        		"id": i
    	    }
    	}
    });

    function cogo_get_pointcolor(f) {
        fillColor = "#ff8888";
        fillColor2 = "#888888";
        if (f.properties.status == "IN_SERVICE")
            return fillColor;
        else
            return fillColor2;
    }
    function cogo_layer_style(feature) {
    	return {
    	    radius: 4,
    	    fillColor: cogo_get_pointcolor(feature),
    	    color: (function(f) {
                if (f.properties.status=="IN_SERVICE")
                    return "#f00";
                else
                    return null;
            }(feature)),
    	    weight: 1,
    	    opacity: 1,
    	    fillOpacity: 0.95
    	};
    }

    function onEachCogoFeature(feature, layer) {
    	// layer._leaflet_id = feature.id; // this does work for getLayer since id not assigned now
    	id = L.stamp(layer); // assign id to the layer and return it. Better than the above line
    	cogo_join_fields[feature.properties.id]["ll_id"] = id;
    	layer.on({
    	    mouseover: function(e) {
        		i = feature.properties.id;
        		//alert(cogo_data[i].id + " " + cogo_data[i].stationName);
        		var layer = e.target;
        		if (feature.properties.bikes <= 6)
        		    radius = 4;
        		else
        		    radius = 7;
        		layer.setStyle({
        		    radius: radius,
        		    weight: 1,
        		    fillColor: "#7f7",
        		    color: '#9f9',
        		    fillOpacity: 1.0
        		});

        		if (!L.Browser.ie && !L.Browser.opera) {
        		    layer.bringToFront();
        		}

        		xPosition = cogo_x(cogo_data[i].id) + cogo_x.rangeBand()/2;
        		d3.select("#hover-line-cogo")
        		    .attr("x1", xPosition)
        		    .attr("x2", xPosition)
        		    .style("opacity", 1); // Making line visible
        		cogo_hoverInfo.text(cogo_data[i].stationName);
    	    },
    	    mouseout: function(e) {
        		cogo_layer.resetStyle(e.target);
        		// remove the following to keep the line in graph
        		d3.select("#hover-line-cogo").style("opacity", 0); // Making line invisible
    	    },
    	    click: function(e) {
    	    }
    	});
    }

    cogo_layer = L.geoJson(cogo_geojson, {
    	style: cogo_layer_style,
    	pointToLayer: function (feature, latlng) {
    	    return L.circleMarker(latlng);
    	},
    	onEachFeature: onEachCogoFeature
    });

    //layersControl.addOverlay(cogo_layer, "COGO");

    draw_cogo(0);
}

function draw_cogo(s) {
    cogo_x.domain(cogo_data.map(function(d) { return d.id; }));
    cogo_y.domain([0, d3.max(cogo_data, function(d) { return d.total; })]);

/*
    cogo_svg.append("g")
//	.attr("class", "y axis")
//	.call(cogo_yAxis)
	.append("text")
	.attr("class", "graph-title")
	.attr("y", -30)
	.attr("dx", "-1.5em")
	.attr("x", cogo_margin.left + cogo_width/2)
	.style("text-anchor", "middle")
//	.style("font-size","16px")
//        .style("fill", "grey")
	.text("COGO Bikes [" + format_date_wmdh(currentdatetime) + "]");
*/


    /*
      svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);
    */
    if (s==0) {
        cogo_svgg.append("g")
        	.attr("class", "y axis")
        	.call(cogo_yAxis)
        cogo_gg = cogo_svgg.append("g");
        cogo_svg
            .on("mouseenter", function(d, i) {
                if (!cogo_pinned)
                    map.addLayer(cogo_layer);
                })
            .on("mouseleave", function(d, i) {
                if (!cogo_pinned)
                    map.removeLayer(cogo_layer);
                });

        cogo_station = cogo_gg.selectAll(".station")
        	.data(cogo_data)
        	.enter().append("g")
        	.attr("class", "g");

        cogo_hoverLine = cogo_svgg.append("g")
            .attr("class", "hover-line-cogo")
            .append("line")
            .attr("id", "hover-line-cogo")
            .attr("x1", 10).attr("x2", 10)
            // .attr("y1", 0).attr("y2", cogo_height + 10)
            .style("pointer-events", "none") // Stop line interferring with cursor
            .style("opacity", 1e-6); // Set opacity to zero

        /*    .append("text")
    	  .attr("transform", "rotate(-90)")
    	  .attr("y", 6)
    	  .attr("dy", ".71em")
    	  .style("text-anchor", "end")
    	  .text("Number")
        */
        ;
    } else {
        cogo_svg.selectAll(".y.axis").call(cogo_yAxis);
        cogo_svg.selectAll(".station").remove(); // refresh the bars
    }

    // cogo_gg.append("rect")
    //     .attr("x", -20)
    //     .attr("y", -20)
    //     .attr("width", cogo_width+40)
    //     .attr("height", cogo_height+40)
    //     .style('visibility', 'hidden')
    //     .style("pointer-events", "all")
    //     ;

    cogo_hoverLine.attr("y1", 0).attr("y2", cogo_height + 10);

    cogo_station
    	.attr("transform", function(d) { return "translate(" + cogo_x(d.id) + ",0)"; })

    cogo_station.selectAll("rect")
    	.data(function(d) { return [d.vals[1], d.vals[0]]; })
    	.attr("class", "bar")
    	.enter().append("rect")
    	.attr("width", cogo_x.rangeBand())
    	.attr("y", function(d) { return cogo_y(d.y1); })
    	.attr("height", function(d) { return cogo_y(d.y0) - cogo_y(d.y1); })
    	.style("fill", function(d) { return cogo_color(d.name); })
    	.on("mouseover", cogo_mouseover)
    	.on("mousemove", cogo_mousemove)
    	.on("mouseout", cogo_mouseout)
        ;

    function cogo_mouseover(d, i) {
    	//id = join_fields[d.index].data_id
    	id = cogo_join_fields[d.key].data_id
    	cogo_hoverInfo.text(cogo_data[id].stationName);
    }

    function cogo_mousemove(d, i) {
    	var parentG = d3.select(this.parentNode);
    	var barPos = parseFloat(parentG.attr('transform').split("(")[1]);
    	var xPosition = barPos + d3.mouse(this)[0];

    	// still need this part - mouseover in layer draws a line too...

    	d3.select("#hover-line-cogo") // select hover-line and changing attributes to mouse position
            .attr("x1", xPosition)
            .attr("x2", xPosition)
            .style("opacity", 1); // Making line visible

    	//ll_id = join_fields[d.index].ll_id;
    	ll_id = cogo_join_fields[d.key].ll_id;
    	var layer = cogo_layer.getLayer(ll_id); //find a layer using id
    	layer.fireEvent('mouseover');

        //	cogo_hoverInfo.text(cogo_data[d.index].stationName);

    }

    function cogo_mouseout(d, i) {
    	//ll_id = join_fields[d.index].ll_id;
    	ll_id = cogo_join_fields[d.key].ll_id;
    	var layer = cogo_layer.getLayer(ll_id); //find a layer using id
    	layer.fireEvent('mouseout');
    	//cogo_hoverInfo.text(null);
    }

    // Hoverline

    // cogo_hoverLine = cogo_svgg.append("g")
    //     .attr("class", "hover-line-cogo")
    //     .append("line")
    //     .attr("id", "hover-line-cogo")
    //     .attr("x1", 10).attr("x2", 10)
    //     .attr("y1", 0).attr("y2", cogo_height + 10)
    //     .style("pointer-events", "none") // Stop line interferring with cursor
    //     .style("opacity", 1e-6); // Set opacity to zero

    cogo_hoverInfo
        .attr("class", "hover-text")
        .attr("y", cogo_height+50) // hover date text position
        .attr("x", 0) // hover date text position
        .style("fill", "#C5C6C7")
	    .style("font-size","16px");

    cogo_legend = cogo_svgg.selectAll(".legend")
    	.data(cogo_color.domain().slice())
    	.enter()
        .append("g")
    	.attr("class", "legend");
    	// .attr("transform", function(d, i) { return "translate(" + -i*100 + ", 5)"; });

    cogo_legend
        .append("rect")
    	// .attr("x", cogo_width - 50)
        .attr("x", function(d, i) { return cogo_width - 150 - i*60;})
    	.attr("y", cogo_height + 10)
    	.attr("width", 10)
    	.attr("height", 10)
    	.style("fill", cogo_color);

    cogo_legend.append("text")
    	// .attr("x", cogo_width - 54)
        .attr("x", function(d, i) { return cogo_width - 110 - i*60;})
    	.attr("y", cogo_height + 15)
    	.attr("dy", ".35em")
    	.style("text-anchor", "end")
    	.text(function(d) { return d.substring(9); })
    	.style("font-size","10px");

    //});
}

$(cogo_pin_id).click(function() {
    $(this).toggleClass("highlight");
    if ($(this).attr("class").includes("highlight")) {
	   map.addLayer(cogo_layer);
       cogo_pinned = true;
    }
    else {
	   map.removeLayer(cogo_layer);
       cogo_pinned = false;
    }
});
