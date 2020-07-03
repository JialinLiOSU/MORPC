class Setup {
    constructor() {
        var self = this;
        this.acceptZoom = 8;
        // Sidebar
        this.sideBarStatus = 0;
        this.squareWidth = 6;
        this.squareWidthNarrow = 4;
        this.squareHeight = 1;
        this.sidebarWidth = window.innerWidth / 4;
        this.cellHeight = (window.innerWidth - 30 - this.sidebarWidth) / 3;

        this.options = {
            resizable: {
                handles: 'block'
            },
            verticalMargin: 10,
            handle: ".title-bar",
            cellHeight: (window.innerWidth - 30 - this.sidebarWidth) / 3
        };
        this.optionsSidebar = {
            resizable: {
                handles: 'block'
            },
            verticalMargin: 10,
            handle: ".title-bar",
            cellHeight: this.sidebarWidth
        };
        this.selectList;
        this.highlightedDOM = {};
        this.highlightColor = "red";
        this.lastHoveredBarID = ""

        $('.grid-stack').gridstack(this.options);
        $('.grid-stack-sidebar').gridstack(this.optionsSidebar);

        this.stateVariables = {
            'cardPanel': {
                'map': { x: 0, y: 0, width: this.squareWidth, height: this.squareHeight, id: "map" },
                'grid_1': { x: 0, y: 0, width: this.squareWidth, height: this.squareHeight, id: "grid_1", content: "goal_1_1" }, // Default content
                'grid_2': { x: this.squareWidth, y: 0, width: this.squareWidth, height: this.squareHeight, id: "grid_2", content: "goal_1_5" },
                'grid_3': { x: 0, y: 1, width: this.squareWidth, height: this.squareHeight, id: "grid_3", content: "goal_3_1" },
                'grid_4': { x: this.squareWidth, y: 1, width: this.squareWidth, height: this.squareHeight, id: "grid_4", content: "goal_1_6" },
                'grid_5': { x: 0, y: 2, width: this.squareWidth, height: this.squareHeight, id: "grid_5", content: "goal_1_7a" }
            },
            'sidebarPanel': {
                isOpen: true,
                map: { center: { lat: 39.95, lng: -83.02 }, zoomlevel: 8, symbolLayer: '', popups: {} },
                'Options': { expended: false, basemap: 'Esri Grey', switchCardSize: false },
                'Map Visualizations': { expended: false, mapLayerType: 'Propotional Symbol' },
                'Map Control': { expended: false, scaleDependenceActive: false, basemap: 'Esri Grey' },
                'Map Plot Control': { expended: false, switchCardSize: false, countyLabels: false },
                'Layer Query': { expended: false },
                expended: true
            },
            'tutorial': {
                isActive: true,
            }
        }

        this.settingGroupPlot = { // used for options of select tool groups
            'plot_1': {
                id: 1,
                groupName: 'Energy Consumption',
                plotNames: ['Reduce vehicle miles traveled', 'Reduce commuters driving alone and increase active transportation',
                    'Increase alternative fuel vehicles', 'Increase trail miles traveled', 'Increase the number of alternative fuel stations',
                    'Reduce per capita energy consumption', 'Increase local renewable energy projects and generating capacity'
                ],
                shortNames: ['Reduce vehicle miles traveled', 'Increase transportation efficiency', 'Increase alternative fule vehicles', 'Increase trail miles traveled',
                    'Increase alternative fuel stations', 'Reduce energy consumption', 'Increase renewable energy projects'
                ]
            },
            'plot_2': {
                id: 2,
                groupName: 'Natural Resources',
                plotNames: ['Reduce emissions to meet federal air quality standards', 'Increase the number of people receiving air quality information and education',
                    'Reduce the amount of municipal solid waste per capita disposed in the landfill', 'Minimize greenfield development and promote infill and redevelopment',
                    'Reduce per capita water consumption', 'Improve water quality in the Upper Scioto Watershed'
                ],
                shortNames: ['Reduce emissions', 'Increase air quality info&education', 'Reduce solid waste per person',
                    'promote infill development', 'Reduce water consumption', 'Improve water quality'
                ]
            },
            'plot_3': {
                id: 3,
                groupName: 'Economic Opportunity',
                plotNames: ['Increase the number of businesses in Central Ohio with established sustainability policies and practices'],
                shortNames: ['Increase businesses with sustainability']
            },
            'plot_4': {
                id: 4,
                groupName: 'Sustainable Neighborhoods',
                plotNames: ['Encourage MORPC member communities to adopt complete streets policies or policies that contain those elements',
                    'Target infrastructure development to serve a higher number of people and jobs and increase sidewalk coverage of arterials and collectors',
                    'Reduce the number of fatalities and serious injuries from crashes', 'Target transit and bikeway infrastructure development to serve a higher number of people',
                    'Increase the annual number of income eligible households receiving free weatherization and safety-related home repairs',
                    'Increase the number of Central Ohio Greenways trail miles'
                ],
                shortNames: ['Encourage complete street policies', 'Increase sidewalk coverage', 'Reduce serious injuries',
                    'Serve more transit infrastructure', 'Repair more qualified homes', 'Increase greenways miles'
                ]
            },
            'plot_5': {
                id: 5,
                groupName: 'Collaboration',
                plotNames: ['Establish the annual Summit on Sustainability as a premiere environmental conference through high participation and visibility',
                    'Increase number of local governments committed to sustainability'
                ],
                shortNames: ['Summit on Sustainability Attendance', 'Sustainable 2050 Participation']
            }
        }; // Consider omitting this. Use settingPlot instead. Feel free to add whatever fields you need.


        this.grid = $('.grid-stack').data('gridstack');
        this.gridSidebar = $('.grid-stack-sidebar').data('gridstack');
        this.token = '';
    }

    // find the current gridSettings of a grid with ID
    findGridByID(ID) {
        return this.stateVariables['cardPanel'][ID];
    }

    findPlotByID(ID) {
        return this.settingPlot[ID];
    }

    // according to indicator ID to find the responding plot settings
    findPlotsByGoalID(goalID) {
        var settingPlot = this.settingPlot;
        var valueList = Object.values(settingPlot);
        var plotsList = [];
        for (var i = 0; i < valueList.length; i++) {
            console.log(valueList[i]["goal"])
            if (valueList[i]["goal"] == goalID) {
                plotsList.push(valueList[i]);
            }
        }
        return plotsList;
    }

    //based on current grid setting get the list for (stacked)bar and line chart
    getPlotsList() {
        var plotKeyList = [];
        for (var i = 1; i < Object.keys(this.stateVariables['cardPanel']).length; i++) {
            plotKeyList.push(Object.keys(this.stateVariables['cardPanel'])[i]);
        }
        return plotKeyList;
    }

    // title bar, pin button and select
    // if def==1, set selected option as you want
    addTitle(gridID, def = 0) {
        //add title bar 
        var gridHashID = "#" + gridID;
        var titleID = gridID + '-title';
        $(gridHashID).append('<div class="title-bar" id="' + titleID + '" >');
        var titleHashID = '#' + titleID;
        var dropId = gridID + "-drop";
        $(titleHashID).append('<i class="fa fa-chevron-down" id="' + dropId + '" style="float: left; margin: 5px 5px;"></i>');
        $(".title-bar").css({ 'background': '#f0f0f0' })
            .on("click", function () {
                titleStatus = true;
            });
        //create select container
        var selectContainer = document.createElement("div");
        selectContainer.className = "btn-group";

        // download button data-toggle="modal" data-target="#share-modal"
        var downloadID = gridID + "-download";
        var saveButton = $(titleHashID).append('<i id="' + downloadID + '" class="iconlink right fas fa-cloud-download-alt" data-toggle="modal" data-target="#download-modal"></i>');
        $("#" + downloadID).on("click", function (d) {
            downloadClick(gridID);
        });
        // information button 
        addInfoButton(gridID);

        // Close button
        var closeButID = gridID + "-close-button";
        $(titleHashID).append('<a href="javascript:void(0)" id="' + closeButID + '" class="closebtn">&times;</a>');
        $('#' + closeButID).on("click", closeButtonClick);

        // Add a dropdown menu
        var selectList = addDropdownMenu(gridID, def);

        // add description text to card plots
        addDescText(gridID, this.stateVariables['cardPanel'][gridID], this.settingPlot);
        return selectList;
    }

    addWidg() { // a full grid card with title and plot

        //remove the add button of the last grid
        var button = document.getElementById('addButton');
        var gridID = button.parentNode.id;
        button.parentNode.removeChild(button);
        //add select tools
        var selectList = setup.addTitle(gridID, 0);
        //draw plot on the current grid widget
        var plotID = 'goal_' + selectList[selectList.selectedIndex].id;

        setup.initPlot(gridID, plotID);

        if (document.getElementById("card-size-check").checked) {
            setup.addNewWidget(gridID, setup.squareWidthNarrow, false);

        } else {
            setup.addNewWidget(gridID, setup.squareWidth, false);
        }
    }

    // an empty grid card only with a plus button
    addNewWidget(gridID, squareWidth, isLoadingGrid) { // 
        var gridContainer = $("#grid-container").data('gridstack');
        var numGrid = setup.grid.container.context.childElementCount;
        var addID;
        if (gridID == undefined) {
            addID = 'grid_' + (numGrid + 1);
        } else {
            addID = 'grid_' + (parseInt(gridID.split("_")[1]) + 1);
        }

        var addIDHash = '#' + addID;
        var x, y, existUpCard0, existUpCard4;
        [x, y] = setup.getPositionLastCard();

        // calculate position of new widget based on the position of bottommost card
        var cardSizeChecked = document.getElementById("card-size-check").checked;
        if (x < squareWidth || (cardSizeChecked && x == squareWidth)) {
            x = x + squareWidth;
        }
        else {
            y = y + 1;
            existUpCard0 = setup.existUpCard(0, y); // whether can put card at x = 0; 
            existUpCard4 = setup.existUpCard(squareWidth, y); // whether can put card at x = 6; 
            if (existUpCard0 == true) {
                x = 0;
            } else {
                if (existUpCard4 == true) {
                    x = squareWidth;
                }
            }
        }

        // addWidget is a build-in function of grid-stack
        gridContainer.addWidget($('<div><div class="grid-stack-item-content" style="left:0px; right: 5px ;"id="' + addID + '"></div> </div>'), x, y, squareWidth, setup.squareHeight);
        $('.grid-stack-item-content').on('mouseenter', function (d, i) { // change color of background of select tool
            if (titleStatus) {
                return;
            }
            var bgColor = "#d9d9d9";
            var closebtn = document.getElementById(d.currentTarget.id + '-close-button');// e.g., grid_2-close-button
            if (closebtn != undefined) {
                document.getElementById(d.currentTarget.id + '-title').style.backgroundColor = bgColor // title bar background
                closebtn.style.backgroundColor = bgColor // select background
            }
        })
            .on('mouseleave', function (d, i) {
                if (titleStatus) {
                    return;
                }
                var closebtn = document.getElementById(d.currentTarget.id + '-close-button');
                var gridTitle = document.getElementById(d.currentTarget.id + '-title');
                if (closebtn != undefined) {
                    gridTitle.style.backgroundColor = '#f0f0f0'
                    closebtn.style.backgroundColor = '#f0f0f0'
                }
            });

        $(addIDHash).append('<button class="addButton" id="addButton">+</button>');
        var gridWidth = $("#" + Object.keys(setup.stateVariables['cardPanel'])[1]).width();
        var gridHeight = $("#" + Object.keys(setup.stateVariables['cardPanel'])[1]).height();
        var buttonWidth = gridWidth / 2;
        var width = setup.stateVariables['cardPanel'][Object.keys(setup.stateVariables['cardPanel'])[1]].width;
        var height = setup.stateVariables['cardPanel'][Object.keys(setup.stateVariables['cardPanel'])[1]].height;

        //add new record in this.stateVariables['cardPanel']
        setup.stateVariables['cardPanel'][addID] = Object.assign({}, setup.stateVariables['cardPanel']['grid_' + (numGrid % 5).toString()]);
        setup.stateVariables['cardPanel'][addID].id = addID;
        setup.stateVariables['cardPanel'][addID].x = x;
        setup.stateVariables['cardPanel'][addID].y = y;

        setup.stateVariables['cardPanel'][addID].width = width;
        setup.stateVariables['cardPanel'][addID].height = height;
        setup.stateVariables['cardPanel'][addID].content = 'addButton';

        $('#addButton').css('top', gridHeight / 2 - buttonWidth / 2)
            .css('left', gridWidth / 2 - buttonWidth / 2)
            .css("width", buttonWidth)
            .css('height', buttonWidth)
            .css('font-size', buttonWidth / 3)
            .on("click", setup.addWidg);
        return addID;
    }

    // used in function of addNewWidget() to get the position of the bottommost card
    getPositionLastCard() {
        /* decide the position of new widget */
        var numGrid = setup.grid.container.context.childElementCount;
        var x = 0, y = 0, tempX, tempY;
        // get the position of the bottommost card
        for (var i = 0; i < numGrid; i++) {
            tempX = parseInt(setup.grid.container.context.childNodes[i.toString()].dataset['gsX']);
            tempY = parseInt(setup.grid.container.context.childNodes[i.toString()].dataset['gsY']);
            if (tempY > y) {
                x = tempX;
                y = tempY;
            }
            if (tempY == y && tempX > x) {
                x = tempX;
            }
        }
        return [x, y];
    }
    // used in function of addNewWidget() to identify whether the upper card of position x,y exists
    existUpCard(x, y) {
        // identify whether there are card existing upside of the supposed position
        var numGrid = setup.grid.container.context.childElementCount;
        var upCardX = x, upCardY = y - 1;
        var existUpCard = false;
        var tempX, tempY;

        // traverse each card to check
        for (var i = 0; i < numGrid; i++) {
            tempX = parseInt(setup.grid.container.context.childNodes[i.toString()].dataset['gsX']);
            tempY = parseInt(setup.grid.container.context.childNodes[i.toString()].dataset['gsY']);
            if (tempX < upCardX + this.squareWidth && tempX >= upCardX && tempY == upCardY) {
                existUpCard = true;
                break;
            }
        }
        return existUpCard;
    }

    createGrid(node) {
        if (node.id == 'map' || node.content == 'addButton')
            return;

        // when the card is not for map and add button
        // add title for the card
        this.addTitle(node.id, 1);
    }

    getLayerName(layerID) { //from layerID to get full name of layer, the name 
        var mapName;
        switch (layerID) {
            case "esriDarkGray":
                mapName = "DarkGray";
                return mapName;
                break;
            case "esriTopo":
                mapName = "Topographic";
                return mapName;
                break;
            case "esriImagery":
                mapName = "Imagery";
                return mapName;
                break;
            case "esriGray":
                mapName = "Gray";
                return mapName;
                break;
            default:
                return fullLayerFlags.getItemByLayerID(layerID).layerName;
                break;
        }
    }

    changeBasemap(basemap) { //change the icon of each options when changing basemap
        map.removeLayer(baseLayer);
        baseLayer = L.esri.basemapLayer(setup.getLayerName(basemap));
        map.addLayer(baseLayer);
    }

    plotSelectChangeHandler(d) {
        var currentOptID = this[this.selectedIndex].id;
        //build new plot instance based on the grid
        var gridID = d.target.parentElement.id.split("-")[0];
        var plotID = "goal_" + currentOptID;
        $("#plot-svg-" + gridID).remove();
        // delete the svg of legend container in normal mode
        if (!document.getElementById("card-size-check").checked) {
            var legendContainer = document.getElementById('legend-container-' + gridID);
            if (legendContainer.childNodes.length != 0) {
                legendContainer.removeChild(legendContainer.childNodes[0]);
            }
        }
        // legendContainer.removeChild(legendContainer.childNodes[0]);
        setup.initPlot(gridID, plotID);
        document.getElementById('text_' + gridID).value = setup.settingPlot[plotID].text; // change explaining texts

        setup.stateVariables['cardPanel'][gridID].content = plotID;
        setup.changeURL();
    }

    // Below are the functions that handle actual exporting:
    getSVGString(svgNode) {
        svgNode.setAttribute('xlink', 'http://www.w3.org/1999/xlink');
        var cssStyleText = getCSSStyles(svgNode);
        appendCSS(cssStyleText, svgNode);

        var serializer = new XMLSerializer();
        var svgString = serializer.serializeToString(svgNode);
        svgString = svgString.replace(/(\w+)?:?xlink=/g, 'xmlns:xlink='); // Fix root xlink without namespace
        svgString = svgString.replace(/NS\d+:href/g, 'xlink:href'); // Safari NS namespace fix

        return svgString;

        function getCSSStyles(parentElement) {
            var selectorTextArr = [];

            // Add Parent element Id and Classes to the list
            selectorTextArr.push('#' + parentElement.id);
            for (var c = 0; c < parentElement.classList.length; c++)
                if (!contains('.' + parentElement.classList[c], selectorTextArr))
                    selectorTextArr.push('.' + parentElement.classList[c]);

            // Add Children element Ids and Classes to the list
            var nodes = parentElement.getElementsByTagName("*");
            for (var i = 0; i < nodes.length; i++) {
                var id = nodes[i].id;
                if (!contains('#' + id, selectorTextArr))
                    selectorTextArr.push('#' + id);

                var classes = nodes[i].classList;
                for (var c = 0; c < classes.length; c++)
                    if (!contains('.' + classes[c], selectorTextArr))
                        selectorTextArr.push('.' + classes[c]);
            }

            // Extract CSS Rules
            var extractedCSSText = "";
            for (var i = 0; i < document.styleSheets.length; i++) {
                var s = document.styleSheets[i];

                try {
                    if (!s.cssRules) continue;
                } catch (e) {
                    if (e.name !== 'SecurityError') throw e; // for Firefox
                    continue;
                }

                var cssRules = s.cssRules;
                for (var r = 0; r < cssRules.length; r++) {
                    if (contains(cssRules[r].selectorText, selectorTextArr))
                        extractedCSSText += cssRules[r].cssText;
                }
            }


            return extractedCSSText;

            function contains(str, arr) {
                return arr.indexOf(str) === -1 ? false : true;
            }

        }

        function appendCSS(cssText, element) {
            var styleElement = document.createElement("style");
            styleElement.setAttribute("type", "text/css");
            styleElement.innerHTML = cssText;
            var refNode = element.hasChildNodes() ? element.children[0] : null;
            element.insertBefore(styleElement, refNode);
        }
    }


    svgString2Image(svgString, width, height, format, callback) {
        var format = format ? format : 'png';

        var imgsrc = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString))); // Convert SVG string to data URL

        var canvas = document.createElement("canvas");
        var context = canvas.getContext("2d");

        canvas.width = width;
        canvas.height = height;

        var image = new Image();
        image.onload = function () {
            context.clearRect(0, 0, width, height);
            context.drawImage(image, 0, 0, width, height);

            canvas.toBlob(function (blob) {
                var filesize = Math.round(blob.length / 1024) + ' KB';
                if (callback) callback(blob, filesize);
            });
        };

        image.src = imgsrc;
    }

    initMap(stateVariables) {// initialize map settings
        // Can add an overlay map for boundaries...
        map = L.map('map', {
            maxZoom: 19,
            minZoom: 0,
            zoomControl: false,
            attributionControl: false,
            scrollWheelZoom: true
        });
        map.setView([39.95, -83.02], 8);

        // update map settings from stateVariables from url
        var mapCenLat = stateVariables['sidebarPanel']['map'].center.lat;
        var mapCenLng = stateVariables['sidebarPanel']['map'].center.lng;
        var zoomlevel = stateVariables['sidebarPanel']['map'].zoomlevel;
        map.setView([mapCenLat, mapCenLng], zoomlevel);

        new L.Control.Zoom({ position: 'topleft' }).addTo(map);
        baseLayer = L.esri.basemapLayer("Gray");
        baseLayer.addTo(map);
        map.scrollWheelZoom.disable();
    }

    initPlot(gridID, plotID, cardSizeChecked = false) { // Draw what plot (plotID) to where (gridID)
        // The grid setting is found from current stateVariables
        var gridSetting = setup.findGridByID(gridID);

        gridSetting['seqid'] = Object.keys(this.stateVariables['cardPanel']).indexOf(gridID) - 1; // -1 due to map
        gridSetting.id = gridID;
        var plotSetting = setup.findPlotByID(plotID);
        var data = plotSetting.data; // Find another way to feed the data
        var plotInstance;

        // console.log(plotSetting)
        switch (plotSetting.atype) {
            case "pie":
                plotInstance = new piePlot(gridSetting, plotSetting, data);
                break;
            case "bar":
                plotInstance = new barPlot(gridSetting, plotSetting, data);
                plotList.push(plotInstance);
                break;

            case "line":
                plotInstance = new linePlot(gridSetting, plotSetting, data);
                plotList.push(plotInstance);
                break;
            case "stackBar":
                plotInstance = new stackPlot(gridSetting, plotSetting, data);
                plotList.push(plotInstance);
                break;
            case "stackBar2":
                plotInstance = new stackPlot2(gridSetting, plotSetting, data);
                break;
        }

        // plotList.push(plotInstance);

        plotInstance.drawPlot();

        // Register
        this.stateVariables['cardPanel'][gridID].content = plotID;
    }

    createOptions() {
        // based on settingGroupPlot and plotsetting, add content to options for select tool update
        this.groupNames = [];
        this.dpOptions = [];
        this.firstOptions = [];
        for (var prop in this.settingGroupPlot) {
            if (this.settingGroupPlot.hasOwnProperty(prop)) {
                var groupNum = this.settingGroupPlot[prop].id; // group id from groupplot
                this.groupNames.push(groupNum.toString() + ' ' + this.settingGroupPlot[prop].groupName);
                var shortNamesWithID = [];
                var idxOption;
                for (var plotsetting in this.settingPlot) {
                    var groupID = this.settingPlot[plotsetting].titleID.split('.')[0]; // group id from plotsetting
                    if (this.settingPlot.hasOwnProperty(plotsetting) && groupNum == parseInt(groupID)) {
                        shortNamesWithID.push(this.settingPlot[plotsetting].titleID + ' ' + this.settingPlot[plotsetting].title)
                    }
                }
                this.dpOptions.push(shortNamesWithID);
                this.firstOptions.push(shortNamesWithID[0]);
            }
        }
    }

    // based on whether card-size-switch is checked, update the size and position of cards
    updateGrid(isChecked, id, i) {
        var numCardRow, width, height;
        var grid = $('.grid-stack').data('gridstack');
        if (isChecked) {
            numCardRow = 3;
            width = setup.squareWidthNarrow;
        } else {
            numCardRow = 2;
            width = setup.squareWidth;
        }
        height = setup.squareHeight;

        // calculate the parameters to be updated for grid cards
        var gridcell = setup.grid.container.context.childNodes[(i).toString()];
        var indCol = i % numCardRow;
        var indRow = (i - indCol) / numCardRow;
        var x = width * indCol;
        var y = height * indRow;
        setup.stateVariables['cardPanel'][id].x = x;
        setup.stateVariables['cardPanel'][id].y = y;
        grid.update(gridcell, x, y, width, height); // update grid using inner function of gridstack
    }

    cardSizeSwitch(d) {
        // function triggered by switch card size button
        var settingGrid = Object.values(setup.stateVariables['cardPanel']);

        var width = $("#grid_1").width() * 2 / 3;
        var height = $("#grid_1").height();
        var buttonWidth = width / 2;
        var isChecked = document.getElementById("card-size-check").checked;

        if (isChecked) {
            // when card size switch is checked
            var gridCard;
            for (var i = 0; i < settingGrid.length - 1; i++) { // i:grid id number
                var id = setup.stateVariables['cardPanel'][Object.keys(setup.stateVariables['cardPanel'])[i + 1]].id;
                gridCard = document.getElementById(id);
                if (i < 4) {
                    gridCard.style.top = '0px';
                }

                setup.updateGrid(isChecked, id, i);

            }
            $(".card-text-container").css("display", "none");
            $(".legend-container").css("display", "none");

            setup.stateVariables['sidebarPanel']['Map Plot Control'].switchCardSize = true;
        } else {
            // when card size switch is not checked
            width = $("#grid_1").width() * 3 / 2;
            for (var i = 0; i < settingGrid.length - 1; i++) { // i:grid id number
                var id = setup.stateVariables['cardPanel'][Object.keys(setup.stateVariables['cardPanel'])[i + 1]].id;
                setup.updateGrid(isChecked, id, i);
            }
            $(".card-text-container").css("display", "block");
            $(".legend-container").css("display", "block");
            setup.stateVariables['sidebarPanel']['Map Plot Control'].switchCardSize = false;
        }

        for (var key in setup.stateVariables['cardPanel']) {
            var obj = setup.stateVariables['cardPanel'][key];
            if (document.getElementById("card-size-check").checked) {
                obj['width'] = 4;
            } else {
                obj['width'] = 6;
            }
        }
        $('.plot-select').css("width", width - 80);
        $('#addButton').css('top', height / 2 - buttonWidth / 2).css('left', width / 2 - buttonWidth / 2).css("width", buttonWidth).css('height', buttonWidth).css('font-size', buttonWidth / 3);
        setup.changeURL();
        setup.resizeHandler();
    }

    windowMouseDown() {
        if (barInStatus == true || barPinStatus == false) {
            return true
        }
        barPinStatus = false;
        titleStatus = false;
        console.log("global mousedown!")
        var DOM = setup.highlightedDOM['DOM']
        if (DOM != undefined) {
            d3.select("#" + DOM.getAttribute("id")).dispatch("mouseleave");
            d3.select("#" + DOM.getAttribute("id")).dispatch("mouseout");

            // $("#" + DOM.getAttribute("id")).trigger("mouseleave");
            // $(DOM).css("fill-opacity", setup.highlightedDOM['fill-opacity']);
            $(DOM).css("fill", setup.highlightedDOM['fill']);

            if (DOM.tagName == "circle") {
                d3.select("#" + DOM.getAttribute("id")).attr("r", 4);
            }

            // highlight the legend
            var category = $("#" + DOM.getAttribute("id")).attr("category");
            console.log(category)
            $("#stack-legend-" + category).css("fill", "black");
            $("#stack-legend-" + category).css("font-weight", "light");
        }
    }

    loadGrid() {
        var self = this;
        this.grid.removeAll();

        _.each(this.stateVariables['cardPanel'], function (node) {
            if (node.id == "map") {
                // add a widget for map in sidebar
                this.gridSidebar.addWidget($('<div><div class="grid-stack-item-content" style="left:0px; right:5px; height:' + this.sidebarWidth + 'px' + ';" id="' + node.id + 'holder"><div id="map"></div></div> </div>'), node.x, node.y, node.width, 1);
                this.gridSidebar.movable('.grid-stack-item', false);
            } else if (node.content != 'addButton') {
                // add the cards
                this.grid.addWidget($('<div><div class="grid-stack-item-content" style="left:0px; right: 5px ;" id="' + node.id + '"></div></div>'), node.x, node.y, node.width, node.height);
                // gridContainer.addWidget($('<div><div class="grid-stack-item-content" id="' + addID + '"></div> </div>'), x, y, squareWidth, setup.squareHeight);
                this.grid.movable('.grid-stack-item', false);
            }
            self.createGrid(node);
        }, this);

        // add an empty card with adding button
        if (document.getElementById("card-size-check").checked) {
            this.addNewWidget(undefined, this.squareWidthNarrow, true);
        } else {
            this.addNewWidget(undefined, this.squareWidth, true);
        }
        return false;
    }

    userSystemSetup() {
        $("#signin-button").on("click", this.signinHandler);
        $("#signup-button").on("click", this.signupHandler);
        $("#switch-signup-button").on("click", function (e) {
            $("#flip-card").flip(true);
        });

        $("#signup-button").on("click", this.signupHandler);
        $("#flip-card").flip({
            trigger: "manual"
        });
        $("#back-to-signin-button").on("click", function (e) {
            $("#flip-card").flip(false)
        });
    }

    init() {
        this.createOptions(); // for initialize select tools in each card
        // ------------------------------------ read url ------------------------------------
        var state = setup.getURL();  // THIS IS A TEMPORARY FIX! AMP 2019-01-31
        var stateObject;
        if (state != null) {
            state = window.atob(state);
            stateObject = JSON.parse(state);
            setup.stateVariables = stateObject;
        }
        sidebarInit(setup.stateVariables);
        // set default proportionalSymbol layer
        this.openNav();
        if (setup.stateVariables['sidebarPanel']['expended'] == false) {
            $('#sidebar-close-button').click();
        }
        // create the cards (without plot) based on current stateVariables['cardPanel']
        this.loadGrid();
        //map setting
        this.initMap(setup.stateVariables); // can only be set up after loadGrid()

        //options menu
        if (setup.stateVariables['sidebarPanel']['Options'].expended == true) {
            $('#options-sidebar-button').click();
        }

        var basemap = setup.stateVariables['sidebarPanel']['Options'].basemap;
        var selectMap = document.getElementById('basemap-select');
        for (var i = 0; i < selectMap.length; i++) {
            if (selectMap[i].value == basemap) {
                selectMap.options[i].selected = true;
                setup.changeBasemap(basemap);
                break;
            }
        }
        if (setup.stateVariables['sidebarPanel']['Map Plot Control'].switchCardSize == true) {
            var test = document.getElementById("card-size-check").checked;
            $("#card-size-check").click();
            test = document.getElementById("card-size-check").checked;
        }
        $(window).on('mousedown', this.windowMouseDown);

        // ------------------------------------ Plots Instances ------------------------------------
        for (var i = 0; i < Object.keys(this.stateVariables['cardPanel']).length - 2; i++) {
            var gridID = Object.keys(this.stateVariables['cardPanel'])[i + 1];
            var plotID = this.stateVariables['cardPanel'][gridID].content;
            var data = this.settingPlot[plotID].data;
            this.initPlot(gridID, plotID, data);
        }

        // ------------------------------------ Maplots Instances ------------------------------------
        maplot = new maPlots(layerWithFieldsURL);
        // ------------------------------------ Banner setup ------------------------------------
        $(".menusel").on("click", this.themeChangeHandler);

        // ------------------------------------ User system setup ------------------------------------
        this.userSystemSetup();
        // map proportional symbol layer setting
        if (propSymbLayerList.length != 0) {
            for (var i = 0; i < propSymbLayerList.length; i++) {
                map.removeLayer(propSymbLayerList[i]);
            }
            propSymbLayerList = [];
            $('.legend').remove();
            var svg = d3.select("#legend-svg");
            svg.selectAll('*').remove();
        }
        var symbolLayer = setup.stateVariables['sidebarPanel'].map.symbolLayer;
        maplotSymbol = new proportionalSymbol(layerWithFieldsURL, symbolLayer['year'], symbolLayer['attID'], symbolLayer['color']);

        //------------------------------------tutorial-------------------------------------
        // if (stateObject['tutorial']['isActive'] == true) {
        //     $('#start-tutorial').trigger("click");
        // }
    }

    signinHandler(e) {
        e.preventDefault();
        var signinURL = "https://cura-sco-dev.asc.ohio-state.edu/test/api/v1/users/login"
        var postdata = {
            email: $("#input-email").val(),
            password: $("#input-password").val()
        }
        console.log(JSON.stringify(postdata), typeof (JSON.stringify(postdata)))
        $.ajax(
            {
                type: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "*/*",
                    "Cache-Control": "no-cache"
                },
                url: signinURL,
                dataType: "json",
                data: JSON.stringify(postdata),
                timeout: 2000,
                success: function (result) {
                    console.log(result)
                },
                error: function (jqXHR, exception) {
                    var msg = '';
                    if (jqXHR.status === 0) {
                        msg = 'Not connect.\n Verify Network.';
                    } else if (jqXHR.status == 404) {
                        msg = 'Requested page not found. [404]';
                    } else if (jqXHR.status == 500) {
                        msg = 'Internal Server Error [500].';
                    } else if (exception === 'parsererror') {
                        msg = 'Requested JSON parse failed.';
                    } else if (exception === 'timeout') {
                        msg = 'Time out error.';
                    } else if (exception === 'abort') {
                        msg = 'Ajax request aborted.';
                    } else {
                        msg = 'Uncaught Error.\n' + jqXHR.responseText;
                    }
                    $('#post').html(msg);
                }

            }
        )
    }

    signupHandler(e) {
        e.preventDefault();
        var signinURL = "https://cura-sco-dev.asc.ohio-state.edu/test/api/v1/users/"
        var postdata = {
            email: $("#input-email-signup").val(),
            password: $("#input-password-signup").val(),
            name: $("#input-name-signup").val()
        }
        console.log(JSON.stringify(postdata), typeof (JSON.stringify(postdata)))
        $.ajax(
            {
                type: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "*/*",
                    "Cache-Control": "no-cache"
                },
                url: signinURL,
                dataType: "json",
                data: JSON.stringify(postdata),
                timeout: 2000,
                success: function (result) {
                    console.log(result)
                },
                error: function (jqXHR, exception) {
                    var msg = '';
                    if (jqXHR.status === 0) {
                        msg = 'Not connect.\n Verify Network.';
                    } else if (jqXHR.status == 404) {
                        msg = 'Requested page not found. [404]';
                    } else if (jqXHR.status == 500) {
                        msg = 'Internal Server Error [500].';
                    } else if (exception === 'parsererror') {
                        msg = 'Requested JSON parse failed.';
                    } else if (exception === 'timeout') {
                        msg = 'Time out error.';
                    } else if (exception === 'abort') {
                        msg = 'Ajax request aborted.';
                    } else {
                        msg = 'Uncaught Error.\n' + jqXHR.responseText;
                    }
                    $('#post').html(msg);
                }
            }
        )
    }

    themeChangeHandler(e) {
        var goalID = this.getAttribute("goal");
        var goalIdx = goalID.split("_")[1];
        var settingGrid = Object.values(setup.stateVariables['cardPanel']);
        var cardStateVariables = setup.stateVariables['cardPanel'];
        var numAvaibleGrid = settingGrid.length - 2;

        for (let [key, value] of Object.entries(cardStateVariables)) {
            if (key != 'map') {
                delete cardStateVariables[key];
            }
        }

        var dpOptionList = setup.dpOptions[goalIdx - 1];
        var numGridNeeded = dpOptionList.length;
        var isCompact = document.getElementById("card-size-check").checked;

        var gridID, goalID;
        for (var i = 0; i < numGridNeeded; i++) {
            gridID = 'grid_' + (i + 1);
            goalID = 'goal_' + (goalIdx) + '_' + dpOptionList[i].split(' ')[0].split('.')[1];
            // cardStateVariables[gridID] = cardStateVariables['map'];
            cardStateVariables[gridID] = Object.assign({}, cardStateVariables['map']);
            cardStateVariables[gridID].id = gridID;
            cardStateVariables[gridID].height = setup.squareHeight;
            cardStateVariables[gridID].content = goalID;
            if (isCompact) {
                cardStateVariables[gridID].width = setup.squareWidthNarrow;
                cardStateVariables[gridID].x = i % 3 * setup.squareWidthNarrow;
                cardStateVariables[gridID].y = Math.floor(i / 3) * setup.squareHeight;
            } else {
                cardStateVariables[gridID].width = setup.squareWidth;
                cardStateVariables[gridID].x = i % 2 * setup.squareWidth;
                var test = 1 / 2;
                cardStateVariables[gridID].y = Math.floor(i / 2) * setup.squareHeight;
            }

        }

        setup.grid.removeAll();

        _.each(cardStateVariables, function (node) {
            if (node.id != "map" && node.content != 'addButton') {
                // add the cards
                setup.grid.addWidget($('<div><div class="grid-stack-item-content" style="left:0px; right: 5px ;" id="' + node.id + '"></div></div>'), node.x, node.y, node.width, node.height);
                setup.grid.movable('.grid-stack-item', false);
            }
            setup.createGrid(node);
        });

        // add an empty card with adding button
        if (document.getElementById("card-size-check").checked) {
            setup.addNewWidget(undefined, setup.squareWidthNarrow, true);
        } else {
            setup.addNewWidget(undefined, setup.squareWidth, true);
        }

        for (var i = 0; i < Object.keys(setup.stateVariables['cardPanel']).length - 2; i++) {
            var gridID = Object.keys(setup.stateVariables['cardPanel'])[i + 1];
            var plotID = setup.stateVariables['cardPanel'][gridID].content;
            var data = setup.settingPlot[plotID].data;
            setup.initPlot(gridID, plotID, data);
        }
        var width = $("#grid_1").width(); // width of cards
        $('.plot-select').css("width", width - 80);
        if (document.getElementById("card-size-check").checked) {
            $(".card-text-container").css("display", "none");
            $(".legend-container").css("display", "none");
        }
        setup.resizeHandler();
    }

    navHandler() { // Toggle sidebar handler
        if (setup.sideBarStatus == 0) {
            setup.openNav();
            setup.stateVariables['sidebarPanel'].expended = true;
        } else {
            setup.closeNav();
            setup.stateVariables['sidebarPanel'].expended = false;
        }
        setup.changeURL();
    }

    openNav() {
        document.getElementById("side-bar").style.width = $("#side-bar-wrapper").width() + "px";
        document.getElementById("grid-container").style.width = ($("body").width() - 10 - $("#side-bar-wrapper").width()) + "px"
        document.getElementById("banner-container").style.width = ($("body").width() - 10 - $("#side-bar-wrapper").width()) + "px"

        setup.sideBarStatus = 1;
        $("#mini").css("visibility", "hidden");
    }

    closeNav() {
        document.getElementById("side-bar").style.width = "0";
        document.getElementById("grid-container").style.width = "100%";
        document.getElementById("banner-container").style.width = "100%";
        setup.sideBarStatus = 0;
        $("#mini").css("visibility", "visible");
    }

    resizeHandler(d) {
        // change gridcontainer witdth based on the current window width and sidebar width
        var gridWidth = ($("body").width() - setup.sidebarWidth) + "px";

        // setup.cellHeight = (window.innerWidth - 30 - this.sidebarWidth) / 3;
        // setup.options.cellHeight = (window.innerWidth - 30 - this.sidebarWidth) / 3;
        // setup.options = {
        //     resizable: {
        //         handles: 'block'
        //     },
        //     verticalMargin: 10,
        //     handle: ".title-bar",
        //     cellHeight: (window.innerWidth - 30 - this.sidebarWidth) / 3
        // };

        var gridContainer = document.getElementById("grid-container");
        if (setup.sideBarStatus == 1) {
            gridContainer.style.width = gridWidth;
        }

        // change card size in gridstack
        var changeRatio = $("body").width() / bodyWidth;
        var width = $("#grid_1").width(); // width of cards
        var height;
        if (!document.getElementById("card-size-check").checked) {
            height = width * 2 / 3;
        } else {
            height = width;
        }
        var buttonWidth = width / 2;

        var deltaHeight = height - setup.options.cellHeight;
        $('.plot-select').css("width", width - 80);

        var settingGrid = setup.stateVariables['cardPanel'];
        var gridCard, gridID;
        for (var i = 0; i < Object.keys(settingGrid).length - 1; i++) { // i:grid id number
            gridCard = document.getElementById("grid_" + (i + 1));
            gridCard.style.height = height + "px";
            gridID = Object.keys(settingGrid)[i + 1];

            if (!document.getElementById("card-size-check").checked) {
                gridCard.style.top = settingGrid[gridID].y * deltaHeight + "px";
            } else {
                if (i > 2) {
                    gridCard.style.top = settingGrid[gridID].y * deltaHeight + "px";
                }

            }
        }
        bodyWidth = $('body').width();

        // change size of each chart
        var numCardsSelect = setup.grid.container.context.childElementCount - 1;

        for (var i = 0; i < numCardsSelect; i++) {
            var curGridID = setup.grid.container.context.childNodes[i.toString()].childNodes['0'].id;
            var select = document.getElementById(curGridID + "-select");

            //change plots
            var currentOptID = select[select.selectedIndex].id;
            //build new plot instance based on the grid
            var plotID = "goal_" + currentOptID;
            $("#plot-svg-" + curGridID).remove();
            $("#card-legend-svg-" + curGridID).remove();
            setup.initPlot(curGridID, plotID);

            //change text box size
            if (!document.getElementById("card-size-check").checked) {
                $(".card-text-container").css({ 'width': width / 3.7, 'height': height / 3, 'left': width * 2 / 3 });
                $(".card-text").css({ 'width': width / 3.7, 'height': height / 3 });
                $(".legend-container").css({ 'width': width / 3.7, 'height': height / 3, 'left': width * 2 / 3, 'top': height / 2, 'border-opacity': 0 });
                $("#text_" + curGridID).css({ 'width': width / 3.7 });
            }
        }
        //change add button
        var curGridID = setup.grid.container.context.childNodes[numCardsSelect.toString()].childNodes['0'].id;
        $('#addButton').css('top', height / 2 - buttonWidth / 2)
            .css('left', width / 2 - buttonWidth / 2)
            .css("width", buttonWidth).css('height', buttonWidth)
            .css('font-size', buttonWidth / 3)
            .on("click", setup.addWidg);
    }

    changeURL() {
        var newUrl = JSON.stringify(setup.stateVariables);
        newUrl = window.btoa(newUrl);
        newUrl = '?' + newUrl
        history.pushState(setup.stateVariables, '', newUrl);
    }
    getURL() {
        var url = window.location.href;
        var state = url.split('?')[1];
        return state
    }
}

