/*!
 * MORPC pie chart
 * @author Jialin Li
 * @date June 20th, 2019
 */
// This class is used for stackbar plot

class stackPlot {
    constructor(gridSetting, plotSetting, data) {
        this.highLightFeaturesList = plotSetting.highLightFeaturesList;
        this.layerURL = plotSetting.layerURL;
        this.gridnode = gridSetting;
        this.plotSetting = plotSetting;

        // plot's affiliation
        this.barID = "#" + this.plotSetting.id; // "#goal_n_m";
        this.barShortID = this.plotSetting.id // "goal_n_m";

        // grid's affiliation
        this.gridShortID = gridSetting.id;
        this.gridID = "#" + gridSetting.id;
        this.gridPinID = this.gridID + "-pin"; // "#plot1-pin"
        this.gridSeqID = this.gridnode.seqid // 1
        this.legendContainerID = "legend-container-" + this.gridShortID;

        this.range = plotSetting.range;
        this.titleMargin = 35; // The margin which is equal to the title. the svg's height should be height of the container (#plot1) - titleMargin. To prevent scroll bar

        this.barMargin = { top: 40, right: 35, bottom: 20, left: 50 }; // bottom incl. legend and text

        if (!document.getElementById("card-size-check").checked) {
            this.barWidth = $(this.gridID).width() - this.barMargin.left - this.barMargin.right - $(this.gridID).width() / 3;
        } else {
            this.barWidth = $(this.gridID).width() - this.barMargin.left - this.barMargin.right;
        }
        this.barHeight = $(this.gridID).height() - this.barMargin.top - this.barMargin.bottom;

        this.lowerBound = this.range[0];
        this.upperBound = this.range[1];
        this.data = data; // this data value (multivalues) is an array, each for one indicator in one year.
        // save the range of X and Y
        this.minX = null;
        this.maxX = null;
        this.minY = null;
        this.maxY = null;

        this.minOpacity = 0.4;
        this.intervalOpacity = null;

    }

    //  ----------------------------------------- Methods -----------------------------------------
    destructBarPlot() {
        var maPlotSVGID = "plot_svg_" + this.gridShortID; // where isthe ID created
        d3.select(maPlotSVGID).remove();
    }

