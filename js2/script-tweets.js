// this is the third version of the tweets trends
// use prefix: tweets_

//$("#tweets-title").text("Percent of Tweets");

var gridnode = find_grid_by_name('tweets');
var tweets_id = '#' + gridnode.id; // "#plot3";
var tweets_pin_id = '#' + gridnode.pinid;

//alert($(tweets_id).width());

// var parseDate = d3.time.format("%Y-%m-%d %H").parse;
var parseDateTweets = d3.time.format("%Y-%m-%d %H:%M:%S").parse;
// var parseDate2 = d3.time.format("%H").parse;
//var parseDate = d3.time.format("%Y%m%d").parse;
var tweets_color = d3.scale.category10(); // alert(color(0));
var formatx = d3.time.format("%m/%d %I:%M %p");

var tweets_margin = {top: 20, right: 60, bottom: 60, left: 30};
var tweets_width, tweets_height, tweets_x, tweets_y, tweets_xAxis, tweets_line;
var tweets_svg = null;
var tweets_path_by_type = null;
var tweets_data = null;
var tweets_keys = null;
var tweets_gg = null;
var tweets_hoverLine = null;
var tweets_rect = null;
var tweets_text = null;

var heatmap_layers = {};
var tweetsheatmap_pinned = false;

var tweets_largest_gap_time = -1;
var tweets_largest_gap = 0;

var cfg = {
    // radius should be small ONLY if scaleRadius is true (or small radius is intended)
    "radius": 0.08,
    "maxOpacity": .6,
    // scales the radius based on map zoom
    "scaleRadius": true,
    // if set to false the heatmap uses the global maximum for colorization
    // if activated: uses the data maximum within the current map boundaries
    //   (there will always be a red spot with useLocalExtremas true)
    "useLocalExtrema": false,
    // which field name in your data represents the latitude - default "lat"
    latField: 'lat',
    // which field name in your data represents the longitude - default "lng"
    lngField: 'lng',
    // which field name in your data represents the data value - default "value"
    valueField: 'count'
};

var heatmapLayer = new HeatmapOverlay(cfg);


tweets_svg = d3.select(tweets_id).append("svg");

tweets_svgg = tweets_svg
    .append("g")
    .attr("transform", "translate(" + tweets_margin.left + "," + tweets_margin.top + ")");

tweets_text = tweets_svgg
    .append('text')
    .attr("class", "hover-text")
    .attr("x", 20) // hover date text position
    .style("fill", "#959697");
    ;

tweets_init(0);

function tweets_init(init_state) {
    tweets_width = $(tweets_id).width() - tweets_margin.left - tweets_margin.right;
    tweets_height = $(tweets_id).height() - tweets_margin.top - tweets_margin.bottom;

    tweets_svg
        .attr("width", $(tweets_id).width())
        .attr("height", $(tweets_id).height()-35);

    tweets_x = d3.time.scale().range([0, tweets_width]);
    tweets_xAxis = d3.svg.axis()
        .scale(tweets_x)
        .ticks(4)
        .orient("bottom");

    tweets_y = d3.scale.linear().range([tweets_height, 0]);
    tweets_yAxis = d3.svg.axis()
        .scale(tweets_y)
        .ticks(4)
        .orient("left");

    tweets_line = d3.svg.line()
        .interpolate("basis")
        .x(function(d) { return tweets_x(d.time); })
        .y(function(d) { return tweets_y(d.value); });

    tweets_text
        .attr("y", tweets_height - (tweets_height-10)) // hover date text position
        ;

    if (init_state == 0) {
        tweets_svg
            .on("mouseenter", function(d, i) {
                if (!tweetsheatmap_pinned)
                    map.addLayer(heatmapLayer);
            })
            .on("mouseleave", function(d, i) {
                if (!tweetsheatmap_pinned)
                    map.removeLayer(heatmapLayer);
            });

        // http://gis.osu.edu/misc/twitter/query-times-sum.php?maxhours=24&precision=minute
        $.ajax( {
        	type: "GET",
            url: "http://curio.osu.edu/tweets",
            // url: "http://gis.osu.edu/misc/twitter/query-times-sum.php",
        	// data: "maxhours=24&precision=minute",
        	success: tweets_handle_twiter_data
        });
    }
}

