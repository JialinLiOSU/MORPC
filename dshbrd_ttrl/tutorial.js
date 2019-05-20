//*********************add these lines to index.html *************************/
//<link href="./css/introjs.min.css" rel="stylesheet">
//<script src="./js/intro.min.js"></script>
//<script src="./scr/tutorial.js"></script>
//************************************************************************** */

$("#aaaaa").click(function () {//id of tutorial button
    console.log("tttt")
var intro = introJs();
intro.setOptions({
    steps: [
        {
            element: '#banner-widgets',//id of the item you want to zoom in
            intro: 'A few widgets are included here.',
            position: 'bottom'
        },
        {
            element: '#speaker-button',//id of the item you want to zoom in
            intro: 'Click here to read aloud the summary of the data.',
            position: 'bottom'
        },
        {
            element: '#help-button',//id of the item you want to zoom in
            intro: 'Click here to launch the help page.',
            position: 'bottom'
        },
        {
            element: '#announcers',//id of the item you want to zoom in
            intro: 'Summaries of the data sets are included here.',
            position: 'bottom'
        },
        {
            element: '#map',//id of the item you want to zoom in
            intro: 'This is the interactive map. Click on the bottom-left icon to change base maps.',
            position: 'right'
        },
        {
            element: "#" + find_grid_by_name("cogo").id,
            intro: 'The dashboard has many plots. This one shows the COGO bikes and docks. Move the mouse within to interact with the data and to see the map. To pin the map permanently on the base map, see the next page. Also, each plot can be <b>dragged and dropped</b> to anywhere within the browser.',
            position: 'bottom'
        },
        {
            element: "#" + find_grid_by_name("cogo").pinid,
            intro: 'Each plot has a pin icon <i class="iconlink fa fa-map-pin fa-1x"></i>. Click on the pin to put the map of this data on the base map.',
            position: 'bottom'
        },
        {
            element: "#" + find_grid_by_name("demography").id,
            intro: 'This one shows the histogram of different demographies.',
            position: 'bottom'
        },
        {
            element: "#histogram-vars",
            intro: 'Click on here to choose different demographic variables.',
            position: 'bottom'
        },
        {
            element: "#" + find_grid_by_name("tweets").id,
            intro: 'This plot shows the number of tweets in the past 24 hours for different categories.',
            position: 'bottom'
        },
        {
            element: "#" + find_grid_by_name("tweets").id + "-linktrend",
            intro: 'Click on &nbsp; <i class="iconlink fa fa-line-chart fa-1x"></i> &nbsp; to view the longer term trend of the theme.',
            position: 'bottom'
        },
        {
            element: "#" + find_grid_by_name("tweets").id + "-linkmap",
            intro: 'Click on &nbsp; <i class="iconlink fa fa-map-o fa-1x"></i> &nbsp; to view a more detailed map about the theme.',
            position: 'bottom'
        }

    ]
});

intro.start();

})