    drawPlot() {
        var self = this;
        var height = this.barHeight;
        var width = this.barWidth;
        var data = this.data;
        data.columns = Object.keys(data[0]);
        data.columns.splice(data.columns.indexOf('key'), 1)

        for (var j = 0; j < data.length; j++) {
            for (var i = 0, tot = 0; i < data.columns.length; i++) {
                if (data.columns[i] == "key") {
                    continue;
                }
                tot = tot + data[j][data.columns[i]];
            }

            // data[j].total = tot;
        }

        // set x scale
        var x = d3.scaleBand()
            .rangeRound([0, width])
            .paddingInner(0.05)
            .align(0.1);

        // set y scale
        var y = d3.scaleLinear()
            .rangeRound([height, 20]);

        // set the colors
        var mainColor = colorList[this.gridSeqID % colorList.length];
        var z = d3.scaleOrdinal()
            .range([1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4]);

        var keys = data.columns;

        var xDomain = data.map(function (d) { return d.key; });
        x.domain(xDomain);
        var maxY = null;
        var minY = null;

        // extract maxY and minY
        for (var i = 0; i < this.data.length; i++) {
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

        // calculate the boundary of y.domain
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

        this.minX = xDomain[0];
        this.maxX = xDomain[xDomain.length - 1];
        this.minY = 0;
        this.maxY = tmpMaxY;

        // y.domain([this.lowerBound, this.upperBound]);
        z.domain(keys);


        var xAxis = d3.axisBottom()
            .scale(x);

        var yAxis = d3.axisLeft()
            .scale(y)
            .ticks(4, 's');

        var svgWidth;
        if (!document.getElementById("card-size-check").checked) {
            svgWidth = $(this.gridID).width() - $(this.gridID).width() / 3;
        } else {
            svgWidth = $(this.gridID).width();
        }
        var chart = d3.select(this.gridID).append("svg")
            .attr("id", "plot-svg-" + this.gridShortID)
            .attr("width", svgWidth)
            .attr("height", $(this.gridID).height() - this.titleMargin)
        var g = chart
            .append("g")
            .attr("id", "svg-g-" + this.gridShortID)
            .attr("transform", "translate(" + this.barMargin.left + "," + "0)");

        var dataInter = d3.stack().keys(keys)(data);
        var bar = g.append("g")
            .selectAll("g")
            .data(dataInter)
            .enter().append("g")
            .attr("category", function (d) {
                return d.key;
            })
            .style('fill', mainColor)
            .style("fill-opacity", function (d) { return z(d.key); })
            .attr("id", function (d) {
                return self.gridShortID + "_" + d.key;
            });


        // Three function that change the tooltip when user hover / move / leave a cell
        var mouseover = function (d, i) {
            barInStatus = true;
            if (barPinStatus == true) {
                return;
            }
            // remove existing layers on map
            if (propSymbLayerList.length != 0) {
                for (var i = 0; i < propSymbLayerList.length; i++) {
                    map.removeLayer(propSymbLayerList[i]);
                }
                $('.legend').remove();
                var svg = d3.select("#legend-svg");
                svg.selectAll('*').remove();
            }
            var settingGrid = setup.getPlotsList();
            //change the style in the same year in different grid
            for (var j = 0; j < settingGrid.length; j++) {

                d3.select("#" + settingGrid[j] + "_" + + d.data.key).style('fill-opacity', 1);
            }
            // change the style of same indicator in same grid
            var selecter = "#" + this.parentElement.id;
            var rectsInRow = d3.select(selecter);
            rectsInRow = rectsInRow._groups[0][0].childNodes;
            var op;
            for (var i = 0; i < rectsInRow.length; i++) {
                op = d3.select('#' + rectsInRow[i].id).style("fill-opacity");
                d3.select('#' + rectsInRow[i].id).style("fill-opacity", parseFloat(op) + 0.15);
            }

            //draw proportional symbols on map
            var selectID = this.parentElement.parentElement.parentElement.parentElement.parentElement.id + "-select";//this is different from bar
            var selectTool = document.getElementById(selectID);
            var gridSeqID = this.parentElement.parentElement.parentElement.parentElement.parentElement.id.split('_')[1] - 1;
            var color = colorList[gridSeqID % colorList.length];
            var attID = document.getElementById(selectID).selectedIndex % 6;
            var selIndrFullTitle = setup.selectList[selectTool.selectedIndex].text;
            var plotID1 = selIndrFullTitle.split(' ')[0].split('.')[0];
            var plotID2 = selIndrFullTitle.split(' ')[0].split('.')[1];
            var plotID = 'goal_' + plotID1 + '_' + plotID2;
            var proSymMap = 1;

            // $.get(layerWithFieldsURL, null, function (mapData) {
            var mapData = JSON.parse(layerWithFields);
            var featureListSymbol = Object.assign({}, mapData.features);

            if (featureListSymbol['0'].properties[d.data.key.toString()] == null) {
                proSymMap = 0;
            } else if (featureListSymbol['0'].properties[d.data.key.toString()][attID] == null) {
                proSymMap = 0;
            }

            // add NODATA if there is no data for that county
            if (proSymMap == 0 && document.getElementById("textNoData") != undefined && (document.getElementById("textNoData") != null || document.getElementById("textNoData").style.visibility != "visible")) {
                // $('#textNoData').remove();
                document.getElementById("textNoData").style.visibility = "visible";
            }
            // },'json');

            //create a new proportional symbol layer
            maplotSymbol = new proportionalSymbol(layerWithFieldsURL, d.data.key, attID, color,
                selectID.split('-')[0], plotID);

            d3.select('#legend-svg').append("text")
                .attr('id', 'textNoData')
                .attr('class', 'legendText')
                .attr("x", $('#legend-svg').width() / 3.2)
                .attr("y", $('#legend-svg').height() / 1.5)
                .style('visibility', 'hidden')
                .style('font-size', '30px')
                .text('NO DATA');

            setup.stateVariables['sidebarPanel'].map.symbolLayer = { 'year': d.data.key, 'attID': attID, 'color': color };
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
            document.getElementById('text_map').value += '\n' + 'Focus Year: ' + d.data.key;

            // highlight the vertical bar
            var year = d.data.key;
            var preStr = self.gridShortID + '_' + year;
            var rectsInColumn = d3.selectAll('.stacked-bar-rect').filter(function (d) {
                return d3.select(this).attr('id').includes(preStr) == true;
            });
            rectsInColumn = rectsInColumn._groups[0];
            var fillOpa;
            for (var i = 0; i < rectsInColumn.length; i++) {
                fillOpa = d3.select('#' + rectsInColumn[i].id).style('fill-opacity');
                d3.select('#' + rectsInColumn[i].id).style('fill-opacity', parseFloat(fillOpa) + 0.15);
            }

            // highlight the legend
            var category = this.getAttribute("category")
            d3.select("#stack-legend-" + category).attr("font-weight", "bold")
        }

        var mouseleave = function (d) {
            barInStatus = false
            if (barPinStatus == true) {
                return;
            }
            // remove existing layers on map
            if (propSymbLayerList.length != 0) {
                for (var i = 0; i < propSymbLayerList.length; i++) {
                    map.removeLayer(propSymbLayerList[i]);
                }
                propSymbLayerList = [];
            }

            var legend = new DefaultLegend();
            var settingGrid = setup.getPlotsList();
            // change opacity of corresponding bar chart
            for (var j = 0; j < settingGrid.length; j++) {
                d3.select("#" + settingGrid[j] + "_" + + d.data.key).style('fill-opacity', 0.8);
            }

            var selecter = "#" + this.parentElement.id;
            var rectsInRow = d3.select(selecter);
            rectsInRow = rectsInRow._groups[0][0].childNodes;
            var op;
            for (var i = 0; i < rectsInRow.length; i++) {
                op = d3.select('#' + rectsInRow[i].id).style("fill-opacity");
                d3.select('#' + rectsInRow[i].id).style("fill-opacity", parseFloat(op) - 0.15);
            }

            // dehighlight the vertical bar
            var year = d.data.key;
            var preStr = self.gridShortID + '_' + year;
            var rectsInColumn = d3.selectAll('.stacked-bar-rect').filter(function (d) {
                return d3.select(this).attr('id').includes(preStr) == true;
            });
            rectsInColumn = rectsInColumn._groups[0];
            var fillOpa;
            for (var i = 0; i < rectsInColumn.length; i++) {
                fillOpa = d3.select('#' + rectsInColumn[i].id).style('fill-opacity');
                d3.select('#' + rectsInColumn[i].id).style('fill-opacity', parseFloat(fillOpa) - 0.15);
            }


            // dehighlight the legend
            var category = this.getAttribute("category")
            d3.select("#stack-legend-" + category).attr("font-weight", "light")
            console.log("asdfasdf: ", category)
            $("#stack-legend-" + category).css("fill", "black")

        }

        var rect = bar.selectAll("rect")
            .data(function (d) { return d; })
            .enter()
            .append("rect")
            .attr("x", function (d) { return x(d.data.key); })
            .attr("y", function (d) { return y(d[1]); })
            .attr("height", function (d) { return y(d[0]) - y(d[1]); })
            .attr("width", x.bandwidth())
            .on("mouseover", mouseover)
            .on("mouseleave", mouseleave)
            .on('click', function (d) {
                // bar click function
                if (barPinStatus == true) {
                    barPinStatus = false;
                    titleStatus = false;
                    console.log("double mousedown!")

                    // highlight rect after click
                    var DOM = setup.highlightedDOM['DOM']

                    d3.select("#" + DOM.getAttribute("id")).dispatch("mouseleave");
                    d3.select("#" + DOM.getAttribute("id")).dispatch("mouseout");


                    d3.select(this).dispatch("mouseover");
                    $(DOM).css("fill", setup.highlightedDOM['fill']);

                    console.log(DOM.tagName)

                    if (DOM.tagName == "circle") {
                        d3.select("#" + DOM.getAttribute("id")).attr("r", 4);
                    }
                    $('.legend').remove();
                    var svg = d3.select("#legend-svg");
                    svg.selectAll('*').remove();

                }

                setup.highlightedDOM = { "DOM": this, "fill": this.style.fill, "fill-opacity": this.style.fill - opacity };
                $(this).css("fill", setup.highlightColor);

                // highlight the legend
                var category = this.getAttribute("category");
                console.log(category)
                $("#stack-legend-" + category).css("fill", "red");
                barPinStatus = true;
            })
            .attr("class", 'stacked-bar-rect')
            .attr("category", function (d) {
                return this.parentElement.getAttribute("category")
            })
            .attr("id", function (d) {
                var yearID = d[0].toString();
                var attrID = d[1].toString();
                if (yearID.includes('.')) {
                    yearID = yearID.split('.')[1];
                }
                if (attrID.includes('.')) {
                    attrID = attrID.split('.')[1];
                }
                return self.gridShortID + "_" + d.data.key + "_" + attrID + "_" + yearID;
            });

        // start add bars in the plots
        g.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + self.barHeight + ")") //What is the transform attribute,only the top-left coordinate?
            .call(xAxis);
        g.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(0,0)")
            // .call(yAxis.tickFormat(d3.format('.2S')));
            .call(yAxis);

        // add unit to svg
        d3.select('#plot-svg-' + this.gridShortID).append("text")
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
                // .attr('y1', y(d3.min(data, function (d) { return d.total; })))
                .attr('y1', y(this.plotSetting.baselineValues))
                .attr('x2', x(xDomain[xDomain.length - 1]) + x.bandwidth())
                .attr('y2', y(this.plotSetting.baselineValues))
                .attr('class', 'baseline');
        }