// ------------------------------------ Global variables ------------------------------------
var layerURL = "https://cura-sco-dev.asc.ohio-state.edu/data/Ohio.geojson";
var layerWithFieldsURL = "https://cura-sco-dev.asc.ohio-state.edu/data/OhioWithFields.geojson";
var prominentCountiesOf15 = ['Franklin', 'Delaware', 'Fairfield', 'Fayette', 'Hocking', 'Knox', 'Licking', 'Logan', 'Madison', 'Marion', 'Morrow', 'Perry', 'Pickaway', 'Ross', 'Union']

var colorList = ["#00B2BF", "#2A7F67", "#0075BF", "#26686d", "#909738", "#5AB65F", "#92b0d7", "#d65828", "#6ebbab"];

var highLightColorList = ['#4D8000', '#B33300', '#CC80CC',
    '#66664D', '#991AFF', '#E666FF', '#4DB3FF', '#1AB399',
    '#E666B3', '#33991A', '#CC9999', '#B3B31A', '#00E680',
    '#4D8066', '#809980', '#E6FF80', '#1AFF33', '#999933',
    '#FF3380', '#CCCC00', '#66E64D', '#4D80CC', '#9900B3',
    '#E64D66', '#4DB380', '#FF4D4D', '#99E6E6', '#6666FF'
];

