/* ******************************************************
 *
 *   Interactive mapping using d3.js and leaflet
 *
 *   Author: Ningchuan Xiao
 *   Contact: ncxiao@gmail.com
 *   Revision: 2016 - 2018
 *
 * ******************************************************* */

 // script for gas prices
 // use prefix histo_


var choropleth_layer = null;

var ll_ids = [];

//////////////////////////////////////////////
//
// GeoJSON layer
//
/////////////////////////////////////////////

var grades;
colors = colorbrewer_min3['Blues']['3'];

// Data used for crossfilter
//var alldata = null;

var current_mapping_var = 'HispPct';

function formatNumber (num) {
    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")
}

function getColorx(val, grades) {
    for (i=1; i<grades.length; i++)
	if (val >= grades[i])
	    return colors[grades.length-i-1];
    return '#ffffff';
}

// not used...
function getClassx(val, grades) {
    for (i=1; i<grades.length; i++)
	if (val>=grades[i])
	    return i-1;
    return 0;
}

function histo_onEachFeature(feature, layer) {
    id = L.stamp(layer); // assign id to the layer and return it. Better than the above line
    for (i=0; i<histo_data.length; i++) {   // TODO: This is OK but clumsy. Use d3.bisector instead
    	min = d3.min(histo_data[i]);
    	max = d3.max(histo_data[i]);
    	myvar = feature.properties[current_mapping_var];
    	if (myvar>=min && myvar<=max)
    	    ll_ids[i].push(id)
    }
    layer.on({
    	mouseover: function(e) {
    	    var layer = e.target;
    	    layer.setStyle({
        		weight: 5,
        		color: '#F99',
        		fillOpacity: 0.95
    	    });
    	    if (!L.Browser.ie && !L.Browser.opera) {
        		layer.bringToFront();
    	    }
    	    feature = layer.feature;
    	    // var popupContent = "<table class='info'>"
        	// 	// + "<tr><td>Blockgroup</td><td class='num'>" + feature.properties.TRACT + '.'
        	// 	// + feature.properties.BLKGRP + "</td></tr>"
        	// 	+ "<tr><td>Population</td><td class='num'>" + formatNumber(feature.properties.Total) + "</td></tr>"
        	// 	+ "<tr><td>White</td><td class='num'>" + formatNumber(feature.properties.WhiteNH)
        	// 	+ " (" + feature.properties.WhiteNHPct + "%)</td></tr>"
        	// 	+ "<tr><td>" + friendly_names[current_mapping_var] + "</td><td class='num'>" + formatNumber(feature.properties[current_mapping_var])
        	// 	+ " (" + feature.properties[current_mapping_var] + "%)</td></tr>"
        	// 	+ "</table>";
            var popupContent = "<span style='color:grey'>" + formatNumber(feature.properties[current_mapping_var]) + "</span>";
    	    histo_hoverInfo.html(popupContent);
    	    var val = feature.properties[current_mapping_var];
    	    d3.selectAll(".bar")
        		.filter(function(d, i) { return val >= d.x && val<=(d.x+d.dx); })
        		.style("fill", "red");
    	},
        mouseout: function(e) {
    	    choropleth_layer.resetStyle(e.target);
    	    histo_hoverInfo.html("");
    	    var layer = e.target;
    	    var feature = layer.feature;
    	    var val = feature.properties[current_mapping_var];
    	    d3.selectAll(".bar")
    		.filter(function(d, i) { return val >= d.x && val<=(d.x+d.dx); })
    		.style("fill", function(d) {
    		    if (d.length>0) {
    			v = d3.mean(d);
    			return getColorx(v, grades);
    		    }
    		    else
    			return null;
    		});
    	},
    	click: function(e) {
    	    // TODO: click
    	}
    });
}

function make_layer(d) {
    layer = L.geoJson(d, {
    	style: function (feature) {
    	    edgeColor = "#777";
    	    fillColor = getColorx(feature.properties[current_mapping_var], grades);
    	    return {
        		color: edgeColor,
        		fillColor: fillColor,
        		opacity: 1,
        		fillOpacity: 0.90,
        		weight: 0.8
    	    };
    	},
    	onEachFeature: histo_onEachFeature
    });
    return layer;
}

