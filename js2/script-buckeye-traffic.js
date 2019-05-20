// script for traffic cameras
// use prefix cameras_

var gridnode = find_grid_by_name('cameras');
var cameras_id = '#' + gridnode.id; // "#plot5";
var cameras_pin_id = '#' + gridnode.pinid;

var cameras_layer;
var cameras_pinned = false;

var intvhandle = null;
var imgsrc= "";
var current_imgsrc = "";
var current_feature = null;
var cameras_llids = []; // leaflet layer (feature) ids

var cameras_style1 = {
    fillColor: "#00a900",
    radius: 4,
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.95
}
var cameras_style2 = {
    fillColor: "#99a900",
    radius: 3,
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.95
}

cameras_highlight_style = {
    weight: 2,
    radius: 6,
    color: '#f99',
    fillColor: '#fa9911',
    fillOpacity: 0.95
};

var patt = new RegExp("High St");
var current_xx = 0;
for (i=0; i<cameras.features.length; i++) {
    if (patt.test(cameras.features[i].properties.Description) == true) {
        current_xx = i;
        break
    }
}

for (i=0; i<cameras.features.length; i++) {
    desc = cameras.features[i].properties.Description;
    j = desc.indexOf("If this camera image is not currently updating or displaying properly");
    if (j != -1) {
        cameras.features[i].properties.Description = desc.substring(0, j);
    }
}

var cameras_layer = L.geoJson(cameras, {
    onEachFeature: onEachFeature,
    style: function(feature) {
        if (feature.properties.ImageUpdateInterval <= 5)
            return cameras_style1;
        else {
            return cameras_style2;
        }
    },
    pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng);
    }
});


var cameras_svg = null;
var cameras_margin = {top: 15, right: 5, bottom: 5, left: 5};
cameras_svg = d3.select(cameras_id);

cameras_svgg = cameras_svg
    .append("g")
    .attr("transform", "translate(" + cameras_margin.left + "," + 3*cameras_margin.top + ")");

cameras_svgg
    .append('div')
    .attr('id', 'video1')
    ;

imgsrc = cameras.features[current_xx].properties.SmallImage;
current_imgsrc = imgsrc;
current_feature = cameras_layer.getLayer(cameras_llids[current_xx]);
current_feature.setStyle(cameras_highlight_style);


// cameras_svg
//     .append("svg:image")
//     .attr('id', 'video1')
//     .attr('x', cameras_margin.left)
//     .attr('y', -cameras_margin.top)
//     .attr('width', cameras_width)
//     .attr('height', cameras_height)
//     // .attr("xlink:href", imgsrc)
//     ;

camera_init(0);

function camera_init(init_state) {
    cameras_width = $(cameras_id).width() - cameras_margin.left - cameras_margin.right;
    cameras_height = $(cameras_id).height() - cameras_margin.top - cameras_margin.bottom;
    cameras_svgg
        .attr('width', cameras_width)
        .attr('height', $(cameras_id).height());

    show_img();
    if (init_state == 0) {
        intvhandle = setInterval(show_img, 5000);
        cameras_svg
            .on("mouseenter", function(d, i) {
                if (!cameras_pinned)
                    map.addLayer(cameras_layer);
                    if (current_feature)
                        if (!L.Browser.ie && !L.Browser.opera)
                            current_feature.bringToFront();
                })
            .on("mouseleave", function(d, i) {
                if (!cameras_pinned)
                    map.removeLayer(cameras_layer);
                })
            ;
    }
}


// jQuery.fn.redraw = function() {
//     return this.hide(0,function() {$(this).show(100);});
//     // hide immediately and show with 100ms duration
// };

function show_img() {
    // document.getElementById("video").innerHTML = "<img src=\"" + imgsrc + "\"/>";
	imgsrcx=imgsrc + "?t=" + new Date().getTime();
	id = "#video1";

    sty = ' style="margin-top:' + cameras_margin.top + 'px"';
	$(id).html('<img class="cameraimg" ' + sty + 'src="' + imgsrcx + '"'
        + ' width="' + cameras_width + '"'
        // + ' height="' + cameras_height + '"'
        + '/>');
    // alert($(id).html());
}

function stop_interval() {
    clearInterval(intvhandle);
}

function resume_interval() {
    intvhandle = setInterval(show_img, 5000);
}

function onEachFeature(feature, layer) {
    id = L.stamp(layer); // assign id to the layer and return it. Better than the above line

    cameras_llids.push(id);

    var popupContent = "Description";
    if (feature.properties && feature.properties.Description) {
	    popupContent = feature.properties.Description;
    }

    layer.bindPopup(popupContent);
    layer.on('click', function (e) {
    	if (intvhandle != null)
    	    clearInterval(intvhandle);
    	imgsrc = feature.properties.SmallImage;
        current_imgsrc = feature.properties.SmallImage;
    	show_img();
    	intvhandle = setInterval(show_img, 5000);

    	if (current_feature != null)
    	    cameras_layer.resetStyle(current_feature);
    	current_feature = e.target;
    	current_feature.setStyle(cameras_highlight_style);
        if (!L.Browser.ie && !L.Browser.opera)
            current_feature.bringToFront();
    });
    layer.on('mouseover', function(e) {
        imgsrc = feature.properties.SmallImage;
    	show_img();
        this.openPopup();
    });
    layer.on('mouseout', function(e) {
        imgsrc = current_imgsrc;
        show_img();
        this.closePopup();
    });
}

// function cameras_style(feature) {
//     if (feature.properties.ImageUpdateInterval > 5)
//         return cameras_style2;
//     else
//         return cameras_style1;
// }

$(cameras_pin_id).click(function() {
    $(this).toggleClass("highlight");
    if ($(this).attr("class").includes("highlight")) {
	   map.addLayer(cameras_layer);
       cameras_pinned = true;
    }
    else {
	   map.removeLayer(cameras_layer);
       cameras_pinned = false;
    }
});
