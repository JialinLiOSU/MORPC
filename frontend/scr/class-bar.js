// #####################################################################################

// Script for Bar plots

// Luyu: 
// 1. Please USE Camel-Case: For example: printThePage(theVriable, thatVariable) instead of print_the_page()
// The purpose of this is to distinguish what you write and what you copy from CURIO.

// 2. I changed the old codes to ES6 OOP styled js. Please try to observe this style.

// 3. For now (2019, 6, 8), plot (bar) and grid are two totally different thingS:
// Grid is fixed (for now), it cannot be created or distroyed.
// Plot is the svg, which can be created and distroyed, pretty frequently.
// Plots are drawn in grids.

// There are several tricky parts though:
// each plot's mapLayer is named and owned by grid. For example, the layer of "goal_1_1" is named "plot1Layer" instead of "goal_1_1Layer". In this way, we can minimize the instances of layers in the memory.
// Also, you could have identical plots, whose layers are totally irrelavant, thus avoiding some weird behaviors caused by identical variable
// Consequently, pin is also owned by Grid instead. Pin is placed on grid, also, the only functionality it controls is map. Q.E.D.
// Besides, the svg's id is based on gridID too.

// In conslusion, anything that is affiliated with the grid will be named based on gridID. THe inner names and ids will use plotID (there are several exceptions though).
// And, in this page, there cannot be two same grids, but there could be two same plots in different plots. So consider the relashonship cautiously.

// #####################################################################################

class barPlot {
    constructor(gridSetting, plotSetting, data, labels) {
        this.gridSetting = gridSetting;
        this.plotSetting = plotSetting;

        this.highLightFeaturesList = plotSetting.highLightFeaturesList;
        this.layerURL = plotSetting.layerURL;
        this.gridnode = gridSetting;
        this.plotSetting = plotSetting;

        this.type = plotSetting.type;

        // plot's affiliation
        this.plotHashID = "#" + this.plotSetting.id; // "#goal_n_m";
        this.plotID = this.plotSetting.id // "goal_n_m";

        // grid's affiliation
        this.gridID = gridSetting.id;
        this.gridHashID = "#" + gridSetting.id;
        this.gridPinID = this.gridHashID + "-pin"; // "#plot1-pin"
        this.gridSeqID = this.gridnode.seqid // 1
        this.legendContainerID = "legend-container-" + this.gridID;

        this.range = plotSetting.range;
        this.titleMargin = 35; // The margin which is equal to the title. the svg's height should be height of the container (#plot1) - titleMargin. To prevent scroll bar

        this.plotMargin = { top: 40, right: 35, bottom: 20, left: 50 }; // bottom incl. legend and text

        // set plot width based on card-size switch button
        if (!document.getElementById("card-size-check").checked) {
            this.plotWidth = $(this.gridHashID).width() - this.plotMargin.left - this.plotMargin.right - $(this.gridHashID).width() / 3;
        } else {
            this.plotWidth = $(this.gridHashID).width() - this.plotMargin.left - this.plotMargin.right;
        }
        this.plotHeight = $(this.gridHashID).height() - this.plotMargin.top - this.plotMargin.bottom;

        // set the range of y axis
        this.lowerBound = this.range[0];
        this.upperBound = this.range[1];
        this.data = data;
        // save the range of X and Y
        this.minX = null;
        this.maxX = null;
        this.minY = null;
        this.maxY = null;
    }

    //  ----------------------------------------- Methods -----------------------------------------
    destructBarPlot() { // 
        var plotSVGID = "plot-svg-" + this.gridID;
        d3.select(plotSVGID).remove();
    }