function tweets_handle_twiter_data(result, status) {
    // testData = eval("(" + result + ")");
    testData = JSON.parse(result);
    for (i=0; i<testData['response'].length; i++)
        testData['response'][i]['max'] = testData['max'];
    // heatmapLayer._heatmap.setDataMax(testData['max']);
    heatmapLayer.setData(testData['response'][0]);

    // tweets_data = JSON.parse(result);
    tweets_keys = d3.keys(testData.response[0].tags);

    var tmp_data = [];
    // tweets_n = tweets_data.length;

    // the freq part of the data has everything (category and frequency)
    // now we add "time", which comes from the time part of the data
    for (i=0; i<testData.response.length; i+=3) { // ony use nums for every 3 time steps - smoother
	    entry = testData.response[i].tags;
	    entry["time"] = testData.response[i].date;
	    tmp_data.push(entry);
    }
    tweets_data = tmp_data;

    // This is data by time (the original rows)
    // tweets_data is an array of objects that can be called as
    // tweets_data[0].time, tweets_data[0]["Sports/Fitness"],
    // tweets_data[0].Food, etc.

    draw_tweets(0);

}

function tweets_handletwitterstats(result, status) {
    // tweets_data = JSON.parse(result);
    // tweets_keys = d3.keys(tweets_data[0]);
    //
    // var tmp_data = [];
    // // tweets_n = tweets_data.length;
    //
    // // the freq part of the data has everything (category and frequency)
    // // now we add "time", which comes from the time part of the data
    // for (i=0; i<tweets_data.length; i+=1) { // ony use nums for every 3 time steps - smoother
	//     entry = tweets_data[i];
	//     entry["time"] = tweets_data[i].date;
	//     tmp_data.push(entry);
    // }
    // tweets_data = tmp_data;
    //
    //
    // // This is data by time (the original rows)
    // // tweets_data is an array of objects that can be called as
    // // tweets_data[0].time, tweets_data[0]["Sports/Fitness"],
    // // tweets_data[0].Food, etc.
    //
    // draw_tweets(0);

}

function tweets_mousemove(d, i) {
    var date = tweets_x.invert(d3.mouse(this)[0]);
    // var idx = testData.response.length - parseInt(testData.response.length * d3.mouse(this)[0] / tweets_width) - 1;
    var xPosition = d3.mouse(this)[0];
    var idx = parseInt(testData.response.length * xPosition / tweets_width);
    if (idx>=24)
        return;
    heatmapLayer.setData(testData['response'][idx]);

    tweets_text.text(formatx(date));
    // tweets_text.text(formatx(date) + ", total " + testData.response[idx].tags.total);


    d3.select("#hover-line-tweets") // select hover-line and changing attributes to mouse position
            .attr("x1", xPosition)
            .attr("x2", xPosition)
            .style("opacity", 1); // Making line visible
    // tweets_svg.selectAll(".labels").style("display", "block").call(value_label, date);
}

