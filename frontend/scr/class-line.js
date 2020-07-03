
class linePlot {
    constructor(gridSetting, plotSetting, data, labels) {
        this.highLightFeaturesList = plotSetting.highLightFeaturesList;
        this.layerURL = plotSetting.layerURL;
        this.gridSetting = gridSetting;
        this.plotSetting = plotSetting;

        // plot's affiliation
        this.plotHashID = "#" + this.plotSetting.id; // "#goal_n_m";
        this.plotID = this.plotSetting.id // "goal_n_m";

        // grid's affiliation
        this.gridID = gridSetting.id;
        this.gridHashID = "#" + gridSetting.id;
        this.gridPinID = this.gridHashID + "-pin"; // "#plot1-pin"
        this.gridSeqID = this.gridSetting.seqid // 1
        this.legendContainerID = "legend-container-" + this.gridID;

        this.range = plotSetting.range;

        this.titleMargin = 35 // The margin which is equal to the title. the svg's height should be height of the container (#plot1) - titleMargin. To prevent scroll plot

        this.plotMargin = { top: -10, right: 0, bottom: 30, left: 50 }; // bottom incl. legend and text
        if (!document.getElementById("card-size-check").checked) {
            this.plotWidth = $(this.gridHashID).width() - this.plotMargin.left - this.plotMargin.right - $(this.gridHashID).width() / 3;
        } else {
            this.plotWidth = $(this.gridHashID).width() - this.plotMargin.left - this.plotMargin.right;
        }

        this.plotHeight = $(this.gridHashID).height() - this.titleMargin - this.plotMargin.top - this.plotMargin.bottom;
        // console.log(this.range)
        this.lowerBound = this.range[0];
        this.upperBound = this.range[1];
        this.data = data;

        var special = true;
        if (special) {
            this.data = [this.data];
        }
        this.labels = labels;
        // save the range of X and Y
        this.minX = null;
        this.maxX = null;
        this.minY = null;
        this.maxY = null;

    }
    computeSegments(lineData, defined, isNext) {
        defined = defined || function (d) { return true; };
        isNext = isNext || function (prev, curr) { return true; };
        var startNewSegment = true;

        // split into segments of continuous data
        var segments = lineData.reduce(function (segments, d) {
            // skip if this point has no data
            if (!defined(d)) {
                startNewSegment = true;
                return segments;
            }

            // if we are starting a new segment, start it with this point
            if (startNewSegment) {
                segments.push([d]);
                startNewSegment = false;

                // otherwise see if we are adding to the last segment
            } else {
                var lastSegment = segments[segments.length - 1];
                var lastDatum = lastSegment[lastSegment.length - 1];
                // if we expect this point to come next, add it to the segment
                if (isNext(lastDatum, d)) {
                    lastSegment.push(d);

                    // otherwise create a new segment
                } else {
                    segments.push([d]);
                }
            }

            return segments;
        }, []);

        return segments;
    }

    //  ----------------------------------------- Methods -----------------------------------------
    destructplotPlot() { // 
        var maPlotSVGID = "#plot-svg-" + this.plotID;
        d3.select(maPlotSVGID).remove();
    }