    drawPlot() {
        var self = this;
        var height = this.plotHeight;
        var width = this.plotWidth;
        var data = this.data;

        var xDomain = []
        var values = []
        var maxY = null;
        var minY = null;

        // calculate the range of data
        for (var i = 0; i < this.data.length; i++) {
            if (!xDomain.includes(data[i].key)) {
                xDomain.push(data[i].key);
            }

            if (!maxY) {
                maxY = data[i].value;
            }
            else {
                if (maxY < data[i].value) {
                    maxY = data[i].value;
                }
            }

            if (!minY) {
                minY = data[i].value;
            }
            else {
                if (minY > data[i].value) {
                    minY = data[i].value;
                }
            }
        }

        // based on the range of data, set xy ranges
        var y = d3.scaleLinear()
            .rangeRound([height, 20]);
        var tmpMaxY = maxY;
        if (this.upperBound == null) {
            if (this.lowerBound == null) {
                y.domain([0, maxY]);
            }
            else {
                y.domain([0, maxY]);
            }
            tmpMaxY = maxY;
        }
        else {
            if (this.lowerBound == null) {
                y.domain([minY, this.upperBound]);
            }
            else {
                y.domain([this.lowerBound, this.upperBound]);
            }
            tmpMaxY = this.upperBound;
        }

        for (var i = 0; i < this.data.length; i++) {
            xDomain.push(this.data[i].key);
            values.push(this.data[i].value);
        }

        this.minX = xDomain[0];
        this.maxX = xDomain[xDomain.length - 1];
        this.minY = 0;
        this.maxY = tmpMaxY;

        var x = d3.scaleBand()
            .domain(xDomain)
            .rangeRound([0, width])
            .paddingInner(0.05)
            .align(0.1);

        var xAxis = d3.axisBottom()
            .scale(x);

        var yAxis = d3.axisLeft()
            .scale(y)
            .ticks(4, 's');

        var widthAdapt;
        if (!document.getElementById("card-size-check").checked) {
            widthAdapt = $(this.gridHashID).width() - $(this.gridHashID).width() / 3;
        } else {
            widthAdapt = $(this.gridHashID).width();
        }

        // add a svg block on plot
        var chart = d3.select(this.gridHashID).append("svg")
            .attr("id", "plot-svg-" + this.gridID)
            .attr("width", widthAdapt)
            .attr("height", $(this.gridHashID).height() - this.titleMargin);

        if (data.length == 1) {
            // add unit to svg
            var value = data[0]['value'];
            var key = data[0]['key'];
            var text = value.toString() + ' ' + this.plotSetting.unit + ' in ' + key;

            var yFirstLine = ($(this.gridHashID).height() - this.titleMargin) / 2 - 30;
            var xFirstLine = widthAdapt / 3;

            // add text on svg
            d3.select('#plot-svg-' + this.gridID).append("text")
                .attr('class', 'plotText')
                .attr('id', 'singleValue-' + this.gridID)
                .attr("x", xFirstLine)
                .attr("y", yFirstLine)
                .style("stroke", colorList[this.gridSeqID % colorList.length])
                .text(text)
                .on('mouseover', function (d, i) {
                    // mouseover function for moving into plot svg
                    $('.legend').remove();
                    var svg = d3.select("#legend-svg");
                    svg.selectAll('*').remove();

                    if (propSymbLayerList.length != 0) {
                        for (var j = 0; j < propSymbLayerList.length; j++) {
                            map.removeLayer(propSymbLayerList[j]);
                        }
                        propSymbLayerList = [];
                    }

                    // var selectID = this.parentElement.parentElement.parentElement.id + "-select";
                    var selectID = this.id.split("-")[1] + "-select";
                    var selectTool = document.getElementById(selectID);
                    var attID = selectTool.selectedIndex % 6;
                    var selIndrFullTitle = setup.selectList[selectTool.selectedIndex].text;
                    var gridSeqID = this.id.split("-")[1].split('_')[1] - 1;
                    var color = colorList[gridSeqID % colorList.length];
                    var plotID1 = selIndrFullTitle.split(' ')[0].split('.')[0];
                    var plotID2 = selIndrFullTitle.split(' ')[0].split('.')[1];
                    var plotID = 'goal_' + plotID1 + '_' + plotID2;

                    var proSymMap = 1;

                    // $.get(layerWithFieldsURL, null, function (mapData) {
                    var mapData = JSON.parse(layerWithFields);
                    var featureListSymbol = Object.assign({}, mapData.features);

                    if (featureListSymbol['0'].properties[key.toString()] == null) {
                        proSymMap = 0;


                    } else if (featureListSymbol['0'].properties[key.toString()][attID] == null) {
                        proSymMap = 0;

                    }

                    // add NODATA if there is no data for that county
                    if (proSymMap == 0) {
                        // $('#textNoData').remove();
                        document.getElementById("textNoData").style.visibility = "visible";
                    }

                    //create a new proportional symbol layer
                    maplotSymbol = new proportionalSymbol(layerWithFieldsURL, key, attID, color,
                        selectID.split('-')[0], plotID);
                    setup.stateVariables['sidebarPanel'].map.symbolLayer = { 'year': key, 'attID': attID, 'color': color };
                    setup.changeURL();

                    // change text-map
                    var indicator_name_list = []
                    var title_list = selIndrFullTitle.split(' ');
                    for (var i = 1; i < title_list.length; i++) {
                        indicator_name_list[i - 1] = title_list[i];
                    }
                    // change text-map
                    document.getElementById('text_map').value = 'Supplementary Information';
                    document.getElementById('text_map').value += '\n' + 'Indicator Name: ' + indicator_name_list.join(' ');
                    document.getElementById('text_map').value += '\n' + 'Unit of Measure: ' + setup.settingPlot[plotID].unit;
                    document.getElementById('text_map').value += '\n' + 'Focus Year: ' + key;
                })
                .on("mouseout", function (d, i) {
                    var status = barPinStatus;
                    if (status == true) {
                        return;
                    }
                    if (propSymbLayerList.length != 0) {
                        for (var i = 0; i < propSymbLayerList.length; i++) {
                            map.removeLayer(propSymbLayerList[i]);
                        }
                        propSymbLayerList = [];

                    }
                    var legend = new DefaultLegend();
                    setup.stateVariables['sidebarPanel'].map.symbolLayer = '';
                    setup.changeURL();
                })
                .on('click', function () {
                    barPinStatus = true;
                });

            // add target line and baseline text in legend
            var textLineCount = 1;
            if (this.plotSetting.targetValues.length != 0) {
                text = "Target value: " + this.plotSetting.targetValues[0].toString() + " in " + this.plotSetting.targetYears[0].toString();
                d3.select('#plot-svg-' + this.gridID).append("text")
                    .attr('class', 'plotText')
                    .style('font-size', 10)
                    .attr("x", xFirstLine + 30)
                    .attr("y", yFirstLine + textLineCount * 30)
                    .text(text);
                textLineCount = textLineCount + 1;
            }
            if (this.plotSetting.baselineValues != null && this.plotSetting.baselineValues.length != 0) {
                text = "Baseline value: " + this.plotSetting.baselineValues[0].toString() + " in " + this.plotSetting.baselineYears[0].toString();
                d3.select('#plot-svg-' + this.gridID).append("text")
                    .attr('class', 'plotText')
                    .style('font-size', 10)
                    .attr("x", xFirstLine + 26)
                    .attr("y", yFirstLine + textLineCount * 30)
                    .text(text);
            }
            return
        }

        // start add bars in the plots
        var g = chart
            .append("g")
            .attr("id", "svg-g-" + this.gridID)
            .attr("transform", "translate(" + this.plotMargin.left + "," + "0)");
        var bar = g.selectAll(".bar")
            .data(data)
            .enter().append("g");

        bar.append("rect")
            .attr("x", function (d) { return x(d.key); })
            .attr("y", function (d) {
                return y(d.value);
            })
            .attr("height", function (d) {
                return height - y(d.value);
            })
            .attr("width", x.bandwidth())
            .attr("id", function (d) {
                return self.gridID + "_" + d.key; // Consider change plotid to gridid, since there may be identical plots in different grids.
            })
            .attr("class", 'barRect')
            .style("fill", colorList[this.gridSeqID % colorList.length])
            .style("fill-opacity", 0.8)
            .on("mouseover", self.barMouseInEventHandler)
            .on("mouseout", self.barMouseOutEventHandler)
            .on("click", function (d) {
                // bar click function
                if (barPinStatus == true) {
                    barPinStatus = false;

                    titleStatus = false;
                    console.log("double mousedown!")

                    // highlight bar after click
                    var DOM = setup.highlightedDOM['DOM']

                    d3.select("#" + DOM.getAttribute("id")).dispatch("mouseleave");
                    d3.select("#" + DOM.getAttribute("id")).dispatch("mouseout");

                    $(DOM).css("fill", setup.highlightedDOM['fill']);

                    console.log(DOM.tagName)

                    if (DOM.tagName == "circle") {
                        d3.select("#" + DOM.getAttribute("id")).attr("r", 4);
                    }
                    $('.legend').remove();
                    var svg = d3.select("#legend-svg");
                    svg.selectAll('*').remove();
                }
                d3.select(this).dispatch("mouseover");
                setup.highlightedDOM = { "DOM": this, "fill": this.style.fill, "fill-opacity": 0.8 };
                $(this).css("fill", setup.highlightColor);
                barPinStatus = true;
            });


        chart.on("mouseleave", function (d, i) {
            // function for mouse leaving plot
            var status = barPinStatus;
            if (status == true) {
                return false;
            }
            // remove existing layers on map
            if (propSymbLayerList.length != 0) {
                for (var i = 0; i < propSymbLayerList.length; i++) {
                    map.removeLayer(propSymbLayerList[i]);
                }
                propSymbLayerList = [];
            }
            var legend = new DefaultLegend();
            
            setup.stateVariables['sidebarPanel'].map.symbolLayer = '';
            setup.changeURL();
            document.getElementById('text_map').value = 'Supplementary Information \nIndicator Name: \nUnit of Measure: \nFocus Year: ';
        });

        // add axes
        g.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + this.plotHeight + ")")
            .call(xAxis);
        g.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(0,0)")
            .call(yAxis);