        chart.on("mouseleave", function (d, i) {
            if (barPinStatus == true) {
                return;
            }

            var pinid = this.parentElement.id + "-pin";
            if (propSymbLayerList.length != 0) {
                for (var i = 0; i < propSymbLayerList.length; i++) {
                    map.removeLayer(propSymbLayerList[i]);
                }
                $('.legend').remove();
                var svg = d3.select("#legend-svg");
                svg.selectAll('*').remove();
            }
            var legend = new DefaultLegend();
            document.getElementById('text_map').value = 'Supplementary Information \nIndicator Name: \nUnit of Measure: \nFocus Year:';

        });

        /* legend area begins*/
        var legendData = [
            { key: 'att1', 'x': 50, 'y': 50 }
        ];
        var svg = d3.select("#" + this.legendContainerID).append("svg")
            .attr("id", "card-legend-svg-" + this.gridShortID)
            .attr("width", '100%')
            .attr("height", '100%');

        var leContainerWidth = $("#" + this.legendContainerID).width();
        var leContainerHeight = $("#" + this.legendContainerID).height();

        var hDiff = 20;
        // location of the first line
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

        // add legend for each of the stacked indicators
        var indicator, opacity;
        for (var i = 0; i < data.columns.length; i++) {
            opacity = (0.8 - 0.1 * i);
            d3.select("#card-legend-svg-" + this.gridShortID).append("g")
                .attr("transform", "translate(0, 0)").selectAll("rect")
                .data(legendData)
                .enter().append("rect")
                .attr('x', x1)
                .attr('y', y1 + (data.columns.length + 1 - i + 1) * hDiff)// the last +1 is for the dynamic added legend line
                .attr("height", 15)
                .attr("width", 20)
                .attr("class", 'legendRect')
                .style("fill", colorList[this.gridSeqID % colorList.length])
                .style('fill-opacity', opacity);

            indicator = data.columns[i];
            svg.append("text")
                .attr("id", "stack-legend-" + indicator)
                .attr("class", "legendText")
                .attr("x", x2 + 10)
                .attr("y", y2 + (data.columns.length + 1 - i + 1) * hDiff)
                .attr("dy", "1em")
                .text(indicator)
                .style("fill", "black");
        }
        /* legend area ends*/
    }
    addLegendLine(type, x1, y1, x2, y2) {
        if (type == 'baseline') {
            d3.select('#card-legend-svg-' + this.gridShortID).append('line')
                .attr('class', 'baseline')
                .attr('x1', x1)
                .attr('y1', y1)
                .attr('x2', x2)
                .attr('y2', y2);
            d3.select('#card-legend-svg-' + this.gridShortID).append("text")
                .attr("class", "legendText")
                .attr("x", x2 + 10)
                .attr("y", y2 - 10)
                .attr("dy", "1em")
                .text("Base Line")
                .style("fill", "black");
        }
        else if (type == 'targetline') {
            d3.select('#card-legend-svg-' + this.gridShortID).append('line')
                .attr('class', 'targetline')
                .attr('x1', x1)
                .attr('y1', y1)
                .attr('x2', x2)
                .attr('y2', y2);
            d3.select('#card-legend-svg-' + this.gridShortID).append("text")
                .attr("class", "legendText")
                .attr("x", x2 + 10)
                .attr("y", y2 - 10)
                .attr("dy", "1em")
                .text("Target Line")
                .style("fill", "black");
        }

    }

    toggleLayer(status, gridShortID) {
        var gridID = "#" + gridShortID;
        var gridPinID = gridID + "-pin";
        if (status == 1) {
            if ($(gridPinID).attr("class").includes("highlight") == false) {
                if (!map.hasLayer(window[gridShortID + "Layer"])) {
                    map.addLayer(window[gridShortID + "Layer"])
                }
            }
        }
        else {
            if ($(gridPinID).attr("class").includes("highlight") == false) {
                if (map.hasLayer(window[gridShortID + "Layer"])) {
                    map.removeLayer(window[gridShortID + "Layer"])
                }
            }
        }
    }
}