///////////////////////// bar chart histogram

var histo_hoverInfo = null;

// this is just for franklin county

// var friendly_names = {
//     "Franklin_2": "Hispanic",
//     "HispPct": "Hispanic (%)",
//     "Total": "Total population",
//     "WhitePct": "White (%)",
//     "BlkPct": "Black (%)",
//     "AsianPct": "Asian (%)",
// }
//
// objectKeys = ["Total", "White", "WhitePct", "Black", "BlkPct", "Asian", "AsianPct", "Franklin_2", "HispPct"];

// for the bigger area
var friendly_names = {
    "Total":      "Total population",
    "Hispanic":   "Hispanic, any race",
    "HispPct":    "Hispanic, any race (%)",
    "BlackNH":    "Black, non-Hispanic",
    "BlackNHPct": "Black, non-Hispanic (%)",
    "AsianNH":    "Asian, non-Hispanic",
    "AsianNHPct": "Asian, non-Hispanic (%)",
    "NativeNH":   "Native American, non-Hispanic",
    "NativNHPct": "Native American, non-Hispanic (%)",
    "HawaiianNH": "Hawaiian or Pacific Islander, non-Hispanic",
    "HawaiNHPct": "Hawaiian or Pacific Islander, non-Hispanic (%)",
    "OtherNH":    "Other race, non-Hispanic",
    "OtherNHPct": "Other race, non-Hispanic (%)",
    "MultipleNH": "Two+ races, non-Hispanic",
    "MultiNHPct": "Two+ races, non-Hispanic (%)",
    "WhiteNH":    "White, non-Hispanic",
    "WhiteNHPct": "White, non-Hispanic (%)",
    "MEDINCOME":  "Median household income",
    "OWNERRATE":  "Housing owner rate", // "Owner-occupied housing rate",
    "COMMUTEMIN": "Travel time to work (min)",
    "BIKERATE":   "Bicycle to work (%)",
    "TRANSRATE":  "Public transit to work (%)",
    "WALKRATE":   "Walk to work (%)",
    "AUTORATE":   "Drive alone to work (%)",
    "POOLRATE":   "Carpool to work (%)",
}

objectKeys = [
    "Total",
    "Hispanic",
    "HispPct",
    "BlackNH",
    "BlackNHPct",
    "AsianNH",
    "AsianNHPct",
    // "NativeNH",
    // "NativNHPct",
    // "HawaiianNH",
    // "HawaiNHPct",
    "WhiteNH",
    "WhiteNHPct",
    // "OtherNH",
    // "OtherNHPct",
    "MultipleNH",
    "MultiNHPct",
    "----------", // need at least 6 as a separator
    "MEDINCOME",
    "OWNERRATE",
    "----------",
    "COMMUTEMIN",
    "BIKERATE",
    "TRANSRATE",
    "WALKRATE",
    "AUTORATE",
    "POOLRATE"
]

var gridnode = find_grid_by_name('demography');
var histo_id = '#' + gridnode.id; // "#plot2";
var histo_pin_id = '#' + gridnode.pinid;

var histo_margin = {top: 20, right: 20, bottom: 60, left: 30};
var histo_width, histo_height;
var histo_svg;
var histo_svgg;
var histo_x, histo_y, histo_xAxis, histo_yAxis;
var histo_data = null;
var histo_values = [];
var histo_bar = null;

var histo_pinned = false;

histo_svg = d3.select(histo_id).append("svg");

histo_svgg = histo_svg
    .append("g")
    .attr("transform", "translate(" + histo_margin.left + "," + histo_margin.top + ")");

histo_init(0);

