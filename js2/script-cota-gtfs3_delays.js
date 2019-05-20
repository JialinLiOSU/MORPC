
var gridnode = find_grid_by_name('delays');
var cotalocation_id = '#' + gridnode.id; // "#plot8";
var cotalocation_pin_id = '#' + gridnode.pinid;


var cotalocation_color = null;

var cotalocation_margin = {top: 20, right: 20, bottom: 90, left: 30};
var cotalocation_width, cotalocation_height, cotalocation_x, cotalocation_y, cotalocation_xAxis, cotalocation_yAxis, cotalocation_line;
var cotalocation_svg = null;
var cotalocation_svgg = null;
var cotalocation_path_by_route = null;
var cotalocation_gg = null;
var cotalocation_hoverLine = null;
var cotalocation_tmp_text = null;
var cotalocation_delaymap_pinned = false;
var cotalocation_rect = null;

var cotalocation_data = null;
var cotalocation_line_data = null;
var cotalocation_line_d_data = null;
var cotalocation_delay_data = null;
var cotalocation_timegroups = null;//
var cotalocation_routes = null;//
var busstopnetwork_data = null;
var busstops_data = null;
var dic_busstops_by_id = null;
var dic_arcs_by_stops = null;

var buslines = {};
buslines["total"] = {};
buslines["total"]["color"] = "grey";
buslines["standard"] = {};
buslines["standard"]["lines"] = ["003","004","009","011","012","013","021","022","024","025","031","032","033","101","102","131","141","151","152","202","211"]; //include temporary lines (141, 151)
buslines["standard"]["color"] = "#00205B";
buslines["frequent"] = {};
buslines["frequent"]["lines"] = ["001","002","005","006","007","008","010","023","034","121","201","213"];
buslines["frequent"]["color"] = "#AF272F";
buslines["rushhour"] = {};
buslines["rushhour"]["lines"] = ["041","042","043","044","045","046","051","052","061","071","072","073","074","203","212"];
buslines["rushhour"]["color"] = "#007B4B";

var dic_buslines_by_category = {};
for (let i of Object.keys(buslines)){
    if (i!=="total") {
        for (let j of buslines[i]['lines']){
            dic_buslines_by_category[j] = i;
        };
    }
};

function distance(lat1, lon1, lat2, lon2, unit) {
	var radlat1 = Math.PI * lat1/180
	var radlat2 = Math.PI * lat2/180
	var theta = lon1-lon2
	var radtheta = Math.PI * theta/180
	var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
	dist = Math.acos(dist)
	dist = dist * 180/Math.PI
	dist = dist * 60 * 1.1515
	if (unit=="K") { dist = dist * 1.609344 }
	if (unit=="N") { dist = dist * 0.8684 }
	return dist
}

var cfg_busstops = {
    "radius": 3,
    "color": "#2C3E50",
    "fillColor":"#566573",
    "weight": 1,
    "opacity": .3,
    "fillOpacity": .2
}

var delaycolor_scale = d3.scale.linear().range(["green", "yellow", "red"]).domain([0, 180, 900]);
function getColor(x) {
    return delaycolor_scale(x);
}
var cfg_busstopnetwork = {
    "color": "white", // getColor(0),
    "weight": 4,
    "opacity": .1
}
var busstopnetworkLayer = new L.geoJson(null, cfg_busstopnetwork)

var cfg_lineardelay = {
    style: function(feature) {
        return{
            "color": getColor(feature.properties.delay),
            "weight": 4,
            "opacity": 8,
            "lineCap": "square"
        }
    },
    onEachFeature: function (feature, layer) {
        layer.bindPopup("Bus Line: " + feature.properties.route_id + "<br>" + "Stop(from): " + dic_busstops_by_id[feature.properties.stop_o]['stop_name'] + "<br>" + "Stop(to): " + dic_busstops_by_id[feature.properties.stop_d]['stop_name'] + "<br>" + "Delay: " + feature.properties.delay/60 + " mins");
    }
}
var lineardelayLayer = new L.geoJson(null, cfg_lineardelay);

var lineardelayheadLayer = new L.geoJson(null, {
    pointToLayer: function(feature, latlng) {
        var delay = feature.properties.delay;
        var stop_name = feature.properties.stop_d;
        return L.circleMarker(latlng, {
            "radius": 3,
            "color": "black", //getColor(delay),
            "fillColor":getColor(delay),
            "weight": 2,
            "opacity": .9,
            "fillOpacity": .9
        }).bindPopup(stop_name);
    }}
)