// this part is not stable, not needed for now.
// var tweets_bisect = d3.bisector(function(d) { return d.time; }).right;
// function value_label(gdata, date) {
//     // gdata is the graph objects (curves)
//     // var msg = 'info:' + date + ' <br/>';
//     gdata.each(function(d, i) {
//         // alert(Object.keys(d.values[0]))
//         // d has the array of all values for a curve, we use time to get the position of date
//         var k = tweets_bisect(d.values, date);
//         var v = d.values[k].value;
//         v2 = d.values[k];
//         v1 = v2;
//         if (k>0)
//             v1 = d.values[k-1];
//         interpolate = d3.interpolateNumber(v1.value, v2.value);
//         range = v2.time - v1.time;
//         v = interpolate((date % (range*1.2)) / (range*1.2));
//         // v = d.values[k].value;
//
//         // msg += d.name + ": k=" + k + " " + range + "<br/>"
//         //     + v1.value + " " + v2.value + " -> " + v + "<br/>"
//         //     + v1.time + " " + v2.time + " " + (date % range) / range + "<br/>";
//         var xposition = tweets_x(date);
//         if (k>d.values.length/2) xposition -= 20;
//         var tt = d3.select(this);
//         var yposition = tweets_y(v);
//     	tt.text(d.name + " " + parseInt(v))
// 	       .attr("transform",  function() { return "translate(" + xposition + "," + yposition + ")"; })
//            .style("font-size","10px")
//        	   .style("fill", function(d) { return tweets_color(d.name); })
//            ;
//     });
//     // $('#debug').html(msg);
// }


function tweets_mouseout(d, i) {
    d3.select("#hover-line-tweets").style("opacity", 0); // Making line invisible
    // aq_svg.selectAll(".aq_circles").style("display", "none");
    // hoverText.text(null);
    tweets_svg.selectAll(".labels").style("display", "none");
}