function histo_init(init_state) {

    histo_width = $(histo_id).width() - histo_margin.left - histo_margin.right;
    histo_height = $(histo_id).height() - histo_margin.top - histo_margin.bottom;

    histo_svg
        .attr("width", $(histo_id).width())
        .attr("height", $(histo_id).height()-35)
        ;

    // D3 scales = just math
    // x is a function that transforms from "domain" (data) into "range" (usual pixels)
    // domain gets set after the data loads
    histo_x = d3.scale.linear().range([0, histo_width]);
    histo_y = d3.scale.linear().range([histo_height, 0]);

    histo_xAxis = d3.svg.axis().scale(histo_x).orient("bottom").ticks(6);
    histo_yAxis = d3.svg.axis().scale(histo_y).orient("left").ticks(4);

    if (init_state==0) {
        // d3.json("data/blockgrps_pop_franklin_2.geojson", handle_choropleth_geojson);
        // d3.json("data/blockgrps_pop_multicounties.geojson", handle_choropleth_geojson);
        d3.json("data/CURIODemographics-ALL.geojson", handle_choropleth_geojson);
    }
}

function handle_choropleth_geojson(error, data) {

    function get_var_grades(varname) {
        /*	var vals = [];
        	for (i=0; i<data.features.length; i++) {
        	    vals.push(data.features[i].properties[varname]);
        	}
        */
    	histo_values.sort(d3.ascending) ;
    	minx = histo_values[0];
    	maxx = histo_values.slice(-1)[0];
    	if (minx<1 && minx>0) minx = 0;
    	grades = [maxx, d3.quantile(histo_values, 0.67), d3.quantile(histo_values, 0.33), minx];
    }

    function on_change_chart1_var() {
    	current_mapping_var = d3.select(this).property("value");
        histo_values = [];
    	for (i=0; i<data.features.length; i++) {
    	    histo_values[i] = data.features[i].properties[current_mapping_var];
        }
    	get_var_grades(current_mapping_var);

    	draw_histogram(2);

    	if ($("#histogram-pin").attr("class").includes("highlight")) {
    	    map.removeLayer(choropleth_layer);
    	}
    	choropleth_layer.clearLayers();
    	choropleth_layer = make_layer(data);

    	if ($("#histogram-pin").attr("class").includes("highlight")) {
    	    map.addLayer(choropleth_layer);
    	}
    }

    d3.select("#histogram-vars").
    	on("change", on_change_chart1_var).
    	selectAll("option").
    	data(objectKeys)
            .enter()
            .append("option")
            .attr("value", function(d) {return d;})
            .property("selected", function(d) {
                return d == current_mapping_var; })
            .property("disabled", function(d) {
                return d.includes("------");})
            .text(function(d) {
                if (d.includes("------"))
                    return "─────────";
        	    else if (friendly_names[d]!=null)
        		    return friendly_names[d];
        	    else
        		    return d; });

    for (i=0; i<data.features.length; i++) {
    	//histo_values.push({"val":data.features[i].properties[current_mapping_var], "id":i});
    	histo_values[i] = data.features[i].properties[current_mapping_var];
    }

    //histo_x = x;
    get_var_grades(current_mapping_var);
    histo_data = d3.layout.histogram().bins(30)(histo_values); // update bins in the histogram

    //layersControl.addOverlay(choropleth_layer, "Population");

    draw_histogram(0);

    choropleth_layer = make_layer(data);

    histo_hoverInfo = histo_svg.append("foreignObject")
    //.append('text')
	.attr({
            height: 100,
            width: 200, // dimensions determined based on need
            transform: 'translate(' + (histo_width/2) + ', 5)' // put it where you want it...
	});
}