        // add unit to svg
        d3.select('#plot-svg-' + this.gridID).append("text")
            .attr('class', 'unitText')
            .attr("x", 10)
            .attr("y", 10)
            .text('(' + this.plotSetting.unit + ')');

        let baselineExists = false;
        if (typeof this.plotSetting.baselineValues !== 'undefined' && this.plotSetting.baselineValues !== null) {
            baselineExists = true;
        }

        let targetlineExists = false;
        if (typeof this.plotSetting.targetValues !== 'undefined' && this.plotSetting.targetValues !== null) {
            targetlineExists = true;
        }

        if (targetlineExists) {
            // add target line
            g.append('line')
                .attr('x1', x(xDomain[0]))
                .attr('y1', y(this.plotSetting.targetValues))
                .attr('x2', x(xDomain[xDomain.length - 1]) + x.bandwidth())
                .attr('y2', y(this.plotSetting.targetValues))
                .attr('class', 'targetline');
        }

        if (baselineExists) {
            // add base line
            g.append('line')
                .attr('x1', x(xDomain[0]))
                .attr('y1', y(this.plotSetting.baselineValues))
                .attr('x2', x(xDomain[xDomain.length - 1]) + x.bandwidth())
                .attr('y2', y(this.plotSetting.baselineValues))
                .attr('class', 'baseline');
        }

