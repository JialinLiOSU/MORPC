


function sidebarInit(stateVariables) {
    // sidebar basic function
    $("#side-bar-wrapper").css("width", window.innerWidth / 4)
    $('.grid-stack').gridstack({ cellHeight: 500 });
    $('.grid-stack-sidebar').gridstack({ cellHeight: window.innerWidth / 2 });
    $(window).resize(setup.resizeHandler);
    $(".side-bar-button").on("click", setup.navHandler);
    $("#side-bar-title").css('left', $("#side-bar-wrapper").width() / 2);
    $("#sidebar-close-button").on("click", setup.navHandler);
    

    $(".collapsible").on("click", function (event) {
        this.classList.toggle("active");
        var content = this.nextElementSibling;
        console.log(content)
        var x = event.currentTarget.children[0];
        var y = event.currentTarget.children[1];
        if (x.hidden === true) {
            x.hidden = false;
            y.hidden = true;
            setup.stateVariables['sidebarPanel'][event.currentTarget.innerText].expended = false;
            $(".collapsible").css("border-bottom", "solid lightgray 1px");
        } else {
            x.hidden = true;
            y.hidden = false;
            setup.stateVariables['sidebarPanel'][event.currentTarget.innerText].expended = true;
            $(".collapsible").css("border-bottom", "None");
        }
        $(content).toggleClass('content-display');

    });

    // add map legend in sidebar
    var svg = d3.select("#map-info-container").append("svg")
        .attr("id", "legend-svg")
        .attr("width", $("#side-bar-wrapper").width())
        .attr("height", 80);
    // var legend = new DefaultLegend();
    
    // add supplementary information below map legend
    $("#map-info-container").append('<hr>');
    $("#map-info-container")
        .append('<textarea class = "map-text";  id="text_map"; rows="6" readonly> </textarea>');
    document.getElementById('text_map').value = 'Supplementary Information \n Indicator Name: \n Unit of Measure: \n';

    // Add a dropdown menu for basemap type selection
    basemapTypeSelect();

    // add a switch button to select standard or compact mode
    $("#options-control-container").append('<br /><h5 id = "cardSizeSwitcher" style="padding-left:10px; color: #000000;text-align: left; font-size: 15px;font-family: "proxima-nova", sans-serif;font-weight: bold">Switch Card Size:</h5> <label id = "card-size-switch" class="switch"><input id="card-size-check" style="display: inline-block; size:125%" type="checkbox"><span class="slider round"></span></label>');
    $("#options-control-container").append('<hr>');
    $("#card-size-check").click(setup.cardSizeSwitch)
}


function basemapTypeSelect(){
    // Add a dropdown menu for basemap type selection
    $("#options-control-container").append('<h5 id = "options-control-title" style=" padding-left: 10px; color: #000000;text-align: left; font-size: 15px;font-family: "proxima-nova", sans-serif;font-weight: bold">     Basemap Type:</h5>');
    var mapButtonContainer = document.getElementById("options-control-container");
    var selectList = document.createElement("select");
    selectList.id = "basemap-select";
    selectList.className = "sidebar-select";
    mapButtonContainer.appendChild(selectList);
    // ESRI basemap options
    var basemapOptions = ["esriGray", "esriTopo", "esriDarkGray", "esriImagery"];
    // Displayed name for the ESRI basemap options
    var basemapOptions_Name = ["Light Gray Basemap", "Topographic Basemap", "Dark Gray Basemap", "Satellite Basemap"]
    //create options for each ESRI basemap options
    for (var i = 0; i < basemapOptions.length; i++) {
        var option = document.createElement("option");
        option.value = basemapOptions[i];
        option.text = basemapOptions_Name[i];
        option.id = (i + 1).toString();
        selectList.appendChild(option);
    }
    $('#basemap-select') // basemap select change function
        .change(function () {
            var currentOptID = this[this.selectedIndex].id;
            var baseMapName = this[this.selectedIndex].value;
            //build new plot instance based on the grid
            setup.changeBasemap(baseMapName);
            setup.stateVariables['sidebarPanel']['Options'].basemap = baseMapName;
            setup.changeURL();
        }); // clickEvent is attached here;
}