cotalocation_svg = d3.select(cotalocation_id).append("svg");

cotalocation_svgg = cotalocation_svg.append("g")
    .attr("transform", "translate(" + cotalocation_margin.left + "," + cotalocation_margin.top + ")");

cotalocation_tmp_text = cotalocation_svgg
	.append("text")
	.attr("class", "hover-text")
	.attr("x", 20)
	.attr("y", -5)
	.style("fill", "959697");

cotalocation_init(0);

//start
function cotalocation_init(init_state) {

    cotalocation_width = $(cotalocation_id).width() - cotalocation_margin.left - cotalocation_margin.right;
    cotalocation_height = $(cotalocation_id).height() - cotalocation_margin.top - cotalocation_margin.bottom;

	cotalocation_svg
		.attr("width", $(cotalocation_id).width())
		.attr("height", $(cotalocation_id).height() - 35);

    cotalocation_x = d3.time.scale()
        .range([0, cotalocation_width]);
    cotalocation_y = d3.scale.linear()
        .range([cotalocation_height, 0])
    cotalocation_xAxis = d3.svg.axis()
        .scale(cotalocation_x)
        .ticks(4)
        .orient("bottom");
    cotalocation_yAxis = d3.svg.axis()
        .scale(cotalocation_y)
        .ticks(5)
        .orient("left");
    cotalocation_line = d3.svg.line()
        .interpolate("basis") //"basis" //basis does not pass through points
        .x(function(d){ return cotalocation_x(d.time); })
        .y(function(d){ return cotalocation_y(d.pct); }); //check

    if (init_state == 0) {

		cotalocation_svg
            .on("mouseenter", function(d,i) {
                if(!cotalocation_delaymap_pinned) {
					map.addLayer(busstopnetworkLayer);
			        map.addLayer(lineardelayLayer);
					if (map.getZoom() > 12) {
						map.addLayer(lineardelayheadLayer)
					}
                }
            })
            .on("mouseleave", function(d,i) {
                if (!cotalocation_delaymap_pinned) {
					map.removeLayer(busstopnetworkLayer)
					map.removeLayer(lineardelayLayer);
					if (map.hasLayer(lineardelayheadLayer)) {
						map.removeLayer(lineardelayheadLayer)
	                }
				}
            });

        $.when(
            $.ajax({
                type: "GET",
                url: "http://curio.osu.edu/cotafeeds",
                dataType: "text"
            }),

            $.ajax({
                type: "GET",
                url: "http://curio.osu.edu/cotaarcs",
                dataType:"json"
            }),

            $.ajax({
                type: "GET",
                url: "http://curio.osu.edu/cotastops",
                dataType:"json"
            })
        ).done(function(res1, res2, res3){
            if (res1[1] !== "success" || res2[1] !== "success" || res3[1] !== "success") {console.log("err");}

            cotalocation_data = d3.tsv.parse(res1[0]);
            busstopnetwork_data = res2[0];
            busstops_data = res3[0]

            cotalocation_timegroups = [];
            for (var i=0; i<cotalocation_data.length; i++){
                cotalocation_timegroups.push(+cotalocation_data[i].timegroup);
            };
            cotalocation_timegroups = Array.from(new Set(cotalocation_timegroups));
            cotalocation_timegroups.sort(function(a,b){ return a-b; });

            dic_arcs_by_stops = {};
            for (var i=0; i<busstopnetwork_data.features.length; i++){
                var arcid = [busstopnetwork_data.features[i].properties.stop_o, busstopnetwork_data.features[i].properties.stop_d]
                dic_arcs_by_stops[arcid] = busstopnetwork_data.features[i].geometry;
            }

            dic_busstops_by_id = {};
            for (var i=0; i<busstops_data.features.length; i++){
                var busstop_id = busstops_data.features[i].properties.stop_id;
                var busstop_name = busstops_data.features[i].properties.stop_name;
                var busstop_geometry = busstops_data.features[i].geometry;
                dic_busstops_by_id[busstop_id] = {}
                dic_busstops_by_id[busstop_id]['stop_name'] = busstop_name;
                dic_busstops_by_id[busstop_id]['geometry'] = busstop_geometry;
            }

            var tmp_delays_data = {};
            var tmp_geojson_line_data = {};
            var tmp_geojson_line_d_data = {};
            for (let i of cotalocation_timegroups){
                tmp_delays_data[i] = {};
                tmp_delays_data[i]["timegroup"] = i;
                for (let j of Object.keys(buslines)){
                    tmp_delays_data[i][j] = 0;
                };
                tmp_geojson_line_data[i] = {"timegroups":i, "type":"FeatureCollection", "features":[]};
                tmp_geojson_line_d_data[i] = {"timegroups":i, "type":"FeatureCollection", "features":[]};
            };
            for (let i of cotalocation_data){
                var tg = +i["timegroup"];
                var r_id = i["route_id"];
                if (dic_buslines_by_category[r_id] != undefined){
                    tmp_delays_data[tg]["total"] += +i["delay"]/(60*60);
                    tmp_delays_data[tg][dic_buslines_by_category[r_id]] += +i["delay"]/(60*60);

                    var stop_o = i["stop_o"];
                    var stop_d = i["stop_d"];
                    if (dic_arcs_by_stops[[stop_o, stop_d]] != undefined){
                        var feature_line = JSON.parse(JSON.stringify(i));
                        feature_line["geometry"] = dic_arcs_by_stops[[stop_o, stop_d]];

                        var feature_line_d = JSON.parse(JSON.stringify(i));
                        feature_line_d["geometry"] = dic_busstops_by_id[stop_d]["geometry"];

                        tmp_geojson_line_data[tg]["features"].push (GeoJSON.parse(feature_line, {GeoJSON: "geometry", exclude: ["latitude", "longitude","timegroup"]}));
                        tmp_geojson_line_d_data[tg]["features"].push (GeoJSON.parse(feature_line_d, {GeoJSON: "geometry", exclude: ["latitude", "longitude","timegroup"]}));
                    }
                }
            };

            cotalocation_delay_data = [];
            cotalocation_line_data = [];
            cotalocation_line_d_data = [];
            for (let i of cotalocation_timegroups){
                cotalocation_delay_data.push(tmp_delays_data[i]);
                cotalocation_line_data.push(tmp_geojson_line_data[i]);
                cotalocation_line_d_data.push(tmp_geojson_line_d_data[i]);
            }

            lineardelayLayer.addData(cotalocation_line_data[0])
            lineardelayheadLayer.addData(cotalocation_line_d_data[0])
            busstopnetworkLayer.addData(busstopnetwork_data)

            draw_cotalocation(0);
        })
    }
}