        /* legend area begins*/
        var legendData = [
            { key: 'att1', 'x': 50, 'y': 50 }
        ];
        // svg for card legend
        var svg = d3.select("#" + this.legendContainerID).append("svg")
            .attr("id", "card-legend-svg-" + this.gridID)
            .attr("width", '100%')
            .attr("height", '100%');

        var leContainerWidth = $("#" + this.legendContainerID).width();
        var leContainerHeight = $("#" + this.legendContainerID).height();

        // location of the first line
        var hDiff = 20;
        var x1 = leContainerWidth / 10;
        var y1 = leContainerHeight / 10 + 8;
        var x2 = leContainerWidth / 10 + 20;
        var y2 = leContainerHeight / 10 + 8;

        if (targetlineExists && baselineExists) {
            // add targetline or baseline symbol and text in legend area
            if (this.plotSetting.targetValues[0] >= this.plotSetting.baselineValues[0]) {
                this.addLegendLine('targetline', x1, y1, x2, y2);
                this.addLegendLine('baseline', x1, y1 + hDiff, x2, y2 + hDiff);
            } else {
                this.addLegendLine('baseline', x1, y1, x2, y2);
                this.addLegendLine('targetline', x1, y1 + hDiff, x2, y2 + hDiff);
            }
        } else if (targetlineExists) {
            this.addLegendLine('targetline', x1, y1, x2, y2);
        } else if (baselineExists) {
            this.addLegendLine('baseline', x1, y1, x2, y2);
        }