var maPlotFeaturesList = [39041, 39049, 39117];
var maPlotLayer; // %%!!!!%% : This is global.
var maplot;
var plotList = [];

var propSymbLayerList = [];
var maplotSymbol;
var attributeList = ['a', 'b', 'c', 'd', 'e', 'f'];

var map; // Global
var baseLayer;
const countyCentroidsURL = "https://cura-sco-dev.asc.ohio-state.edu/data/county_centroids.geojson"
var countyLabelsLayer;

var barPinStatus = false;
var titleStatus = false;
var barInStatus = false;

String.prototype.hashCode = function () {
    var hash = 0, i, chr;
    if (this.length === 0) return hash;
    for (i = 0; i < this.length; i++) {
        chr = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};

var setup = new Setup();
var bodyWidth = $("body").width();

// read the county level data into memory
var layerWithFields;
$.get(layerWithFieldsURL, null, function (mapData) {
    layerWithFields = mapData;
});

// Code to retrieve an example data from database 
// Need to be modified after we have complete data

// var dataCounty;
// var state_promises = [
//     $.ajax({
//         url: "https://cura-sco-dev.asc.ohio-state.edu/test/api/v1/geos/counties/csv/2.1a",
//         async: false,
//         dataType: "text",
//         success: function (csvd) {
//             dataCounty = $.csv.toArrays(csvd);// get the data from database
//         }
//     }),
//     // $.get("https://cura-sco-dev.asc.ohio-state.edu/test/api/v1/geos/counties/csv/2.1a"),
//     $.get("https://cura-sco-dev.asc.ohio-state.edu/data/OhioWithFields.geojson"),
//     // $.get(layerWithFieldsURL)
// ];
// Promise.all(state_promises).then(ready);
// function ready(all_data) {
//     // var dataCounty = all_data[0];
//     var dataRandom = all_data[1];
//     layerWithFields = JSON.parse(dataRandom);// the current randomly generated data
//     // based on geoid of county and the year to merge data from database to the current variable of county level data
//     var geoID;
//     var features = layerWithFields.features
//     for (var i = 1; i <= dataCounty.length; i++) {
//         geoID = dataCounty[i][1];
//         geoID = geoID.split('.')[0];
//         for (let [key, value] of Object.entries(features)) {
//             if (value.properties.GEOID == geoID){
//                 features[key].properties[dataCounty[i][2]]['a'] = dataCounty[i][3];
//             }
//         }
//     }
//     console.log('test');
// }

$.ajax(
    {
        // retrive data of plot from database json file
        type: "GET",
        headers: {
            "Content-Type": "application/json",
            "Accept": "*/*",
            "Cache-Control": "no-cache"
        },
        url: "https://cura-sco-dev.asc.ohio-state.edu/test/api/v1/geos/general_data",
        dataType: "json",
        timeout: 1000,
        success: function (result) {
            setup.settingPlot = {}
            // Modify from response to old Camel style
            _.each(result, function (item) {
                setup.settingPlot[item.id] = item;
                setup.settingPlot[item.id]["range"] = [item["lowerrange"], item["upperrange"]]
                setup.settingPlot[item.id]["baselineValues"] = item["baselinevalues"]
                setup.settingPlot[item.id]["baselineYears"] = item["baselineyears"]
                setup.settingPlot[item.id]["targetValues"] = item["targetvalues"]
                setup.settingPlot[item.id]["targetYears"] = item["targetyears"]
                setup.settingPlot[item.id]["titleID"] = item["titleid"]
                // console.log(item)
            })

            console.log("**************************************************")
            console.log("******************On-line mode.******************")
            console.log("**************************************************")
        },
        error: function (jqXHR, exception) {
            // if 
            setup.settingPlot = {
                "goal_1_1": {
                    id: "goal_1_1",
                    goal: "goal_1",
                    titleID: "1.1",
                    title: 'Reduce vehicle miles traveled',
                    fullName: 'Reduce vehicle miles traveled',
                    range: [0, 10000],
                    highLightFeaturesList: [39041, 39049],
                    layerURL: layerURL,
                    atype: "line",
                    targetYears: [2020],
                    targetValues: [8971],
                    baselineYears: [2016],
                    baselineValues: [9443],
                    data: [
                        { "key": 2013, "value": 9524.40 },
                        { "key": 2014, "value": null },
                        { "key": 2015, "value": 9231.90 },
                        { "key": 2016, "value": 9514.70 },
                        { "key": 2017, "value": 9482.80 },
                    ], // This is temporary. dON'T RELY ON THIS!
                    unit: "Miles",
                    text: "Vehicle miles traveled per capita is a measure of traffic volumes over distance relative to population. The growing region still relies heavily on cars, and has only varied incrementally in recent years. Between 2013 and 2015, there was a drop of 3%. However, since then, VMT has crept back up, keeping pace with population growth.",
                },
                "goal_1_2a": {
                    id: "goal_1_2a",
                    goal: "goal_1",
                    titleID: "1.2a",
                    title: 'Reduce commuters driving alone',
                    fullName: 'Reduce the percentage of commuters driving alone',
                    range: [0, 100],
                    highLightFeaturesList: [39041, 39049],
                    layerURL: layerURL,
                    atype: "bar",
                    targetYears: [2020],
                    targetValues: [80],
                    baselineYears: [2016],
                    baselineValues: [82],
                    data: [
                        { "key": 2012, "value": 82.3709 },
                        { "key": 2016, "value": 82.0494 },
                    ], // This is temporary. dON'T RELY ON THIS!
                    unit: "%",
                    text: "A growing region means more people need to reach their destinations each day. Recent estimates suggest little change in the share of commuters who drive alone, pointing to a continuing need to implement strategies that help residents rely less on their vehicles.",
                },
                "goal_1_2b": {
                    id: "goal_1_2b",
                    goal: "goal_1",
                    titleID: "1.2b",
                    title: 'Increase commuters using alternative modes',
                    fullName: 'Increase the percentage of commuters riding transit, bicycling, or walking',
                    range: [0, 10],
                    highLightFeaturesList: [39041, 39049],
                    layerURL: layerURL,
                    atype: "stackBar",
                    targetYears: [2020],
                    targetValues: [6],
                    baselineYears: [2016],
                    baselineValues: [4.8],
                    labels: ["Biked", "PublicTransit", "Walked"],
                    data: [
                        { "key": 2012, "Biked": 0.492, "PublicTransit": 1.923, "Walked": 2.122 },
                        { "key": 2016, "Biked": 0.524, "PublicTransit": 2.061, "Walked": 2.228 },
                    ], // This is temporary. dON'T RELY ON THIS!
                    unit: "%",
                    text: "One way MORPC and its partners are working to reduce congestion and encourage alternative modes of transportation is through the Downtown C-pass. C-pass provides eligible downtown workers unlimited access to the entire bus system of Central Ohio Transit Authority (COTA). That means up to 45,000 eligible workers and residents can use the C-pass any day, any time, on any route.",
                },

                "goal_1_3": {
                    id: "goal_1_3",
                    goal: "goal_1",
                    titleID: "1.3",
                    title: 'Increase alternative fuel vehicles (simulated data)',
                    fullName: 'Increase the percentage of vehicles using alternative fuels (simulated data)',
                    range: [0, 3],
                    highLightFeaturesList: [39041, 39049],
                    layerURL: layerURL,
                    atype: "line",
                    targetYears: [2020],
                    targetValues: [2.5],
                    baselineYears: null,
                    baselineValues: null,
                    data: [
                        { "key": 2016, "value": 0.23 },
                        { "key": 2017, "value": 0.33 },
                        { "key": 2018, "value": 0.43 },
                    ], // This is temporary. dON'T RELY ON THIS!
                    unit: "%",
                    text: "The choice to buy an electric vehicle (EV) or alternative fuel vehicle is motivated, in part, by a consumer's confidence that there will be a place to recharge or refuel when their energy runs low. That's why MORPC is working toward creating a nationally-designated Alternative Fueld Corridor in Central Ohio. The designation means signage for travelers as well as use of data to strategically deploy future EV/AFV infrastructure.  This allows for more long-distance travels for those who own alternative fuel vehicles, as well as comfort knowing their sustainable choice won't leave them stranded.",
                },
                "goal_1_4": {
                    id: "goal_1_4",
                    goal: "goal_1",
                    titleID: "1.4",
                    title: 'Increase trail miles traveled',
                    fullName: 'Increase the number of trail miles traveled annually',
                    range: [9000000, 14000000],
                    highLightFeaturesList: [39041, 39049],
                    layerURL: layerURL,
                    atype: "line",
                    targetYears: [2020],
                    targetValues: [13000000],
                    baselineYears: [2016],
                    baselineValues: [10990358],
                    data: [
                        { "key": 2014, "value": 11046010 },
                        { "key": 2015, "value": 11021984 },
                        { "key": 2016, "value": 10990358 },
                        { "key": 2017, "value": 11588937 },
                    ], // This is temporary. dON'T RELY ON THIS!
                    unit: "Miles",
                    text: "Trails are built to be used, and one of the most important indicators of the utility of a trail system is the level of use it receives. Overall, trail miles traveled has increased 5% between 2014 and 2017. The Alumn Creek Trail saw significant increases in use, in part due to recent efforts to fill in the gaps to make it a more contiguous route. The Olentangy Trail remains one of the most congested trails in the network (with 2,805,600 miles traveled), which has prompted City of Columbus officials to expore expansion options.",
                },
                "goal_1_5": {
                    id: "goal_1_5",
                    goal: "goal_1",
                    titleID: "1.5",
                    title: 'Increase alternative fuel stations',
                    fullName: 'Increase the number of alternative fuel stations',
                    range: [0, 230],
                    highLightFeaturesList: [39041, 39049],
                    layerURL: layerURL,
                    atype: "stackBar",
                    targetYears: [2020],
                    targetValues: [220],
                    baselineYears: [2016],
                    baselineValues: [147],
                    labels: ["BD", "CNG", "E85", "ELEC", "HY", "LNG", "LPG"],
                    data: [
                        { "key": 2012, "BD": 3, "CNG": 5, "E85": 27, "ELEC": 67, "HY": null, "LNG": null, "LPG": 12 },
                        { "key": 2013, "BD": 3, "CNG": 6, "E85": 30, "ELEC": 70, "HY": null, "LNG": null, "LPG": 13 },
                        { "key": 2014, "BD": 3, "CNG": 9, "E85": 36, "ELEC": 72, "HY": null, "LNG": null, "LPG": 16 },
                        { "key": 2015, "BD": 3, "CNG": 12, "E85": 38, "ELEC": 82, "HY": null, "LNG": 1, "LPG": 19 },
                        { "key": 2016, "BD": 3, "CNG": 12, "E85": 40, "ELEC": 93, "HY": null, "LNG": 2, "LPG": 19 },
                        { "key": 2017, "BD": 3, "CNG": 12, "E85": 43, "ELEC": 109, "HY": 1, "LNG": 2, "LPG": 20 },
                        { "key": 2018, "BD": 3, "CNG": 14, "E85": 43, "ELEC": 112, "HY": 1, "LNG": 2, "LPG": 20 },
                    ], // This is temporary. dON'T RELY ON THIS!
                    unit: 'Stations',
                    text: "The number of alternative fuel stations continues to grow. While the rate of growth slowed in the past year, the trajectory toward the 2020 target is is still good. Currently the region is only 25 short of having 220 stations by 2020. Electric vehicle charging stations currently dominate the alternative fuel mix, and saw the fastest rate of growth from 2015, followed by compressed natural gas. As of October 2018, 35 applications for the AEP Ohio EV Charging Station Incentive Program have been received, representing 104 additional charging units."
                },
                "goal_1_6": {
                    id: "goal_1_6",
                    goal: "goal_1",
                    titleID: "1.6",
                    title: 'Reduce energy consumption',
                    fullName: 'Reduce per capita energy consumption across all sectors',
                    range: [0, 30],
                    highLightFeaturesList: [39041, 39049],
                    layerURL: layerURL,
                    atype: "bar",
                    targetYears: [2020],
                    targetValues: [14.5],
                    baselineYears: [2010],
                    baselineValues: [29],
                    data: [
                        { "key": 2010, "value": 29 },
                        { "key": 2011, "value": 19.13 },
                        { "key": 2012, "value": 21.96 },
                        { "key": 2013, "value": 20.54 },
                        { "key": 2014, "value": 24.62 },
                        { "key": 2015, "value": 26.61 },
                    ], // This is temporary. dON'T RELY ON THIS!
                    unit: 'MMBUT',
                    text: "Our objective is a 50% reduction in the difference between the US average for energy consumption per person, and Central Ohio's average. To reach this, the region will need to improve its energy effficiency by 5%. Even though Central Ohio's average tends to improve year over year, so does the national average.",
                },
                "goal_1_7a": {
                    id: "goal_1_7a",
                    goal: "goal_1",
                    titleID: "1.7a",
                    title: 'Increase renewable energy facilities',
                    fullName: 'Increase local renewable energy projects',
                    range: [0, 650],
                    highLightFeaturesList: [39041, 39049],
                    layerURL: layerURL,
                    atype: "stackBar",
                    targetYears: [2020],
                    targetValues: [576],
                    baselineYears: [2016],
                    baselineValues: [463],
                    labels: ["Battery", "Biomass", "Heat", "Hydro", "SolarPV", "SolidWaste", "Wind"],
                    data: [
                        { "key": 2009, "Battery": 0, "Biomass": 2, "Heat": 0, "Hydro": 1, "SolarPV": 1, "SolidWaste": 0, "Wind": 0 },
                        { "key": 2010, "Battery": 0, "Biomass": 3, "Heat": 0, "Hydro": 1, "SolarPV": 15, "SolidWaste": 1, "Wind": 2 },
                        { "key": 2011, "Battery": 0, "Biomass": 6, "Heat": 0, "Hydro": 1, "SolarPV": 53, "SolidWaste": 1, "Wind": 2 },
                        { "key": 2012, "Battery": 0, "Biomass": 6, "Heat": 0, "Hydro": 1, "SolarPV": 132, "SolidWaste": 1, "Wind": 2 },
                        { "key": 2013, "Battery": 0, "Biomass": 5, "Heat": 0, "Hydro": 1, "SolarPV": 218, "SolidWaste": 1, "Wind": 3 },
                        { "key": 2014, "Battery": 1, "Biomass": 6, "Heat": 0, "Hydro": 1, "SolarPV": 276, "SolidWaste": 1, "Wind": 4 },
                        { "key": 2015, "Battery": 1, "Biomass": 6, "Heat": 0, "Hydro": 1, "SolarPV": 342, "SolidWaste": 1, "Wind": 4 },
                        { "key": 2016, "Battery": 1, "Biomass": 6, "Heat": 1, "Hydro": 1, "SolarPV": 449, "SolidWaste": 1, "Wind": 4 },
                        { "key": 2017, "Battery": 1, "Biomass": 6, "Heat": 1, "Hydro": 0, "SolarPV": 527, "SolidWaste": 1, "Wind": 4 },
                        { "key": 2018, "Battery": 1, "Biomass": 6, "Heat": 1, "Hydro": 0, "SolarPV": 540, "SolidWaste": 1, "Wind": 5 },
                    ], // This is temporary. dON'T RELY ON THIS!
                    unit: 'Facilities',
                    text: "Based on Public Utilities Commission of Ohio data from June 2018, the region had a total of 231 MW of renewable electricity generating capacity, which includes solar, biomass, wind, solid-waste-to-energy, hydroelectric, landfill gas, and combined heat and power. Capacity is a measure of generating potential. While the rate of increase in the number of facilities has slowed in the past year, the rate of growth of newly installed capacity saw the biggest increase since 2013, owing to an increase in both solar and wind."
                },
                "goal_1_7b": {
                    id: "goal_1_7b",
                    goal: "goal_1",
                    titleID: "1.7b",
                    title: 'Increase renewable energy capacity',
                    fullName: 'Increase local renewable energy generating capacity',
                    range: [0, 300],
                    highLightFeaturesList: [39041, 39049],
                    layerURL: layerURL,
                    atype: "stackBar",
                    targetYears: [2020],
                    targetValues: [278],
                    baselineYears: [2016],
                    baselineValues: [223],
                    labels: ["Battery", "Biomass", "Heat", "Hydro", "SolarPV", "SolidWaste", "Wind"],
                    data: [
                        { "key": 2009, "Battery": 0, "Biomass": 97.6, "Heat": 0, "Hydro": 5.2, "SolarPV": 0.06912, "SolidWaste": 0, "Wind": 0 },
                        { "key": 2010, "Battery": 0, "Biomass": 100.3, "Heat": 0, "Hydro": 5.2, "SolarPV": 0.225775, "SolidWaste": 5, "Wind": 0.11 },
                        { "key": 2011, "Battery": 0, "Biomass": 199.7, "Heat": 0, "Hydro": 5.2, "SolarPV": 1.086428, "SolidWaste": 5, "Wind": 0.11 },
                        { "key": 2012, "Battery": 0, "Biomass": 199.7, "Heat": 0, "Hydro": 5.2, "SolarPV": 3.593933, "SolidWaste": 5, "Wind": 0.11 },
                        { "key": 2013, "Battery": 0, "Biomass": 197, "Heat": 0, "Hydro": 5.2, "SolarPV": 10.694833, "SolidWaste": 5, "Wind": 3.51 },
                        { "key": 2014, "Battery": 4, "Biomass": 197.85, "Heat": 0, "Hydro": 5.2, "SolarPV": 12.707383, "SolidWaste": 5, "Wind": 6.91 },
                        { "key": 2015, "Battery": 4, "Biomass": 197.85, "Heat": 0, "Hydro": 5.2, "SolarPV": 14.714778, "SolidWaste": 5, "Wind": 6.91 },
                        { "key": 2016, "Battery": 4, "Biomass": 197.85, "Heat": 1, "Hydro": 5.2, "SolarPV": 15.827436, "SolidWaste": 5, "Wind": 6.91 },
                        { "key": 2017, "Battery": 4, "Biomass": 197.85, "Heat": 1, "Hydro": 0, "SolarPV": 19.211056, "SolidWaste": 5, "Wind": 6.91 },
                        { "key": 2018, "Battery": 4, "Biomass": 197.85, "Heat": 1, "Hydro": 0, "SolarPV": 22.622596, "SolidWaste": 5, "Wind": 11.41 },
                    ], // This is temporary. dON'T RELY ON THIS!
                    unit: "MW(megawatts)",
                    text: "The number of renewable energy facilities continues to increase -- the region is within 5% of the 2020 target. Solar installations dominate this measure by far, with 538 installations spread throughout 15 counties in Central Ohio. Solar capacity stands at 20 MW and has significant room for growth."
                },
                "goal_2_1": {
                    id: "goal_2_1",
                    goal: "goal_2",
                    titleID: "2.1",
                    title: 'Reduce emissions',
                    fullName: 'Reduce emissions to meet federal air quality standards',
                    range: [2000, null],
                    highLightFeaturesList: [39041, 39049, 39117],
                    layerURL: layerURL,
                    targetYears: [2020],
                    targetValues: [0],
                    baselineYears: null,
                    baselineValues: null,
                    atype: "line",
                    data: [
                        { "key": 2008, "value": 20 },
                        { "key": 2009, "value": 5 },
                        { "key": 2010, "value": 21 },
                        { "key": 2011, "value": 21 },
                        { "key": 2012, "value": 29 },
                        { "key": 2013, "value": 6 },
                        { "key": 2014, "value": 6 },
                        { "key": 2015, "value": 5 },
                        { "key": 2016, "value": 10 },
                        { "key": 2017, "value": 2 },
                        { "key": 2018, "value": 3 },
                    ], // This is temporary. dON'T RELY ON THIS! 
                    unit: "Days",
                    text: "Currently, Central Ohio is achieving the national standards for fine particulate matter but not for ozone pollution. Ozone pollution is created when emissions from sources such as cars and industry react chemically in the presence of heat and sunlight. The region is slightly over the threshold for ozone and so is in marginal non-attainment of the standards. The latest assessment of air quality data concluded in 2016 shows the region at 71 parts per billion (ppb), an improvement over the previous 2008 assessment at 77 ppb."
                },
                "goal_2_2": {

                    id: "goal_2_2",
                    goal: "goal_2",
                    titleID: "2.2",
                    title: 'Increase air quality awareness',
                    fullName: 'Increase the number of people receiving air quality information and education',
                    range: [2000, 1900000],
                    highLightFeaturesList: [39041, 39049, 39117],
                    layerURL: layerURL,
                    targetYears: [2020],
                    targetValues: [1846625],
                    baselineYears: [2016],
                    baselineValues: [1678750],
                    atype: "line",
                    data: [
                        { "key": 2017, "value": 1678750 },
                    ],
                    unit: "People",
                    text: "Making sure the community knows when air pollution is a concern, and what to do to protect their health, is an important piece of our mission. It is especially important that the message reaches people particularly sensitive to air pollution: individuals with lung diseases, older adults, and children. Along with sending out air quality forecasts and alerts by email and text, communication partners are key for spreading the word through social media, TV, and radio when there is an Air Quality Alert. Currently more than 1.5 million people are made aware of Air Quality Alerts through the Ohio Department of Transportation's highway Dynamic Message Signs. This number increases by around 2% annually. Communication partnerships with other organizations that help spread the message broadly, are trusted resources in our communities, and have access to especially vulnerable communities are continually being established to help amplify the Air Quality Alert message."
                },
                'goal_2_3': {
                    id: "goal_2_3",
                    goal: "goal_2",
                    titleID: "2.3",
                    title: 'Reduce solid waste per person',
                    fullName: 'Reduce the amount of municipal solid waste per capita disposed in the landfill',
                    range: [0, 5],
                    highLightFeaturesList: [39041, 39049, 39117],
                    layerURL: layerURL,
                    targetYears: [2020],
                    targetValues: [4],
                    baselineYears: [2014],
                    baselineValues: [4.25],
                    atype: "line",
                    data: [
                        { "key": 2014, "value": 4.25 },
                        { "key": 2015, "value": 4.32 },
                        { "key": 2016, "value": 4.43 },
                    ],
                    unit: "Lbs",
                    text: "Despite many organizations' and communities' efforts, we are moving away from our target of waste reduction. In fact, each person, on average, still consumes about 4.5 lbs per day. It may not seem like much, but it adds up. If we reach our goal, it would keep over 100,000 tons of solid waste out of landfills each year - that's the weight equivalent of 125 cars every single day.",
                },
                "goal_2_4": {
                    id: "goal_2_4",
                    goal: "goal_2",
                    titleID: "2.4",
                    title: 'Promote infill development',
                    fullName: 'Minimize greenfield development and promote infill and redevelopment',
                    range: [0, 55],
                    highLightFeaturesList: [39041, 39049, 39117],
                    layerURL: layerURL,
                    targetYears: [2020],
                    targetValues: [50],
                    baselineYears: [2014],
                    baselineValues: [34.50],
                    atype: "bar",
                    data: [
                        { "key": 2010 - 2014, "value": 34.50 },
                        { "key": 2015 - 2018, "value": 39.3920 },
                    ],
                    unit: "%",
                    text: "From 2010 to 2018, nearly 40% of development occurred inside the urban area. Improvement between the baseline measure and recent years is a promising indicator of change in the right direction. Consistent with insight2050 efforts, more Central Ohio communities are adopting focused growth approaches to planning and development."
                },
                "goal_2_5": {
                    id: "goal_2_5",
                    goal: "goal_2",
                    titleID: "2.5",
                    title: 'Reduce water consumption',
                    fullName: 'Reduce per capita water consumption',
                    range: [0, 60],
                    highLightFeaturesList: [39041, 39049, 39117],
                    layerURL: layerURL,
                    targetYears: [2020],
                    targetValues: [53.23],
                    baselineYears: [2015],
                    baselineValues: [56.03],
                    atype: "bar",
                    data: [
                        { "key": 2015, "value": 56.03 },
                    ],
                    unit: "CCF",
                    text: "MORPC is currently engaged with local suppliers to obtain and interpret updated data on water consumption in the region. Stay tuned for updates, which may impact the score for this objective. Water consumption is just one factor of many to consider in ensuring clean and secure water resources for Central Ohio residents, businesses, and visitors. Sustaining Scioto is a partnership which aims to implement research-based recommendations to protect the long-term future of the Upper Scioto Basin, the source of 85% of the region's water supplies!",
                },
                "goal_2_6": {
                    id: "goal_2_6",
                    goal: "goal_2",
                    titleID: "2.6",
                    title: 'Improve water quality',
                    fullName: 'Improve water quality in the Upper Scioto Watershed',
                    range: [0, 90],
                    highLightFeaturesList: [39041, 39049, 39117],
                    layerURL: layerURL,
                    targetYears: [2020],
                    targetValues: [85],
                    baselineYears: null,
                    baselineValues: null,
                    atype: "bar",
                    data: [
                        { "key": 2016, "value": 61.20 },
                    ],
                    unit: "%",
                    text: "Making an impact when it comes to protecting our water resources can only happen when we work together. That's why Franklin County Soil and Water Conservation District, along with many stakeholders in the region are coming together through the Be the Change for Clean Water website. Be the Change is a resource for keeping Central Ohio residents informed about the water quality related programs and services in Central Ohio.",
                },
                "goal_3_1": {
                    id: "goal_3_1",
                    goal: "goal_3",
                    titleID: "3.1",
                    title: 'Increase sustainable businesses',
                    fullName: 'Increase the number of businesses in Central Ohio with established sustainability policies and practices',
                    range: [0, 1500],
                    highLightFeaturesList: [39049, 39117],
                    layerURL: layerURL,
                    atype: "bar",
                    targetYears: [2020],
                    targetValues: [1434],
                    baselineYears: [2016],
                    baselineValues: [1195],
                    data: [
                        { "key": 2008, "value": 237 },
                        { "key": 2009, "value": 388 },
                        { "key": 2010, "value": 468 },
                        { "key": 2011, "value": 589 },
                        { "key": 2012, "value": 673 },
                        { "key": 2013, "value": 894 },
                        { "key": 2014, "value": 975 },
                        { "key": 2015, "value": 1082 },
                        { "key": 2016, "value": 1195 },
                        { "key": 2017, "value": 1232 },
                        { "key": 2018, "value": 1263 }
                    ],
                    unit: "Businesses",
                    text: "GreenSpot is a program of the City of Columbus that promotes sustainability for homes and business throughout the city. Businesses are categorized as Office or Educational, Industrial, or Restaurant and Grocery atypes. The GreenSpot program continues to grow with now over 1,200 total members, which is a 5.6% increase compared to 2016.",
                },
                "goal_4_1": {
                    id: "goal_4_1",
                    goal: "goal_4",
                    titleID: "4.1",
                    title: 'Encourage complete street policies',
                    fullName: 'Encourage MORPC member communities to adopt complete streets policies or policies that contain those elements',
                    range: [0, 50],
                    highLightFeaturesList: [39049],
                    layerURL: layerURL,
                    atype: "bar",
                    targetYears: [2020],
                    targetValues: [45],
                    baselineYears: [2015],
                    baselineValues: [14],
                    data: [
                        { "key": 2015, "value": 14 },
                        { "key": 2018, "value": 9 }
                    ],
                    unit: "%",
                    text: "As Central Ohio grows to be a region of three million by 2050, thinking about the impact of different scenarios of development is a key strategy to help us develop into the region we want to be. This year, MORPC launched the insight2050 Technical Assistance Program, which included support of two communities in their development of complete streets policies. In 2018, seven communities - 9% of MORPC members - adopted Complete Streets policies or policies that contain those elements.",
                },
                "goal_4_2a": {
                    id: "goal_4_2a",
                    goal: "goal_4",
                    titleID: "4.2a",
                    title: 'Concentrate development near infrastructure',
                    fullName: 'Target infrastructure development to serve a higher number of people and jobs',
                    range: [0, 6],
                    highLightFeaturesList: [39049],
                    layerURL: layerURL,
                    atype: "bar",
                    targetYears: [2020],
                    targetValues: [5],
                    baselineYears: [2016],
                    baselineValues: [4.3],
                    data: [
                        { "key": 2016, "value": 4.3 },
                        { "key": 2017, "value": 4.3 },
                        { "key": 2018, "value": 4.5 },
                    ],
                    unit: "People + jobs",
                    text: "While there is still progress to be made toward reachign the goal of higher density of people and jobs along arterials, we are seeing an increase, which is expected to continue as more communities in the region are using focused growth strategies as their populations grow.",
                },
                "goal_4_2b": {
                    id: "goal_4_2b",
                    goal: "goal_4",
                    titleID: "4.2b",
                    title: 'Increase sidewalk coverage',
                    fullName: 'Increase sidewalk coverage of arterials and collectors',
                    range: [0, 50],
                    highLightFeaturesList: [39049],
                    layerURL: layerURL,
                    atype: "bar",
                    targetYears: [2020],
                    targetValues: [40],
                    baselineYears: [2016],
                    baselineValues: [32.5],
                    data: [
                        { "key": 2016, "value": 32.5 },
                        { "key": 2017, "value": 36.4 },
                        { "key": 2018, "value": 39.25 }
                    ],
                    unit: "%",
                    text: "The region is making great progress toward reachign the objective of adding sidewalks to arterial and collector roadways, partly due thanks to a MORPC Complete Streets policy that requires pedestrian, bike, and transit accommodations for all its funded projects.",
                },
                "goal_4_3a": {
                    id: "goal_4_3a",
                    goal: "goal_4",
                    titleID: "4.3a",
                    title: 'Reduce traffic fatalities',
                    fullName: 'Reduce the number of fatalities from crashes',
                    range: [0, 0.8],
                    highLightFeaturesList: [39049],
                    layerURL: layerURL,
                    atype: "line",
                    targetYears: [2020],
                    targetValues: [0.63],
                    baselineYears: [2016],
                    baselineValues: [0.744],
                    data: [
                        { "key": 2011, "value": 0.739 },
                        { "key": 2012, "value": 0.757 },
                        { "key": 2013, "value": 0.709 },
                        { "key": 2014, "value": 0.694 },
                        { "key": 2015, "value": 0.716 },
                        { "key": 2016, "value": 0.744 },
                        { "key": 2017, "value": 0.744 }
                    ],
                    unit: "Fatalities",
                    text: "Sadly, roadway crashes and associated fatalities have increased over the past few years. While a growing region with more vehicle miles traveled also correlates with more crashes, it is a good reminder to do more to prevent crashes and injuries - anything from stricter distracted driving legislation to more education and improved engineering solutions. MORPC is working closely with its state and local partners to develop a Regional Safety Plan with clear strategies and action items.",
                },
                "goal_4_3b": {
                    id: "goal_4_3b",
                    goal: "goal_4",
                    titleID: "4.3b",
                    title: 'Reduce traffic injuries',
                    fullName: 'Reduce the number of serious injuries from crashes',
                    range: [0, 8],
                    highLightFeaturesList: [39049],
                    layerURL: layerURL,
                    atype: "line",
                    targetYears: [2020],
                    targetValues: [5.83],
                    baselineYears: [2016],
                    baselineValues: [6.256],
                    data: [
                        { "key": 2011, "value": 6.873 },
                        { "key": 2012, "value": 6.816 },
                        { "key": 2013, "value": 6.652 },
                        { "key": 2014, "value": 6.463 },
                        { "key": 2015, "value": 6.348 },
                        { "key": 2016, "value": 6.256 },
                        { "key": 2017, "value": 6.107 }
                    ],
                    unit: "Serious injuries",
                    text: "Serious injuries resulting from roadway crashes has been decreasing slowly over the past few years. While a growing region with more vehicle miles traveled also correlates with more crashes, it is a good reminder to do more to prevent crashes and injuries - anything from stricter distracted driving legislation to more education and improved engineering solutions. MORPC is working closely with its state and local partners to develop a Regional Safety Plan with clear strategies and action items.",
                },
                "goal_4_3c": {
                    id: "goal_4_3c",
                    goal: "goal_4",
                    titleID: "4.3c",
                    title: 'Reduce non-motorized fatalities and serious injuries',
                    fullName: 'Reduce the number of fatalities and serious injuries resulting from crashes with non-motorized vehicles.',
                    range: [0, 160],
                    highLightFeaturesList: [39049],
                    layerURL: layerURL,
                    atype: "line",
                    targetYears: [2020],
                    targetValues: [124],
                    baselineYears: [2015],
                    baselineValues: [137.6],
                    data: [
                        { "key": 2011, "value": 115 },
                        { "key": 2012, "value": 122.6 },
                        { "key": 2013, "value": 125.2 },
                        { "key": 2014, "value": 133.2 },
                        { "key": 2015, "value": 137.6 },
                        { "key": 2016, "value": 144.8 },
                        { "key": 2017, "value": 145 }
                    ],
                    unit: "Fatalities & serious injuries",
                    text: "Incidents with non-motorized vehicles resulting in fatalities and serious injuries have increased over the past few years. While a growing region with more vehicle miles traveled also correlates with more crashes, it is a good reminder to do more to prevent crashes and injuries - anything from stricter distracted driving legislation to more education and improved engineering solutions. MORPC is working closely with its state and local partners to develop a Regional Safety Plan with clear strategies and action items.",
                },
                "goal_4_4a": {
                    id: "goal_4_4a",
                    goal: "goal_4",
                    titleID: "4.4a",
                    title: 'Concentrate development around transit',
                    fullName: 'Target transit infrastructure development to serve a higher number of people',
                    range: [0, 80],
                    highLightFeaturesList: [39049],
                    layerURL: layerURL,
                    atype: "line",
                    targetYears: [2020],
                    targetValues: [72],
                    baselineYears: [2016],
                    baselineValues: [70],
                    data: [
                        { "key": 2016, "value": 70 },
                        { "key": 2017, "value": 68.4 },
                        { "key": 2018, "value": 68.2 },
                    ],
                    unit: "%",
                    text: "Efforts are underway to improve acccess to transit throughout the region, and to improve efforts to reach underserved communities with this expansion. Additionally, focused growth strategies like those being developed in the insight2050 Corridor Concepts study seek to encourage denser development along corridors with access to existing infrastructure. Unfortunately more work is needed as the percent of population near transit has decreased by 2.6%.",
                },
                "goal_4_4b": {
                    id: "goal_4_4b",
                    goal: "goal_4",
                    titleID: "4.4b",
                    title: 'Concentrate development around bikeways',
                    fullName: 'Target bikeway infrastructure development to serve a higher number of people',
                    range: [0, 90],
                    highLightFeaturesList: [39049],
                    layerURL: layerURL,
                    atype: "line",
                    targetYears: [2020],
                    targetValues: [72],
                    baselineYears: [2016],
                    baselineValues: [71],
                    data: [
                        { "key": 2016, "value": 71 },
                        { "key": 2017, "value": 81 },
                        { "key": 2018, "value": 82.9 },
                    ],
                    unit: "%",
                    text: "Efforts are underway to improve acccess to bikeways throughout the region, and to improve efforts to reach underserved communities with this expansion. Additionally, focused growth strategies like those being developed in the insight2050 Corridor Concepts study seek to encourage denser development along corridors with access to existing infrastructure. At 80% the percent of population near bikeways has already exceeded the 2020 target by 2017.",
                },
                "goal_4_5": {
                    id: "goal_4_5",
                    goal: "goal_4",
                    titleID: "4.5",
                    title: 'Repair more qualified homes',
                    fullName: 'Increase the annual number of income-eligible households receiving free weatherization and safety-related home repairs',
                    range: [0, 1500],
                    highLightFeaturesList: [39049],
                    layerURL: layerURL,
                    atype: "line",
                    targetYears: [2020],
                    targetValues: [1332],
                    baselineYears: [2015],
                    baselineValues: [1269],
                    data: [
                        { "key": 2015, "value": 1269 },
                        { "key": 2016, "value": 1221 },
                        { "key": 2017, "value": 1218 }
                    ],
                    unit: "Households",
                    text: "MORPC, as well as other organizations throughout the 15-county region, offers home energy efficiency and safety services at no cost to income-eligible residents. Services help improve the safety and comfort of the home while lowering energy bills. MORPC also works with low- and moderate-income homeowners to maintain and improve their homes through several home repair programs. MORPC expects to reach more households with energy efficiency services in the future through the expansion of the Electric Partnership Program (EPP).",
                },
                "goal_4_6": {
                    id: "goal_4_6",
                    goal: "goal_4",
                    titleID: "4.6",
                    title: 'Increase trail miles',
                    fullName: 'Increase the number of Central Ohio Greenways trail miles',
                    range: [0, 250],
                    highLightFeaturesList: [39049],
                    layerURL: layerURL,
                    atype: "bar",
                    targetYears: [2020],
                    targetValues: [146],
                    baselineYears: [2016],
                    baselineValues: [126],
                    data: [
                        { "key": 2016, "value": 126 },
                        { "key": 2018, "value": 225.6 }
                    ],
                    unit: "Miles",
                    text: "The Central Ohio Greenways network has seen modest expansion in recent years, mostly related to filling critical gaps in the existing trail network, such as with Alum Creek and Camp Chase. Furthermore, many communities have built local trails that are not included in the regional trails statistic but are critical neighborhood connectors to the regional trail network. Central Ohio Greenways (COG) is continuing its mission of building more trails and encouraging more people to use them. As part of this effort, a Regional Trail Vision Map serves as a conceptual view of existing trails and proposed trails that will fulfill COG's vision for the future.",
                },
                "goal_5_1": {
                    id: "goal_5_1",
                    goal: "goal_5",
                    titleID: "5.1",
                    title: 'Summit on Sustainability Attendance',
                    fullName: 'Establish the annual Summit on Sustainability as a premiere environmental conference through high participation and visibility',
                    range: [0, 700],
                    highLightFeaturesList: [39041, 39049],
                    layerURL: layerURL,
                    atype: "bar",
                    targetYears: [2018],
                    targetValues: [550],
                    baselineYears: [2017],
                    baselineValues: [500],
                    data: [
                        { "key": 2014, "value": 393 },
                        { "key": 2015, "value": 415 },
                        { "key": 2016, "value": 550 },
                        { "key": 2017, "value": 500 }
                    ],
                    unit: "Registrations",
                    text: "The Summit on Sustainability is MORPC's signature environmental conference. This objective uses registrations of this annual event as a way to advance the goal of innovation in sustainable education and regional interest in sustainability. Since the baseline year, attendance has increased an average of 24% with a bump in attendance in 2016. While attendance was down slightly the following year, the upward trend is positive.",
                },
                "goal_5_2": {
                    id: "goal_5_2",
                    goal: "goal_5",
                    titleID: "5.2",
                    title: 'Sustainable2050 Participation',
                    fullName: 'Increase number of local governments committed to sustainability',
                    range: [0, 100],
                    highLightFeaturesList: [39041, 39049],
                    layerURL: layerURL,
                    targetYears: [2020],
                    targetValues: [100],
                    baselineYears: [2018],
                    baselineValues: [45],
                    atype: "bar",
                    data: [
                        { "key": 2018, "value": 44.61538 },
                    ],
                    unit: "%",
                    text: "Established in 2017, the Sustainable2050 program supports local governments' and partner organizations' sustainability efforts through direct technical assistance, collaboration, and recognition. The Regional Sustainability Agenda provides the framework for Sustainable2050 members and regional partners to work toward common goals.",
                }
            }
            console.log("**************************************************")
            console.log("******************Off-line mode.******************")
            console.log("**************************************************")
        },
        complete: function () {
            setup.init();

            setup.changeURL();


            bodyWidth = $("body").width();

            map.whenReady(function () {
                console.log("ready!");
            });

            map.on('zoomend', function (ev) {
                setup.stateVariables['sidebarPanel'].map.zoomlevel = map.getZoom();
                setup.changeURL();
            })
            map.on('moveend', function (ev) {
                setup.stateVariables['sidebarPanel'].map.center = map.getCenter();
                setup.changeURL();
            })
        }

    }
)