    drawPlot() {
        var self = this;
        var height = this.plotHeight;
        var width = this.plotWidth;
        var data = this.data;

        var dotsData = [];
        for (var j = 0; j < data.length; j++) {
            dotsData = dotsData.concat(data[j]);
        }

        // calculate the range of data
        var xDomain = [];
        var values = [];
        var maxY = null;
        var minY = 0;

        for (var i = 0; i < dotsData.length; i++) {
            if (!xDomain.includes(dotsData[i].key)) {
                xDomain.push(dotsData[i].key);
            }

            if (!maxY) {
                maxY = dotsData[i].value;
            }
            else {
                if (maxY < dotsData[i].value) {
                    maxY = dotsData[i].value;
                }
            }
        }

        for (var j = 0; j < dotsData.length; j++) {
            if (dotsData[j].value === null) {
                dotsData.splice(j, 1);
            }
        }

        // based on the range of data, set xy ranges
        xDomain.sort();
        this.minX = xDomain[0];
        this.maxX = xDomain[xDomain.length - 1];
        var y = d3.scaleLinear().rangeRound([height, 20]);

        console.log(this.upperBound, this.lowerBound)

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
            if (this.lowerBound == null || this.lowerBound == 0) {
                y.domain([0, this.upperBound]);
            }
            else {
                y.domain([0, this.upperBound]);
            }
            tmpMaxY = this.upperBound;

        }
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
        var test = document.getElementById("card-size-check").checked;
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
        //add text to card when there is only one single year's value
        if (data[0].length == 1) {
            // add unit to svg
            var value = data[0][0]['value'];
            var key = data[0][0]['key'];
            var text = value.toString() + ' ' + this.plotSetting.unit + ' in ' + key + '\n';
            var yFirstLine = ($(this.gridHashID).height() - this.titleMargin) / 2 - 30;
            var xFirstLine = widthAdapt / 3;
            d3.select('#plot-svg-' + this.gridID).append("text")
                .attr('class', 'plotText')
                .attr('id', 'singleValue-' + this.gridID)
                .attr("x", xFirstLine)
                .attr("y", yFirstLine)
                .style("stroke", colorList[this.gridSeqID % colorList.length])
                .text(text)

                .on('mouseover', function (d, i) {
                    // mouseover function for moving into plot svg
                    var status = barPinStatus;
                    if (status == true) {
                        return;
                    }
                    $('.legend').remove();
                    var svg2 = d3.select("#legend-svg");
                    svg2.selectAll('*').remove();

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

                    if (proSymMap == 0) {
                        // $('#textNoData').remove();
                        document.getElementById("textNoData").style.visibility = "visible";
                    }
                    // },'json');

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
                    if (barPinStatus == true) {
                        barPinStatus = false;

                        titleStatus = false;
                        console.log("double mousedown!")
                        var DOM = setup.highlightedDOM['DOM']

                        d3.select("#" + DOM.getAttribute("id")).dispatch("mouseleave");
                        d3.select("#" + DOM.getAttribute("id")).dispatch("mouseout");

                        // $("#" + DOM.getAttribute("id")).trigger("mouseleave");
                        // $(DOM).css("fill-opacity", setup.highlightedDOM['fill-opacity']);
                        $(DOM).css("fill", setup.highlightedDOM['fill']);

                        console.log(DOM.tagName)

                        if (DOM.tagName == "circle") {
                            d3.select("#" + DOM.getAttribute("id")).attr("r", 4);
                        }
                        $('.legend').remove();
                        var svg = d3.select("#legend-svg");
                        svg.selectAll('*').remove();
                    }
                    setup.highlightedDOM = { "DOM": this, "fill": this.style.fill, "fill-opacity": 0.8 };
                    $(this).css("fill", setup.highlightColor);
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
            if (this.plotSetting.baselineValues.length != 0) {
                text = "Baseline value: " + this.plotSetting.baselineValues[0].toString() + " in " + this.plotSetting.baselineYears[0].toString();
                d3.select('#plot-svg-' + this.gridID).append("text")
                    .attr('class', 'plotText')
                    .style('font-size', 10)
                    .attr("x", xFirstLine + 26)
                    .attr("y", yFirstLine + textLineCount * 30)
                    .text(text);
            }

            return;
        }

        // start add bars in the plots
        var g = chart
            .append("g")
            .attr("id", "svg-g-" + this.gridID)
            .attr("transform", "translate(" + this.plotMargin.left + "," + "0)");

        chart.on("mouseleave", function (d, i) {
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
            document.getElementById('text_map').value = 'Supplementary Information \nIndicator Name: \nUnit of Measure: \nFocus Year: ';

        });

        var new_chart = d3.select(this.gridHashID);

        new_chart.on("mouseleave", function (d, i) {
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
            document.getElementById('text_map').value = 'Supplementary Information \nIndicator Name: \nUnit of Measure: \nFocus Year: ';

        });

        /*   Begin drawing line charts with missing data */
        var lineData = [];
        for (var k = 0; k < data[0].length; k++) {
            var linePoint;
            if (data[0][k].value === null) {
                linePoint = [x(data[0][k].key) + x.bandwidth() / 2, null];
            } else {
                linePoint = [x(data[0][k].key) + x.bandwidth() / 2, y(data[0][k].value)];
            }

            lineData.push(linePoint);
        }
        var defined = function (d) { return d[1] !== null; };
        var line = d3.line();
        var filteredData = lineData.filter(defined);
        var segments = this.computeSegments(lineData, defined);

        g.append('g').attr('id', 'segments-line-' + this.gridID);
        g.append('path').attr('id', 'gap-line-' + this.gridID);

        //draw solid lines
        d3.select('#segments-line-' + this.gridID).selectAll('path').data(segments)
            .enter()
            .append('path')
            .attr('d', line)
            .style('stroke-width', "2px")
            .style("stroke", colorList[this.gridSeqID % colorList.length])
            .style("fill", "none");;

        // draw gap lines
        d3.select('#gap-line-' + this.gridID)
            .attr('d', line(filteredData))
            .style('stroke-dasharray', "4 4")
            // .style('stroke-width', "5px")
            .style('opacity', "1")
            .style('stroke', colorList[this.gridSeqID % colorList.length])
            .style("fill", "none");
        /* End drawing line charts with missing data*/

        // add dots on line for each year
        g.selectAll("dot")
            .data(dotsData)
            .enter().append("circle")
            .attr("r", 4)
            .attr("cx", function (d) {
                return x(d.key) + x.bandwidth() / 2;
            })
            .attr("cy", function (d) {
                return y(d.value);
            })
            .attr("id", function (d, i) {
                return "circle-" + self.gridID + "-" + i;
            })
            .attr("class", "circle-" + self.gridID)
            .style("z-index", 99999)
            .style("fill", colorList[this.gridSeqID % colorList.length])
            .on('mouseover', self.lineMouseInEventHandler)
            .on("mouseout", function (d, i) {
                $('#textNoData').remove();

                if (barPinStatus == true) {
                    return;
                }
                if (propSymbLayerList.length != 0) {
                    for (var i = 0; i < propSymbLayerList.length; i++) {
                        map.removeLayer(propSymbLayerList[i]);
                    }
                    propSymbLayerList = [];
                }
                var legend = new DefaultLegend();
                //                document.getElementById('text_map').value = 'Supplementary Information \n Indicator Name: \n Unit of Measure: \n';
                d3.selectAll(".circle-" + self.gridID)
                    .attr("r", 4);
            })
            .on('click', function () {
                // click function for line dot
                if (barPinStatus == true) {
                    barPinStatus = false;

                    titleStatus = false;
                    console.log("double mousedown!")

                    // highlight dot after click
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
                setup.highlightedDOM = { "DOM": this, "fill": this.style.fill, "fill-opacity": 0.8 };
                $(this).css("fill", setup.highlightColor);
                barPinStatus = true;
            });

        // add axes
        g.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + this.plotHeight + ")")
            .call(xAxis); // Necessary evil.

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
            { 'x': 50, 'y': 50 }
        ];

        // svg for card legend
        var svg = d3.select("#" + this.legendContainerID).append("svg")
            .attr("id", "card-legend-svg-" + this.gridID)
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

        //add line path symbol in legend area
        var context = d3.select("#card-legend-svg-" + this.gridID).append("g")
            .attr("transform", "translate(0, 0)");
        var cardLegendLine = context.selectAll("path")
            .data(legendData)
            .enter().append("line");
        var symbolAttr = cardLegendLine.attr('x1', x1)
            .attr('y1', y1 + 2 * hDiff)
            .attr('x2', x2)
            .attr('y2', y1 + 2 * hDiff)
            .attr("height", 15)
            .attr("width", 20)
            .attr("class", 'legendLine')
            .style('stroke-width', "2px")
            .style("stroke", colorList[this.gridSeqID % colorList.length]);
        var legendCircle = [{ "x_axis": x1 + 10, "y_axis": y1 + 2 * hDiff, "radius": 4, "color": colorList[this.gridSeqID % colorList.length] }];
        // add circles
        var cardLegendLineDot = context.selectAll('circle')
            .data(legendCircle)
            .enter().append("circle")
            .attr("cx", function (d) { return d.x_axis; })
            .attr("cy", function (d) { return d.y_axis; })
            .attr("r", function (d) { return d.radius; })
            .style("fill", function (d) { return d.color; });

        // add text
        d3.select('#card-legend-svg-' + this.gridID).append("text")
            .attr("class", "legendText")
            .attr("x", x2 + 10)
            .attr("y", y1 + 2 * hDiff - 10)
            .attr("dy", "1em")
            // .text(this.plotSetting.title)
            .text('Region Level')
            .style("fill", "black");
        /* legend area ends*/

    }
    addCardLegend(legendContainerID, plotSetting) {
        /* legend area begins*/
        var legendData = [
            { 'x': 50, 'y': 50 }
        ];

        if (!document.getElementById("info-legend-svg")) {
            var svg = d3.select("#" + legendContainerID).append("svg")
                .attr("id", "info-legend-svg")
                .attr("width", '100%')
                .attr("height", '100%');
        }


        var leContainerWidth = $("#" + legendContainerID).width();
        var leContainerHeight = $("#" + legendContainerID).height();

        var hDiff = 20;

        // location of the first line
        var x1 = leContainerWidth / 10;
        var y1 = leContainerHeight / 10 + 8;
        var x2 = leContainerWidth / 10 + 20;
        var y2 = leContainerHeight / 10 + 8;

        let baselineExists = false;
        if (typeof plotSetting.baselineValues !== 'undefined' && plotSetting.baselineValues !== null) {
            baselineExists = true;
        }

        let targetlineExists = false;
        if (typeof plotSetting.targetValues !== 'undefined' && plotSetting.targetValues !== null) {
            targetlineExists = true;
        }

        if (targetlineExists && baselineExists) {
            // add targetline or baseline symbol and text in legend area
            if (plotSetting.targetValues[0] >= plotSetting.baselineValues[0]) {
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

        //add line path symbol in legend area
        var context = d3.select("#info-legend-svg").append("g")
            .attr("transform", "translate(0, 0)");
        var cardLegendLine = context.selectAll("path")
            .data(legendData)
            .enter().append("line");
        var symbolAttr = cardLegendLine.attr('x1', x1)
            .attr('y1', y1 + 2 * hDiff)
            .attr('x2', x2)
            .attr('y2', y1 + 2 * hDiff)
            .attr("height", 15)
            .attr("width", 20)
            .attr("class", 'legendLine')
            .style('stroke-width', "2px")
            .style("stroke", colorList[0 % colorList.length]);
        var legendCircle = [{ "x_axis": x1 + 10, "y_axis": y1 + 2 * hDiff, "radius": 4, "color": colorList[0 % colorList.length] }];
        var cardLegendLineDot = context.selectAll('circle')
            .data(legendCircle)
            .enter().append("circle")
            .attr("cx", function (d) { return d.x_axis; })
            .attr("cy", function (d) { return d.y_axis; })
            .attr("r", function (d) { return d.radius; })
            .style("fill", function (d) { return d.color; });

        d3.select('#info-legend-svg').append("text")
            .attr("class", "legendText")
            .attr("x", x2 + 10)
            .attr("y", y1 + 2 * hDiff - 10)
            .attr("dy", "1em")
            // .text(this.plotSetting.title)
            .text('Region Level')
            .style("fill", "black");
        /* legend area ends*/


    }
    addLegendLine(type, x1, y1, x2, y2) {
        var legendContainerIDHash = '#card-legend-svg-' + this.gridID;
        if (document.getElementById("card-size-check").checked) {
            legendContainerIDHash = '#info-legend-svg';
        }

        if (type == 'baseline') {
            d3.select(legendContainerIDHash).append('line')
                .attr('class', 'baseline')
                .attr('x1', x1)
                .attr('y1', y1)
                .attr('x2', x2)
                .attr('y2', y2);
            d3.select(legendContainerIDHash).append("text")
                .attr("class", "legendText")
                .attr("x", x2 + 10)
                .attr("y", y2 - 10)
                .attr("dy", "1em")
                .text("Base Line")
                .style("fill", "black");
        }
        else if (type == 'targetline') {
            d3.select(legendContainerIDHash).append('line')
                .attr('class', 'targetline')
                .attr('x1', x1)
                .attr('y1', y1)
                .attr('x2', x2)
                .attr('y2', y2);
            d3.select(legendContainerIDHash).append("text")
                .attr("class", "legendText")
                .attr("x", x2 + 10)
                .attr("y", y2 - 10)
                .attr("dy", "1em")
                .text("Target Line")
                .style("fill", "black");
        }

    }
    lineMouseInEventHandler(d, i) {
        // remove mapplots
        if (barPinStatus == true) {
            return;
        }
        d3.selectAll("#circle-" + this.parentElement.parentElement.parentElement.id + "-" + i)
            .attr("r", 6);

        // remove the existing layers on map
        if (propSymbLayerList.length != 0) {
            for (var j = 0; j < propSymbLayerList.length; j++) {
                map.removeLayer(propSymbLayerList[j]);
            }
            propSymbLayerList = [];
        }

        // remove map legend
        $('.legend').remove();
        var svg = d3.select("#legend-svg");
        svg.selectAll('*').remove();
        var selectID = this.parentElement.parentElement.parentElement.id + "-select";
        var selectTool = document.getElementById(selectID);
        var attID = selectTool.selectedIndex % 6;
        var selIndrFullTitle = setup.selectList[selectTool.selectedIndex].text;
        var gridSeqID = this.parentElement.parentElement.parentElement.id.split('_')[1] - 1;
        var color = colorList[gridSeqID % colorList.length];
        var plotID1 = selIndrFullTitle.split(' ')[0].split('.')[0];
        var plotID2 = selIndrFullTitle.split(' ')[0].split('.')[1];
        var plotID = 'goal_' + plotID1 + '_' + plotID2;

        var proSymMap = 1;

        // $.get(layerWithFieldsURL, null, function (mapData) {
        var mapData = JSON.parse(layerWithFields)
        var featureListSymbol = Object.assign({}, mapData.features);

        if (featureListSymbol['0'].properties[d.key.toString()] == null) {
            proSymMap = 0;


        } else if (featureListSymbol['0'].properties[d.key.toString()][attID] == null) {
            proSymMap = 0;

        }

        if (proSymMap == 0) {
            // $('#textNoData').remove();
            document.getElementById("textNoData").style.visibility = "visible";
        }
        // }, 'json');

        // create new layer of proportional Symbol
        maplotSymbol = new proportionalSymbol(layerWithFieldsURL, d.key, attID, color,
            selectID.split('-')[0], plotID);
        //add text of NODATA
        d3.select('#legend-svg').append("text")
            .attr('id', 'textNoData')
            .attr('class', 'legendText')
            .attr("x", $('#legend-svg').width() / 2.5)
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

    plotMouseInEventHandler(d, i) {
        if (barPinStatus == true) {
            return;
        }
        if (propSymbLayerList.length != 0) {
            for (var i = 0; i < propSymbLayerList.length; i++) {
                map.removeLayer(propSymbLayerList[i]);
            }
            propSymbLayerList = [];
        }
        $('.legend').remove();
        var svg = d3.select("#legend-svg");
        svg.selectAll('*').remove();
        var settingGrid = setup.getPlotsList();
        for (var j = 0; j < settingGrid.length; j++) {
            d3.select("#" + settingGrid[j] + "_" + + d.key).style('fill', "#C0C0C0");
        }
        maplot.updateAllMaPlots(d.key, maplot.data, maPlotFeaturesList);
    }

    plotMouseOutEventHandler(d, i) {
        if (barPinStatus == true) {
            return;
        }
        if (propSymbLayerList.length != 0) {
            for (var i = 0; i < propSymbLayerList.length; i++) {
                map.removeLayer(propSymbLayerList[i]);
            }
            propSymbLayerList = [];
        }
        var legend = new DefaultLegend();
        var settingGrid = setup.getPlotsList();
        for (var j = 0; j < settingGrid.length; j++) {
            d3.select("#" + settingGrid[j] + "_" + + d.key).style('fill', colorList[(j) % colorList.length]);
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
