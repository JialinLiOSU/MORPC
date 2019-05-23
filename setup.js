// $(function () {
var options = {
    resizable: {
        handles: 'block'
    },
    verticalMargin: 10
};
$('.grid-stack').gridstack(options);

// new function () {
this.serializedData = {
    'map': {x: 0, y: 0, width: 6, height: 8, id: "map"},
    'vmt': {x: 6, y: 1, width: 3, height: 4, id: "plot1", title: 'Vehicle Miles Traveled', pinid: 'vmt-pin', linkmap: null, linktrend: null},
    'soc': {x: 12, y: 1, width: 3, height: 4, id: "plot2", title: 'Share of Commuters', pinid:'soc-pin', linkmap: null, linktrend: null},
    'afv': {x: 6, y: 8, width: 3, height: 4,  id: "plot3", title: 'Percentage of AFV', pinid: 'afv-pin', linkmap: null, linktrend: null},
    'tmt': {x: 12, y: 8, width: 3, height: 4, id: "plot4", title: 'Trail Miles Traveled', pinid: 'tmt-pin', linkmap: null, linktrend: null},
    'afs': {x: 0, y: 12, width: 3, height: 4, id: "plot5", title: 'Percentage of AF Station', pinid: 'afs-pin', linkmap: null, linktrend: null},
    'ec': {x: 3, y: 12, width: 3, height: 4, id: "plot6", title: 'Energy Consumption', pinid: 'ec-pin', linkmap: null, linktrend: null},
    'ref': {x: 6, y: 12, width: 3, height: 4, id: "plot7", title: 'Renewable Energy Facilities', pinid: 'ref-pin', linkmap: null, linktrend: null},
    // 'delays': {x: 9, y: 12, width: 3, height: 4, id: "plot8", title: 'Bus Delays', pinid: 'cotalocation-delay-pin', linkmap: null, linktrend: null}
    // 'gas': {x: 0, y: 12, width: 3, height: 4, id: "plot9", title: 'Gas Prices ($)', pinid: 'gasprices-pin', linkmap: null, linktrend: null}
};

// used in other scripts to find the node using the name
function find_grid_by_name(name) {
    return this.serializedData[name];
}

this.grid = $('.grid-stack').data('gridstack');

this.loadGrid = function () {
    this.grid.removeAll();
    // var items = GridStackUI.Utils.sort(this.serializedData);
    // for (key in this.serializedData) {
    //     node = this.serializedData[key];
    //     this.grid.addWidget($('<div><div class="grid-stack-item-content" style="left:5px; right:5px;" id="'+ node.id +'"></div> </div>'), node.x, node.y, node.width, node.height);
    //     if (node.id == "map") {
    //         this.grid.movable('.grid-stack-item', false);
    //     }
    //     handle_widget(node);
    // }
    _.each(this.serializedData, function (node) {
        // tempid = node.id;
        if (node.id == "map") {
            this.grid.addWidget($('<div><div class="grid-stack-item-content" style="left:5px; right:5px;" id="'+ node.id +'holder"><div id="map"></div></div> </div>'), node.x, node.y, node.width, node.height);
            this.grid.movable('.grid-stack-item', false);
        }
        else {
            this.grid.addWidget($('<div><div class="grid-stack-item-content" style="left:5px; right:5px;" id="'+ node.id +'"></div> </div>'), node.x, node.y, node.width, node.height);
        }
        handle_widget(node);
    }, this);
    return false;
}.bind(this);

this.saveGrid = function () {
    this.serializedData = _.map($('.grid-stack > .grid-stack-item:visible'), function (el) {
        el = $(el);
        var node = el.data('_gridstack_node');
        return {
            x: node.x,
            y: node.y,
            width: node.width,
            height: node.height
        };
    }, this);
    $('#saved-data').val(JSON.stringify(this.serializedData, null, '    '));
    return false;
}.bind(this);

this.clearGrid = function () {
    this.grid.removeAll();
    return false;
}.bind(this);

$('#save-grid').click(this.saveGrid);
$('#load-grid').click(this.loadGrid);
$('#clear-grid').click(this.clearGrid);

this.loadGrid();

function handle_widget(node) {
    if (node.id == 'map')
        return;
    nodeid = "#"+node.id;
    titleid = node.id + '-title';
    $(nodeid).append('<div class="title-bar" id="' + titleid + '">');
    titleid = '#' + titleid;
    $(titleid).append('<span class="graph-title">' + node.title + '</span>');
    if (node.linkmap != null)
        $(titleid).append('<a href="' + node.linkmap + '"><i id="' + node.id + '-linkmap"' + ' class="iconlink right fa fa-map-o fa-1x"></i></a>');
    if (node.linktrend != null)
        $(titleid).append('<a href="'+node.linktrend+'"><i id="' + node.id + '-linktrend"' + ' class="iconlink right fa fa-line-chart fa-1x"></i></a>');
    $(titleid).append('<i id="'+node.pinid+'" class="iconlink right fa fa-map-pin fa-1x"></i>');
}


// air quality
var aq_colors = ["green", "yellow", "orange", "red", "purple", "maroon"]
var aq_font_colors = ["white", "grey", "grey", "white", "white", "white"]
var aq_levels = ["Good", "Moderate", "Unhealthy for Sensitive Groups",
                "Unhealthy", "Very Unhealthy", "Hazardous"];
var aq_bins = [50, 100, 150, 200, 300, 500]

var get_cur_level = function(x, bins) {
    for (i=0; i<bins.length; i++)
        if (x < bins[i])
            return i;
    return bins.length-1;
}


// Set up the base maps

var nightmap = L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
    subdomains: 'abcd'
});

var cartoLight = L.tileLayer("https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://cartodb.com/attributions">CartoDB</a>'
});

var mapbox = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoic2ZvbnRhbmVsbGEiLCJhIjoiNmYwZjA3MTdjNTcwN2M3YzA4YTU5OTRlYmMwZjgyZDMifQ.YA5J7xY_Z5BMqkQZfhDPAw');

var usgsImagery = L.layerGroup([L.tileLayer("http://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}", {
    maxZoom: 15,}), L.tileLayer.wms("http://raster.nationalmap.gov/arcgis/services/Orthoimagery/USGS_EROS_Ortho_SCALE/ImageServer/WMSServer?", {
    minZoom: 16,
    maxZoom: 19,
    layers: "0",
    format: 'image/jpeg',
    transparent: true,
    attribution: "Aerial Imagery courtesy USGS"
})]);

var Thunderforest_OpenCycleMap = L.tileLayer('http://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});

var baseMaps = {
    "MapBox street": mapbox,
    "Street map light": cartoLight,
    "Night map": nightmap,
    //    "OpenStreetMap": osmMapnik,
    //    "OpenStreetMap Black": osmBW,
    //    "Satellite": altmap,
    "USGS Imagery": usgsImagery,
    "OpenCycleMap": Thunderforest_OpenCycleMap
};

var layersControl = new L.Control.Layers(baseMaps, null, {collapsed: true, position: 'bottomleft'});

// Can add an overlay map for boundaries...

var map = L.map('map', {
    maxZoom: 19,
    minZoom: 9,
    zoomControl: false,
    attributionControl: false,
    scrollWheelZoom: false
});
map.setView([40.04, -83.02], 10);
map.addControl(layersControl)
new L.Control.Zoom({ position: 'topleft' }).addTo(map);
map.addLayer(mapbox, true);
map.scrollWheelZoom.disable();
