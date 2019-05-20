
var gridnode = find_grid_by_name('buses');
var cotabuses_id = '#' + gridnode.id; // "#plot7";
var cotabuses_pin_id = '#' + gridnode.pinid;


var cotabuses_color = null;

var cotabuses_margin = {top: 30, right: 20, bottom: 90, left: 30};
var cotabuses_width, cotabuses_height, cotabuses_x, cotabuses_y, cotabuses_y1, cotabuses_xAxis, cotabuses_yAxis, cotabuses_line;
var cotabuses_svg = null;
var cotabuses_svgg = null;
var cotabuses_gg = null;
var cotabuses_hoverline = null;
var cotabuses_tmp_text = null;
var cotabuses_busesmap_pinned = false;
var cotabuses_rect = null;

var cotabuses_path_by_route = null;
var cotabuses_data = null;
var cotabuses_buses_data = null;
var cotabuses_timegroups = null;//
var cotabuses_routes = null;//

var buslines = {};
buslines["total"] = {};
buslines["total"]["color"] = "grey";
buslines["standard"] = {};
buslines["standard"]["lines"] = ["003","004","009","011","012","021","022","024","025","031","032","033","101","102","131","141","151","152","202","211"]; //include temporary lines (141, 151)
buslines["standard"]["color"] = "#00205B";
buslines["frequent"] = {};
buslines["frequent"]["lines"] = ["001","002","005","006","007","008","010","023","034","121","201","213"];
buslines["frequent"]["color"] = "#AF272F";
buslines["rushhour"] = {};
buslines["rushhour"]["lines"] = ["013","041","042","043","044","045","046","051","052","061","071","072","073","074","203","212"];
buslines["rushhour"]["color"] = "#007B4B";

var dic_buslines_by_category = {};
for (let i of Object.keys(buslines)){
    if (i!=="total") {
        for (let j of buslines[i]['lines']){
            dic_buslines_by_category[j] = i;
        };
    }
};

var cfg_cotabuses_busroute = {
    "color": "white",
    "weight": 5,
    "opacity": .1
}
var cotabuses_busrouteLayer = new L.geoJson(null, cfg_cotabuses_busroute);

var bus_iconsUrl = './png/'
var bus_icons = {};
for (let i of Object.keys(buslines)){
    if (i !== 'total'){
        bus_icons[i] = {
            iconUrl: bus_iconsUrl.concat(i).concat(".png"),
            iconSize: [9, 9], // size of the icon
            iconAnchor: [3.5, 10], // point of the icon which will correspond to marker's location
            popupAnchor: [0, -10] //
        };
    }
};

var cfg_cotabuses_geojson = {
    pointToLayer: function(f, latlng){
        if (bus_icons[dic_buslines_by_category[f.properties.route_id]]!==undefined){
            return L.marker(latlng, {icon: L.icon(bus_icons[dic_buslines_by_category[f.properties.route_id]])});
        } else {
            return L.marker(latlng, {icon: L.icon(bus_icons["standard"])});
        }
    },
    onEachFeature: function (f, layer) {
        layer.bindPopup("Bus Line: " + f.properties.route_id + "<br>" + "Vehicle ID: " + f.properties.vehicle_id + "<br>" + "Speed: " + f.properties.speed + " mph");
    }
}

var cotabuses_geojsonLayer = new L.geoJson(null, cfg_cotabuses_geojson);


cotabuses_svg = d3.select(cotabuses_id).append("svg");

cotabuses_svgg = cotabuses_svg.append("g")
    .attr("transform", "translate(" + cotabuses_margin.left + "," + cotabuses_margin.top + ")");

cotabuses_tmp_text = cotabuses_svgg
    .append("text")
    .attr("class", "hover-text")
    .attr("x", 20)
    .attr("y", -5)
    .style("fill", "959697");

cotabuses_init(0);