// s = 0  first time init
// s = 1 resizing
// s = 2 change histogram variable (needs to update ll_ids)
function draw_histogram(s) {
    //data = histo_values;
    histo_data = d3.layout.histogram().bins(30)(histo_values); // update bins in the histogram

    // measure the domain (for x, unique letters) (for y [0,maxFrequency])
    // now the scales are finished and usable
    histo_x.domain([0, d3.max(histo_values)]);
    histo_y.domain([0, d3.max(histo_data, function(d) { return d.y; })]);

    if (s==0 || s==2) {
        ll_ids = [];
        for (i=0; i<histo_data.length; i++)
            ll_ids[i] = []; // .push([]);
    }

    if (s==0) {
        histo_svg
            .on("mouseenter", function(d, i) {
                if (!histo_pinned)
                    map.addLayer(choropleth_layer);})
            .on("mouseleave", function(d, i) {
                if (!histo_pinned)
                    map.removeLayer(choropleth_layer);
                })
            ;

        histo_svgg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + histo_height + ")")
            // .transition().duration(300)
            .call(histo_xAxis);

        histo_svgg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(-2,0)")
            // .transition().duration(300)
            .call(histo_yAxis);

        // histo_gg = histo_svgg.append("g");
    }
    else {
        histo_svg.select('.x.axis').call(histo_xAxis);
        histo_svg.select(".y.axis").call(histo_yAxis);
        histo_svg.selectAll(".bar").remove(); // refresh the bars
    }

    // another g element, this time to move the origin to the bottom of the svg element
    // someSelection.call(thing) is roughly equivalent to thing(someSelection[i])
    //   for everything in the selection\
    // the end result is g populated with text and lines!
    // histo_svg.select('.x.axis').transition().duration(300).call(histo_xAxis);
    // histo_svg.select(".y.axis").transition().duration(300).call(histo_yAxis);

    // histo_rect = histo_gg.append("rect")
    //     .attr("x", -20)
    //     .attr("y", -20)
    //     .attr("width", histo_width+40)
    //     .attr("height", histo_height+40)
    //     .style('visibility', 'hidden')
    //     .style("pointer-events", "all")
    //     ;

    histo_bar = //histo_gg
        histo_svgg
        // .append("g")
        .selectAll(".bar")
        .data(histo_data, function(d, i) { return d; })
        .enter().append("rect")
    	.attr("class", "bar")
    	.attr("y", histo_y(0))
    	.attr("height", histo_height - histo_y(0))
    	.style("fill", function(d, i) {
    	    if (d.length>0) {
        		v = d3.mean(d);
        		return getColorx(v, grades); // use mean in the bin to determine color
    	    }
    	    else {
        		return null;
    	    }
    	})
        ;
        // .style("pointer-events", "all")
    histo_bar
    	.on("mouseover", function(d, i) {
    	    d3.select(this).style('fill', 'red');
    	    for (j=0; j<ll_ids[i].length; j++) {
        		l = choropleth_layer.getLayer(ll_ids[i][j]);
        		l.setStyle({
        		    weight: 1,
        		    fillColor: '#F99',
        		    color: '#F66',
        		    fillOpacity: 0.85
        		});
        		if (!L.Browser.ie && !L.Browser.opera) {
        		    l.bringToFront();
        		}
    	    }
    	})
    	.on("mouseout", function(d, i) {
    	    d3.select(this).style("fill", function(d) {
        		if (d.length>0) {
        		    v = d3.mean(d);
        		    return getColorx(v, grades); // use mean in the bin to determine color
        		}
        		else
        		    return null;
    	    });
    	    ll_ids[i].forEach(function(dd) {
                choropleth_layer.resetStyle(choropleth_layer.getLayer(dd));})
    	});

    histo_bar
        // .transition().duration(300)
        .attr("x", function(d) { return histo_x(d.x); })
    	.attr("width", histo_x(histo_data[0].dx) - 1)
    	//.attr("width", x.rangeBand()) // constant, so no callback function(d) here
    	.attr("y", function(d) { return histo_y(d.y); })
    	.attr("height", function(d) { return histo_height - histo_y(d.y); });

    var evt = $.Event('completePlot');
    evt.detail = 'histogram';
    $(window).trigger(evt);

    // var evt = new CustomEvent('completePlot', { detail: 'histogram' });
    // window.dispatchEvent(evt);
}


/////////////////////////////////////////////////////////////////

$(histo_pin_id).click(function() {
    $(this).toggleClass("highlight");
    if ($(this).attr("class").includes("highlight")) {
	   map.addLayer(choropleth_layer);
       histo_pinned = true;
   }
    else {
	   map.removeLayer(choropleth_layer);
       histo_pinned = false;
   }
});
