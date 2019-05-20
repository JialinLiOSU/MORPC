// NICELY set up map height prior to everything being loaded

var num_plot_completed = 0;
var times_set = 0;

var aq_colors = ["green", "yellow", "orange", "red", "purple", "maroon"]
var aq_font_colors = ["white", "grey", "grey", "white", "white", "white"]
var aq_levels = ["Good", "Moderate", "Unhealthy for Sensitive Groups",
                "Unhealthy", "Very Unhealthy", "Hazardous"];
var aq_bins = [50, 100, 150, 200, 300, 500]

var trips_colors = ["green", "grey", "red"];
var trips_levels = ["Good", "Normal", "Bad"];

var get_cur_level = function(x, bins) {
    for (i=0; i<bins.length; i++)
        if (x < bins[i])
            return i;
    return bins.length-1;
}

var total_completion = 0;
// var formatTime = d3.time.format("%A %B %d %H:%M")
// alert(formatTime(new Date()));


var curr_time = new Date();

// var curr_time = d3.time.format("%A, %b %d, %H:%M")(new Date());

var ttt = d3.select("#announcer0").html();

d3.select("#announcer0")
    .html(ttt + "<i class=\"fa fa-clock-o\" aria-hidden=\"true\"></i>&nbsp;"
        + d3.time.format("%a, %b %d, %H:%M")(curr_time))
    // .style("opacity", 0.4)
    .style("background-color", "grey")
    // .style("color", "#fafafa")
    ;

$(window).on("completePlot", function (e) {
    // alert('event: ' +  e.detail + ', a-bar: ' + $("#a-bar").outerHeight() + ', b-bar: ' + $("#b-bar").outerHeight());
    if (e.detail == 'air quality')
        num_plot_completed += 1;
    if (e.detail == 'histogram')
        num_plot_completed += 1;

    set_map_height();
    // the final height of a-bar is set after script-choropleth2.js and script-airquality.js are done
    // need to make sure the a-bar id is associated with the column of these two scripts
    // if (num_plot_completed == 2 && times_set == 0) { // only do this once
    //     time_set = 1;
    //     $("#map-colume").outerHeight($("#a-bar").outerHeight() - 2*parseInt($(".col-md-6").css("padding")));
    //     // alert("final: " + $("#a-bar").outerHeight() + " " + $("#map-colume").outerHeight());
    // }
    // else {
    //     // alert(parseInt($(".col-md-6").css("padding")));
    // }
});

function set_map_height() {
    if (num_plot_completed != 2)
        return;
    if (times_set != 0)
        return;
    num_plot_completed = 0;
    time_set = 1;
    $("#map-colume").outerHeight($("#a-bar").outerHeight() - 2*parseInt($(".col-md-6").css("padding")));
}

var traffic_msg;

$(window).on("completeTrips", function (e) {
    $.ajax({
        type: "GET",
        url: "http://curio.osu.edu/get_trip_info_one",
        // url: "http://gis.osu.edu/misc/trips/get-trip-info-one.php",
        data: {trip: "OSU to Polaris"},
        success: function(result, status) {
            var one_trip_data = d3.tsv.parse(result);
            var durations = [];
            one_trip_data.forEach(function(d, i) {
            	durations[i] = d.duration;
            });
            var cur_duration = durations.slice(-1);
            durations.sort(d3.ascending);
            var q25 = d3.quantile(durations, 0.25);
            var q75 = d3.quantile(durations, 0.90);

            var trips_bins = [q25, q75, q75+10];
            var cur_level = get_cur_level(cur_duration, trips_bins);
            // alert(cur_duration + ", " + ", " + d3.quantile(durations, 0.001) + "," + trips_bins);

            traffic_msg = "Traffic is " + trips_levels[cur_level];
            d3.select("#announcer1").html("<i class=\"fa fa-car\" aria-hidden=\"true\"></i>&nbsp;" + traffic_msg)
                // .style("opacity", 0.4)
                // .style("color", "white")
                .style("background-color", trips_colors[cur_level]);

            total_completion ++;
            last_call();

        }
    });
});

var aq_msg;

$(window).on("completeAQ", function (e) {
    max_aq = d3.max(d3.keys(aqsites), function(key) {return aqsites[key]["values"].slice(-1)[0].value;});
    var cur_level = get_cur_level(max_aq, aq_bins);

    aq_msg = "Air Quality is " + aq_levels[cur_level];
    d3.select("#announcer2").html("<i class=\"fa fa-cloud\" aria-hidden=\"true\"></i>&nbsp;" + aq_msg)
        // .style("opacity", 0.4)
        .style("color", aq_font_colors[cur_level])
        .style("background-color", aq_colors[cur_level]);
    total_completion ++;
    last_call();
});

var tweet_msg;

$(window).on("completeTweets", function (e) {
    var max_tweets = 0;
    var max_tweets_cat;
    var l_tweets = tweets_data.length;
    var num_keys = tweets_keys.length;
    tweets_keys.forEach(function(k) {
        if (k !== "date" && k != "total") {
            v = +tweets_data[l_tweets-1][k];   // data are still string, need + to make them num
            if ( v >= max_tweets) {
                max_tweets = v;
                max_tweets_cat = k;
            }
        }
    });

    max_tweets_cat = max_tweets_cat[0].toUpperCase() + max_tweets_cat.slice(1);
    msg = "<i class=\"fa fa-twitter\" aria-hidden=\"true\"></i> &nbsp;" + max_tweets_cat;
    tweet_msg = max_tweets_cat;

    d3.select("#announcer3")
        .html(msg)
        // .style("opacity", 0.4)
        .style("background-color", "steelblue")
        // .style("color", "white")
        ;

    total_completion ++;
    last_call();
});

// $(window).on("completeGas", function (e) {
//     total_completion ++;
//     last_call();
// });

// set resize listener, after all data are set...
function last_call() {
    if (total_completion<3)
        return;

    // This file contains functions that work when everything is loaded on the page.

    // handling resize event: all figures must be redrawn
    $(window).resize(function() {
        cogo_init(1);
        draw_cogo(1);

        histo_bar.remove();
        histo_init(1);
        draw_histogram(1);

        tweets_path_by_type.remove();
        tweets_init(1);
        draw_tweets(1);

        aq_lines.remove();
        aq_init(1);
        draw_aq(1);


        camera_init(1);

        // /// no more gas prices
        // gasplt_circles.remove();
        // gas_points.remove();
        // gasplt_init(1);
        // draw_gasprices(1);

        cotabuses_init(1);
        draw_cotabuses(1);

        cotalocation_init(1);
        draw_cotalocation(1);

    });
    // do this after everything else is done

    // responsiveVoice.speak("Thanks for using the dashboard. It is " + d3.time.format("%A, %b %d %I %M %p")(curr_time) + ". Currently" + traffic_msg + ", " + aq_msg + ", and tweets are mostly about " + tweet_msg);

}