//start
function cotabuses_init(init_state) {

    cotabuses_width = $(cotabuses_id).width() - cotabuses_margin.left - cotabuses_margin.right;
    cotabuses_height = $(cotabuses_id).height() - cotabuses_margin.top - cotabuses_margin.bottom;

    cotabuses_svg
        .attr("width", $(cotabuses_id).width())
        .attr("height", $(cotabuses_id).height()-35);

    cotabuses_x = d3.time.scale().range([0, cotabuses_width]);
    cotabuses_y = d3.scale.linear().range([cotabuses_height, 0])

    cotabuses_xAxis = d3.svg.axis()
        .scale(cotabuses_x)
        .ticks(4)
        .orient("bottom");

    cotabuses_yAxis = d3.svg.axis()
        .scale(cotabuses_y)
        .ticks(5)
        .orient("left");

    cotabuses_line = d3.svg.line()
        .interpolate("basis") //"basis" //basis does not pass through points
        .x(function(d){ return cotabuses_x(d.time); })
        .y(function(d){ return cotabuses_y(d.pct); }); //check

    if (init_state == 0) {

        cotabuses_svg
            .on("mouseenter", function(d,i) {
                if(!cotabuses_busesmap_pinned) {
                    map.addLayer(cotabuses_busrouteLayer);
                    map.addLayer(cotabuses_geojsonLayer);
                }
            })
            .on("mouseleave", function(d,i) {
                if (!cotabuses_busesmap_pinned) {
                    map.removeLayer(cotabuses_geojsonLayer);
                    map.removeLayer(cotabuses_busrouteLayer);
                }
            });

        $.when(
                $.ajax({
                    type: "GET",
                    url:  "http://curio.osu.edu/cotafeeds",
                    dataType: "text"
                }),
                $.ajax({
                    type: "GET",
                    url: "http://curio.osu.edu/cotalines",
                    dataType:"json"
                })
        ).done(function(res1, res2) {
            if (res1[1] !== "success" || res2[1] !== "success") {console.log("err");}


            cotabuses_data = d3.tsv.parse(res1[0]);
            cotabuses_route_data = res2[0];

            cotabuses_timegroups = [];
            for (var i=0; i<cotabuses_data.length; i++){
                cotabuses_timegroups.push(+cotabuses_data[i].timegroup);
            };
            cotabuses_timegroups = Array.from(new Set(cotabuses_timegroups));
            cotabuses_timegroups.sort(function(a,b){ return a-b; });

            var tmp_buses_data = {};
            var tmp_geojson_data = {};
            for (let i of cotabuses_timegroups){
                tmp_buses_data[i] = {};
                tmp_buses_data[i]["timegroup"] = i;
                for (let j of Object.keys(buslines)){
                    tmp_buses_data[i][j] = 0;
                };
                tmp_geojson_data[i] = {"timegroups":i, "type":"FeatureCollection", "features":[]}
            }

            for (let i of cotabuses_data){
                var tg = +i["timegroup"]
                var r_id = i["route_id"]
                if (dic_buslines_by_category[r_id] != undefined){
                    tmp_buses_data[tg]["total"] += 1;
                    tmp_buses_data[tg][dic_buslines_by_category[r_id]] += 1;

                    tmp_geojson_data[tg]["features"].push (GeoJSON.parse(i, {Point:["latitude","longitude"], exclud:["timegroup"]}));
                }
            };

            cotabuses_buses_data = [];
            cotabuses_geojson_data = [];
            for (let i of cotabuses_timegroups){
                cotabuses_buses_data.push(tmp_buses_data[i]);
                cotabuses_geojson_data.push(tmp_geojson_data[i]);
            }

            cotabuses_geojsonLayer.addData(cotabuses_geojson_data[0])
            cotabuses_busrouteLayer.addData(cotabuses_route_data)

            draw_cotabuses(0);
        })
    }}