        // symbol in legend
        var context = d3.select("#card-legend-svg-" + this.gridID).append("g")
            .attr("transform", "translate(0, 0)");
        var cardLegend = context.selectAll("rect")
            .data(legendData)
            .enter().append("rect");
        var symbolAttr = cardLegend.attr('x', x1)
            .attr('y', y1 + 2 * hDiff - 7.5)
            .attr("height", 15)
            .attr("width", 20)
            .attr("class", 'legendRect')
            .style("fill", colorList[this.gridSeqID % colorList.length])
            .style("fill-opacity", 0.8);
        // add text
        d3.select('#card-legend-svg-' + this.gridID).append("text")
            .attr("class", "legendText")
            .attr("x", x2 + 10)
            .attr("y", y2 + 2 * hDiff - 7.5)
            .attr("dy", "1em")
            // .text(this.plotSetting.title)
            .text("Region Level")
            .style("fill", "black");

    }

    addLegendLine(type, x1, y1, x2, y2) {
        if (type == 'baseline') {
            d3.select('#card-legend-svg-' + this.gridID).append('line')
                .attr('class', 'baseline')
                .attr('x1', x1)
                .attr('y1', y1)
                .attr('x2', x2)
                .attr('y2', y2);
            d3.select('#card-legend-svg-' + this.gridID).append("text")
                .attr("class", "legendText")
                .attr("x", x2 + 10)
                .attr("y", y2 - 10)
                .attr("dy", "1em")
                .text("Base Line")
                .style("fill", "black");
        }
        else if (type == 'targetline') {
            d3.select('#card-legend-svg-' + this.gridID).append('line')
                .attr('class', 'targetline')
                .attr('x1', x1)
                .attr('y1', y1)
                .attr('x2', x2)
                .attr('y2', y2);
            d3.select('#card-legend-svg-' + this.gridID).append("text")
                .attr("class", "legendText")
                .attr("x", x2 + 10)
                .attr("y", y2 - 10)
                .attr("dy", "1em")
                .text("Target Line")
                .style("fill", "black");
        }
    }

    barMouseInEventHandler(d, i) {

        // remove mapplots
        if (barPinStatus == true) {
            return;
        }

        // remove the existing layers on map
        if (propSymbLayerList.length != 0) {
            for (var i = 0; i < propSymbLayerList.length; i++) {
                map.removeLayer(propSymbLayerList[i]);
            }
            propSymbLayerList = [];
        }
        // remove map legend
        $('.legend').remove();
        var svg = d3.select("#legend-svg");
        svg.selectAll('*').remove();

        var settingGrid = setup.getPlotsList();
        for (var j = 0; j < settingGrid.length; j++) {
            d3.select("#" + settingGrid[j] + "_" + + d.key).style('fill-opacity', 1);
        }

        var selectID = this.parentElement.parentElement.parentElement.parentElement.id + "-select";
        var selectTool = document.getElementById(selectID);
        var attID = selectTool.selectedIndex % 6;
        var selIndrFullTitle = setup.selectList[selectTool.selectedIndex].text;
        // var selIndName = selIndrFullTitle.split(' ').shift();
        var gridSeqID = this.parentElement.parentElement.parentElement.parentElement.id.split('_')[1] - 1;
        var color = colorList[gridSeqID % colorList.length];
        var plotID1 = selIndrFullTitle.split(' ')[0].split('.')[0];
        var plotID2 = selIndrFullTitle.split(' ')[0].split('.')[1];
        var plotID = 'goal_' + plotID1 + '_' + plotID2;
        var proSymMap = 1;

        // $.get(layerWithFieldsURL, null, function (mapData) {
        var mapData = JSON.parse(layerWithFields);
        var featureListSymbol = Object.assign({}, mapData.features);

        if (featureListSymbol['0'].properties[d.key.toString()] == null) {
            proSymMap = 0;


        } else if (featureListSymbol['0'].properties[d.key.toString()][attID] == null) {
            proSymMap = 0;

        }

        // if there is no data for the county, show NODATA
        if (proSymMap == 0 && document.getElementById("textNoData") != undefined && document.getElementById("textNoData") != null) {
            // $('#textNoData').remove();
            document.getElementById("textNoData").style.visibility = "visible";
        }

        // create new layer of proportional Symbol
        maplotSymbol = new proportionalSymbol(layerWithFieldsURL, d.key, attID, color, selectID.split('-')[0], plotID);

        //add text of NODATA
        d3.select('#legend-svg').append("text")
            .attr('id', 'textNoData')
            .attr('class', 'legendText')
            .attr("x", $('#legend-svg').width() / 3.2)
            .attr("y", $('#legend-svg').height() / 1.5)
            .style('visibility', 'hidden')
            .style('font-size', '30px')
            .text('NO DATA');

        setup.stateVariables['sidebarPanel'].map.symbolLayer = { 'year': d.key, 'attID': attID, 'color': color };
        setup.changeURL();
        var indicator_name_list = []
        var title_list = selIndrFullTitle.split(' ');
        for (var i = 1; i < title_list.length; i++) {
            indicator_name_list[i - 1] = title_list[i];
        }
        // change text-map
        document.getElementById('text_map').value = 'Supplementary Information';
        document.getElementById('text_map').value += '\n' + 'Indicator Name: ' + indicator_name_list.join(' ');
        document.getElementById('text_map').value += '\n' + 'Unit of Measure: ' + setup.settingPlot[plotID].unit;
        document.getElementById('text_map').value += '\n' + 'Focus Year: ' + d.key;
    }

    barMouseOutEventHandler(d, i) {

        var status = barPinStatus;
        if (status == true) {
            return;
        }
        if (propSymbLayerList.length != 0) {
            for (var i = 0; i < propSymbLayerList.length; i++) {
                map.removeLayer(propSymbLayerList[i]);
            }
            propSymbLayerList = [];
        }
        $('#textNoData').remove();

        var legend = new DefaultLegend();

        var settingGrid = setup.getPlotsList();
        for (var j = 0; j < settingGrid.length; j++) {
            if (barPinStatus == true && this.id == settingGrid[j] + "_" + + d.key) {
                continue;
            }
            d3.select("#" + settingGrid[j] + "_" + + d.key).style('fill-opacity', 0.8);
        }
    }

    toggleLayer(status, gridID) {
        var gridHashID = "#" + gridID;
        var gridPinID = gridHashID + "-pin";
        if (status == 1) {
            if ($(gridPinID).attr("class").includes("highlight") == false) {
                if (!map.hasLayer(window[gridID + "Layer"])) {
                    map.addLayer(window[gridID + "Layer"])
                }
            }
        }
        else {
            if ($(gridPinID).attr("class").includes("highlight") == false) {
                if (map.hasLayer(window[gridID + "Layer"])) {
                    map.removeLayer(window[gridID + "Layer"])
                }
            }
        }
    }
}