function draw_cotalocation(s) {
	if (s==0) {
        cotalocation_routes = Object.keys(buslines);
	    var route_colors = [];
	    for (var i=0; i<cotalocation_routes.length; i++){
	        route_colors.push(buslines[cotalocation_routes[i]]["color"]);
	    }
	    cotalocation_color = d3.scale.ordinal().domain(cotalocation_routes).range(route_colors);

	    cotalocation_delay_data.forEach(function(d){
	        d.time = new Date(d.timegroup*1000); //check!! for time event
	    })

	    cotalocation_delay_data_by_route = cotalocation_color.domain().map(
	        function(name) {
	            return {
	                name: name,
	                values: cotalocation_delay_data.map(function(d){
	                    return {time: d.time, pct: +d[name]};
	                })
	            };
	        }
	    );
    }

    cotalocation_x.domain(d3.extent(cotalocation_delay_data, function(d){ return d.time; }))

    cotalocation_y.domain([
        d3.min(cotalocation_delay_data_by_route, function(c){
            return d3.min(c.values, function(v){ return v.pct; }); }),
        d3.max(cotalocation_delay_data_by_route, function(c){
            return d3.max(c.values, function(v){ return v.pct; }); })

    ]);

    if (s==0) {
        var evt = $.Event("completecotalocation");
        evt.detail = "data";
        $(window).trigger(evt);

        cotalocation_svgg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + cotalocation_height + ")")
            .call(cotalocation_xAxis);

        cotalocation_svgg.append("g")
            .attr("class", "y axis")
            .call(cotalocation_yAxis);

        cotalocation_gg = cotalocation_svgg.append("g");
		cotalocation_path_by_route = cotalocation_gg.selectAll(".route")
	        .data(cotalocation_delay_data_by_route)
	        .enter().append("g")
	        .attr("class", "route")
	        // .on("mouseover", function(d,i){
	        // })
	        // .on("mouseout", function(d,i){
	        // })
			;

		cotalocation_path_by_route.append("path")
	        .attr("class", "line")
	        .attr("d", function(d){ return cotalocation_line(d.values); })
	        .style("stroke", function(d){ return cotalocation_color(d.name); })
	        .style("stroke-width", 1)
	        .style("opacity", .8)

		// legend
		cotalocation_path_by_route.append("text")
	        .datum(function(d){ return {name: d.name, value: d.values[d.values.length-1]}; })
			.attr("x", function(d,i){ return 10 + 50*i; })
	        .attr("y", cotalocation_height+45)
	        .style("font-size", "10px")
	        .style("fill", function(d){ return cotalocation_color(d.name); })
			.text(function(d){ return d.name.charAt(0).toUpperCase() + d.name.slice(1);});

		cotalocation_hoverLine = cotalocation_gg.append("g")
	        .attr("class", "hover-line-cotalocation")
	        .append("line")
	        .attr("id", "hover-line-cotalocation")
	        .attr("x1", 10).attr("x2", 10)
	        .attr("y1", 0).attr("y2", cotalocation_height+10)
	        .style("pointer-events", "none")
	        .style("opacity", 1e-6);

		// cotalocation_gg.append("rect")
	    //     .attr("x", -80)
	    //     .attr("y", -20)
	    //     .attr("width", cotalocation_width+100)
	    //     .attr("height", cotalocation_height+40)
	    //     .style("visibility", "hidden")
	    //     .style("pointer-events", "all");
        //
        //

	    cotalocation_rect = cotalocation_gg.append("rect")
	        .attr("x", 0)
	        .attr("y", 0)
	        .attr("width", cotalocation_width)
	        .attr("height", cotalocation_height)
	        .style("fill", "none")
	        .style("pointer-events", "all")
	        .on("mousemove", cotalocation_mousemove)
	        .on("mouseout", cotalocation_mouseout);

    }
    else {
        cotalocation_svg.selectAll(".x.axis").call(cotalocation_xAxis);
        cotalocation_svg.selectAll(".y.axis").call(cotalocation_yAxis);
    }

	cotalocation_path_by_route.selectAll(".line")
		.attr("d", function(d){ return cotalocation_line(d.values); });

	cotalocation_rect
        .attr("width", cotalocation_width)
        .attr("height", cotalocation_height);

    var formatx = d3.time.format("%m/%d %I:%M %p");

    function cotalocation_mousemove(d, i) {
        var date = cotalocation_x.invert(d3.mouse(this)[0]);
        var idx = parseInt(cotalocation_delay_data.length*d3.mouse(this)[0]/cotalocation_width);
        if (idx>=cotalocation_delay_data.length){
            idx = cotalocation_delay_data.length-1;
        }
        if (idx<0){
            idx = 0;
        }

        lineardelayLayer.clearLayers();
        lineardelayLayer.addData(cotalocation_line_data[idx]);
        lineardelayheadLayer.clearLayers();
        lineardelayheadLayer.addData(cotalocation_line_d_data[idx]);

        cotalocation_tmp_text.text(formatx(date));

        var cotalocation_xPosition = d3.mouse(this)[0];

        d3.select("#hover-line-cotalocation")
            .attr("x1", cotalocation_xPosition)
            .attr("x2", cotalocation_xPosition)
            .style("opacity", 1);
    }

    function cotalocation_mouseout(d,i) {
        d3.select("#hover-line-cotalocation").style("opacity", 0);
    }

}

$(cotalocation_pin_id).click(function(){
    $(this).toggleClass("highlight");
    if ($(this).attr("class").includes("highlight")) {
        map.addLayer(busstopnetworkLayer);
        map.addLayer(lineardelayLayer);
        map.on('zoomend', function() {
            if (map.getZoom() <12){
                if (map.hasLayer(lineardelayheadLayer)){
                    map.removeLayer(lineardelayheadLayer);
                }
            }
            else {
                map.addLayer(lineardelayheadLayer);
            }
        })
        cotalocation_delaymap_pinned = true;
    }
    else {
        map.removeLayer(busstopnetworkLayer)
        map.removeLayer(lineardelayLayer);
        map.removeLayer(lineardelayheadLayer)
        cotalocation_delaymap_pinned = false;
    }
});