function draw_cotabuses(s) {
    if (s==0) {
        cotabuses_routes = Object.keys(buslines);
        var cotabuses_route_colors = [];
        for (let i of cotabuses_routes){
            cotabuses_route_colors.push(buslines[i]["color"]);
        }
        cotabuses_color = d3.scale.ordinal().domain(cotabuses_routes).range(cotabuses_route_colors);

        cotabuses_buses_data.forEach(function(d){
            d.time = new Date(d.timegroup*1000); //check!! for time event
        })

        cotabuses_buses_data_by_route = cotabuses_color.domain().map(
            function(name) {
                return {
                    name: name,
                    values: cotabuses_buses_data.map(function(d){
                        return {time: d.time, pct: +d[name]};
                    })
                };
            }
        );
    }

    cotabuses_x.domain(d3.extent(cotabuses_buses_data, function(d){ return d.time; }))

    cotabuses_y.domain([
        d3.min(cotabuses_buses_data_by_route, function(c){
            return d3.min(c.values, function(v){ return v.pct; }); }),
        d3.max(cotabuses_buses_data_by_route, function(c){
            return d3.max(c.values, function(v){ return v.pct; }); })
    ]);

    if (s==0) {
        var cotabuses_evt = $.Event("completecotabuses");
        cotabuses_evt.detail = "data";
        $(window).trigger(cotabuses_evt);

        cotabuses_svgg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + cotabuses_height + ")")
            .call(cotabuses_xAxis);

        cotabuses_svgg.append("g")
            .attr("class", "y axis")
            .call(cotabuses_yAxis);

        cotabuses_gg = cotabuses_svgg.append("g");

        cotabuses_path_by_route = cotabuses_gg.selectAll(".route")
            .data(cotabuses_buses_data_by_route)
            .enter().append("g")
            .attr("class", "route")
            // .on("mouseover", function(d,i){
            // })
            // .on("mouseout", function(d,i){
            // })
            ;

        cotabuses_path_by_route.append("path")
            .attr("class", "line")
            .attr("d", function(d){ return cotabuses_line(d.values); })
            .style("stroke", function(d){ return cotabuses_color(d.name); })
            .style("stroke-width", 1)
            .style("opacity", .8)

        // legend
        cotabuses_path_by_route.append("text")
            .datum(function(d){ return {name: d.name, value: d.values[d.values.length-1]}; })
            .attr("x", function(d,i){ return 10 + 50*i; })
            .attr("y", cotabuses_height+45)
            .style("font-size", "10px")
            .style("fill", function(d){ return cotabuses_color(d.name); })
            .text(function(d){ return d.name.charAt(0).toUpperCase() + d.name.slice(1);});

        cotabuses_hoverLine = cotabuses_gg.append("g")
            .attr("class", "hover-line-cotalocation")
            .append("line")
            .attr("id", "hover-line-cotabuses")
            .attr("x1", 10).attr("x2", 10)
            .attr("y1", 0).attr("y2", cotabuses_height + 10)
            .style("pointer-events", "none")
            .style("opacity", 1e-6);

        cotabuses_rect = cotabuses_gg.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", cotabuses_width)
            .attr("height", cotabuses_height)
            .style("fill", "none")
            .style("pointer-events", "all")
            .on("mousemove", cotabuses_mousemove)
            .on("mouseout", cotabuses_mouseout);

        //     .on("mounseenter", function(d,i){
        //         if(!cotabuses_busesmap_pinned)
        //             map.addLayer(cotabuses_geojsonLayer);
        //     })
        //     .on("mouseleave", function(d,i){
        //         if (!cotabuses_busesmap_pinned)
        //             map.removeLayer(cotabuses_geojsonLayer);
        //     });
    }
    else {
        cotabuses_svg.selectAll(".x.axis").call(cotabuses_xAxis);
        cotabuses_svg.selectAll(".y.axis").call(cotabuses_yAxis);
    }

    // cotabuses_gg.append("rect")
    //     .attr("x", -80)
    //     .attr("y", -20)
    //     .attr("width", cotabuses_width+100)
    //     .attr("height", cotabuses_height+40)
    //     .style("visibility", "hidden")
    //     .style("pointer-events", "all");

    cotabuses_path_by_route.selectAll(".line")
        .attr("d", function(d) { return cotabuses_line(d.values); })

    cotabuses_rect
        .attr("width", cotabuses_width)
        .attr("height", cotabuses_height)
        ;

    var formatx = d3.time.format("%m/%d %I:%M %p");

    function cotabuses_mousemove(d,i) {
        var date = cotabuses_x.invert(d3.mouse(this)[0]);
        var idx = parseInt(cotabuses_buses_data.length*d3.mouse(this)[0]/cotabuses_width);
        if (idx>=cotabuses_buses_data.length){
            idx = cotabuses_buses_data.length-1;
        }
        if (idx<0){
            idx = 0;
        }

        cotabuses_geojsonLayer.clearLayers();
        cotabuses_geojsonLayer.addData(cotabuses_geojson_data[idx]);

        cotabuses_tmp_text.text(formatx(date));

        var cotabuses_xPosition = d3.mouse(this)[0];

        d3.select("#hover-line-cotabuses")
        .attr("x1", cotabuses_xPosition)
        .attr("x2", cotabuses_xPosition)
        .style("opacity", 1);
    }

    function cotabuses_mouseout(d,i) {
        d3.select("#hover-line-cotabuses").style("opacity", 0);
    }

}

$(cotabuses_pin_id).click(function(){
    $(this).toggleClass("highlight");
    if ($(this).attr("class").includes("highlight")) {
        map.addLayer(cotabuses_busrouteLayer);
        map.addLayer(cotabuses_geojsonLayer);
        cotabuses_busesmap_pinned = true;
    }
    else {
        map.removeLayer(cotabuses_busrouteLayer)
        map.removeLayer(cotabuses_geojsonLayer);
        cotabuses_busesmap_pinned = false;
    }
});