function draw_tweets(s) {

    if (s==0) {
        // Each category gets a color except time, and total?
        tweets_color.domain(d3.keys(tweets_data[0]).filter(function(key) {
            return key!= "date" && key != "time" && key != "total";
        }));

        tweets_data.forEach(function(d) {
            d.time = parseDateTweets(d.time);
        });

        // establish a new data var as an array:
        // tweets_types[0] contains data in the first category
        // which has tweets_types[0].name as the name of the category
        // and tweets_types[0].values as an array containing
        // values[i].time and values[i].value
        //
        tweets_data_by_type = tweets_color
            .domain()
            .map(function(name) {
            	return {
            	    name: name,
            	    values: tweets_data.map(function(d) {
                        return {time: d.time, value: +d[name]};
            	    })
            	};
            }
        );
    }

    // find the time with max-min gap
    tweets_data.forEach(function(d, i) {
        // alert(Object.keys(d) + " " + i);
        vars = [];
        vi = 0;
        for (const key in d) {
            if (key != 'total' && key != 'time')
            vars[vi++] = d[key];
        }
        vars.sort(function(a, b){return a - b});
        mingap = 1000000;
        maxgap = 0;
        for (j=0; j<vars.length; j++) {
            gap = vars[j+1] - vars[j];
            if (gap<mingap)
            // if (gap>maxgap)
                mingap = gap;
        }
        // alert(maxgap)
        if (mingap>tweets_largest_gap) {
            tweets_largest_gap = mingap;
            tweets_largest_gap_time = i;
        }
        // d.each(function(d, i) {})
    });

    tweets_x.domain(d3.extent(tweets_data, function(d) { return d.time; }));

    // alert(d3.extent(tweets_data, function(d) { return d.time; }));

    tweets_y.domain([
    	d3.min(tweets_data_by_type, function(c) {
    	    return d3.min(c.values, function(v) { return v.value; }); }),
    	d3.max(tweets_data_by_type, function(c) {
    	    return d3.max(c.values, function(v) { return v.value; }); })
    ]);

    if (s==0) {
        var evt = $.Event('completeTweets');
        evt.detail = 'data';
        $(window).trigger(evt);

        tweets_svgg.append("g")
        	.attr("class", "x axis")
        	.attr("transform", "translate(0," + tweets_height + ")")
        	.call(tweets_xAxis);

        tweets_svgg.append("g")
    	    .attr("class", "y axis")
    	    .call(tweets_yAxis);

        tweets_gg = tweets_svgg.append("g");

        tweets_hoverLine = tweets_gg.append("g")
            .attr("class", "hover-line-tweets")
            .append("line")
            .attr("id", "hover-line-tweets")
            .attr("x1", 10).attr("x2", 10)
            // .attr("y1", 0).attr("y2", tweets_height + 10)
            .style("pointer-events", "none") // Stop line interferring with cursor
            .style("opacity", 1e-6); // Set opacity to zero

        tweets_rect = tweets_gg.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", tweets_width)
            .attr("height", tweets_height)
            .style("fill", "none")
            .style("pointer-events", "all")
            // .style("display", "none")
            .on("mousemove", tweets_mousemove)
            .on("mouseout", tweets_mouseout);
    }
    else {
        tweets_svg.selectAll(".x.axis").call(tweets_xAxis);
        tweets_svg.selectAll(".y.axis").call(tweets_yAxis);
    }

    tweets_path_by_type = tweets_gg.selectAll(".type")
        .data(tweets_data_by_type)
        .enter().append("g")
        .attr("class", "type")
        ;
    tweets_path_by_type.append("path")
        .attr("class", "line")
        .attr("d", function(d) { return tweets_line(d.values); })
        .style("stroke", function(d) { return tweets_color(d.name); });

    // sort the last values and use the rank to label
    var last_tweets_vals = [];
    var lasttw = tweets_data.slice(-1)[0];
    for (k in lasttw) {
        if (k != "time" & k != "total")
            last_tweets_vals.push({
                name: k,
                value: lasttw[k],
                date: lasttw.time
            })
    }
    last_tweets_vals.sort(function(a, b) {return b.value - a.value; });
    last_tweets_valsobj = {};
    for (i=0; i<last_tweets_vals.length; i++) {
        last_tweets_valsobj[last_tweets_vals[i].name] = {date:last_tweets_vals[i].date, value: i};
    }
    tweets_path_by_type.append("text").attr("class", "tweets_label")
        .datum(function(d) { return {name: d.name, value: last_tweets_valsobj[d.name].value}; })
        .attr("y", function(d, i) { return tweets_height/2 + d.value*15; })
        .attr("x", function(d, i) { return tweets_width + 10; })
        .style("font-size","10px")
        .style("fill", function(d) { return tweets_color(d.name); })
        .text(function(d) { return d.name.charAt(0).toUpperCase() + d.name.slice(1); });
        ;

    // tweets_gg.append("rect")
    //     .attr("x", -80)
    //     .attr("y", -20)
    //     .attr("width", tweets_width+100)
    //     .attr("height", tweets_height+40)
    //     .style('visibility', 'hidden')
    //     .style("pointer-events", "all")
    //     ;

    // Now adjust the lines, each type gets a curve by the way tweets_data_by_type is set
    tweets_path_by_type.selectAll(".line")
        .attr("d", function(d) { return tweets_line(d.values); });

    tweets_rect
    // tweets_gg.append("rect")
    //     .attr("x", 0)
    //     .attr("y", 0)
        .attr("width", tweets_width)
        .attr("height", tweets_height)
        // .style("fill", "none")
        // .style("pointer-events", "all")
        // // .style("display", "none")
        // .on("mousemove", tweets_mousemove)
        // .on("mouseout", tweets_mouseout);
        ;



    // tweets_hoverLine = tweets_gg.append("g")
    //     .attr("class", "hover-line-tweets")
    //     .append("line")
    //     .attr("id", "hover-line-tweets")
    //     .attr("x1", 10).attr("x2", 10)
    tweets_hoverLine.attr("y1", 0).attr("y2", tweets_height + 10);
        // .style("pointer-events", "none") // Stop line interferring with cursor
        // .style("opacity", 1e-6); // Set opacity to zero

}

$(tweets_pin_id).click(function() {
    $(this).toggleClass("highlight");
    if ($(this).attr("class").includes("highlight")) {
	    map.addLayer(heatmapLayer);
        tweetsheatmap_pinned = true;
    }
    else {
	    map.removeLayer(heatmapLayer);
        tweetsheatmap_pinned = false;
	//points.classed("scanned", function(dd) { return false; }); // reset points
    }
});
