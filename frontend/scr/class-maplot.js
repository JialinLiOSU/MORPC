// #####################################################################################

// Script for Map plots (maplots)

// Luyu: 

// Here, instead of plotID, I chose to point every maplot-bar to gridID. This decision is based the fact that some plots may not exist when calling. But basically you can always find the plotID according to the gridID, but it's hard to find whether certain plot exists or not.

// Currently, only the class proportionalSymbol is used in MORPC dashboard
// #####################################################################################


class maBarPlot {
    constructor(data, featureID) {
        var self = this; // Major improvement. Godly. This will solve 99% of the private/public problem.

        this.maPlotMargin = { top: -10, right: 10, bottom: 30, left: 0 }; // bottom incl. legend and text
        this.data = data;
        this.minimumBarHeight = 10;
        this.maPlotHeight;
        this.maPlotWidth;
        this.featureID = featureID;
        var maPlotID = "#maplot-" + featureID;
        this.maPlotHeight = $(maPlotID).height() - self.maPlotMargin.top - self.maPlotMargin.bottom;
        this.maPlotWidth = $(maPlotID).width() - self.maPlotMargin.left - self.maPlotMargin.right;

        this.initBarMaPlot();
    }

    // Methods

    initBarMaPlot() {
        var height = this.maPlotHeight;
        var width = this.maPlotWidth;
        var margin = this.maPlotMargin;
        var featureID = this.featureID;
        var maPlotID = "#maplot-" + featureID;

        this.chart = d3.select(maPlotID).append("svg")
            .attr("id", "maplot-svg-" + featureID)
            .attr("width", width)
            .attr("height", height)
            .attr("transform", "translate(0," + this.maPlotMargin.top + ")")

        this.y = d3.scaleLinear();
        this.x = d3.scaleBand();
        this.xAxis = d3.axisBottom();
        this.yAxis = d3.axisLeft();

        this.xAxisDom = this.chart.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")

        this.yAxisDom = this.chart.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + margin.left + ",0)")

    }

    updateMaPlot(data) {
        var self = this;
        var duration = 200;
        var featureID = this.featureID;
        var xDomain = []
        var values = []
        var x = this.x;
        var y = this.y;
        var xAxis = this.xAxis;
        var yAxis = this.yAxis;

        var chart = this.chart;
        var margin = this.maPlotMargin;
        var height = this.maPlotHeight;
        var width = this.maPlotWidth;
        var maBarWidth = width / data.length;
        for (var i = 0; i < data.length; i++) {
            xDomain.push(Object.keys(data[i])[0]);
            values.push(Object.values(data[i])[0]);
        }


        y.domain([d3.min(values) - this.minimumBarHeight, d3.max(values)])
            .range([height, 20]);

        x.domain(xDomain);

        xAxis.scale(x);

        yAxis.scale(y);

        var oldX = chart.selectAll(".x").data(["dummy"]);

        var newX = oldX.enter().append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")

        oldX.merge(newX)

        var oldY = chart.selectAll(".y").data(["dummy"]);

        var newY = oldY.enter().append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + margin.left + ",0)")

        oldY.merge(newY)

        var t = d3.transition()
            .duration(750)
            .ease(d3.easeLinear);

        var _maplot = chart.selectAll("rect.maplot-bar").data(data);

        _maplot.enter()
            .append("svg:rect")
            .attr("class", "maplot-bar")
            .attr("id", function (d) {
                var value = Object.values(d)[0];
                var key = Object.keys(d)[0];
                return "maplot-bar-" + self.featureID + "-" + Setup.tempTranslate(key); // Consider change plotid to gridid, since there may be identical plots in different grids.
            })
            .attr("featureID", self.featureID)
            .attr("gridID", function (d) {
                var key = Object.keys(d)[0];
                return Setup.tempTranslate(key)
            }) // Here, instead of plotID, I chose to point every maplot-bar to gridID. This decision is based the fact that some plots may not exist when calling. But basically you can always find the plotID according to the gridID, but it's hard to find whether certain plot exists or not.
            .on("mouseover", this.maplotBarMouseOverHandler)
            .on("mouseout", this.maplotBarMouseOutHandler)
            .attr("transform", function (d, i) { return "translate(" + i * maBarWidth + ",0)"; })
            .attr("x", margin.left + 5)
            .merge(_maplot)
            .transition()
            .duration(duration)
            .attr("y", function (d) {
                var value = Object.values(d)[0];
                return y(value);
            })
            .attr("height", function (d) {
                var value = Object.values(d)[0];
                return height - y(value);
            })
            .attr("width", maBarWidth - 1)
            .style("fill", function (d, i) {
                return colorList[i % colorList.length]
            })

        _maplot.exit()
            .transition()
            .duration(300)
            .attr("height", 0)
            .remove();
    }

    maplotBarMouseOverHandler(e) {
        d3.select(this)
            .style("fill", function (d, i) {
                var gridID = Setup.tempTranslate(Object.keys(d)[0]);
                var currentKey = maplot.currentKey;
                // console.log("#" + gridID + "_" + + currentKey)
                d3.select("#" + gridID + "_" + + currentKey).style('fill', "#C0C0C0");
                return "#C0C0C0"
            })
    }

    maplotBarMouseOutHandler(e) {
        d3.select(this)
            .style("fill", function (d, i) {
                var gridID = Setup.tempTranslate(Object.keys(d)[0]);
                var maplotIndex = setup.findGridByID(gridID).seqid;

                // HighLight main barPlot
                var currentKey = maplot.currentKey;
                d3.select("#" + gridID + "_" + + currentKey).style('fill', colorList[(i) % colorList.length]);
                return colorList[maplotIndex % colorList.length]
            })

    }
}

class maTimeSeriesPlot {
    constructor(data, featureID) {
        var self = this; // Major improvement. Godly. This will solve 99% of the private/public problem.

        this.maPlotMargin = { top: -10, right: 10, bottom: 30, left: 20 }; // bottom incl. legend and text
        this.data = data;
        this.minimumBarHeight = 10;
        this.maPlotHeight;
        this.maPlotWidth;
        this.featureID = featureID;
        var maPlotID = "#maplot-" + featureID;
        this.maPlotHeight = $(maPlotID).height() - self.maPlotMargin.top - self.maPlotMargin.bottom;
        this.maPlotWidth = $(maPlotID).width() - self.maPlotMargin.left - self.maPlotMargin.right;

        this.initTimeSeriesMaPlot();
    }
    initTimeSeriesMaPlot() {
        var height = this.maPlotHeight;
        var width = this.maPlotWidth;
        var margin = this.maPlotMargin;
        var featureID = this.featureID;
        var maPlotID = "#maplot-" + featureID;

        this.chart = d3.select(maPlotID).append("svg")
            .attr("id", "maplot-svg-" + featureID)
            .attr("width", width)
            .attr("height", height)
            // .style("vertical-align", "bottom")
            .attr("transform", "translate(0," + this.maPlotMargin.top + ")")

        this.y = d3.scaleLinear();
        this.x = d3.scaleBand();
        this.xAxis = d3.axisBottom();
        this.yAxis = d3.axisLeft();

        this.xAxisDom = this.chart.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")

        this.yAxisDom = this.chart.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + margin.left + ",0)")
    }

    updateMaPlot(data) {
        this.chart.selectAll("*").remove();
        var featureID = this.featureID;
        var xDomain = []
        var values = []
        var x = this.x;
        var y = this.y;
        var xAxis = this.xAxis;
        var yAxis = this.yAxis;

        var chart = this.chart;
        var margin = this.maPlotMargin;
        var height = this.maPlotHeight;
        var width = this.maPlotWidth;
        // var data = this. data;
        // var maBarWidth = width / data.length;
        for (var i = 0; i < data.length; i++) {
            xDomain.push(Object.keys(data[i])[0]);
            values.push(Object.values(data[i])[0]);
        }

        y.domain([d3.min(values) - this.minimumBarHeight, d3.max(values)])
            .range([height, 20]);

        x.domain(xDomain).range([0, width]);

        xAxis.scale(x);

        yAxis.scale(y);


        var line = d3.line()
            .x(function (d) {
                return x(Object.keys(d)[0]);
            })
            .y(function (d) {
                return y(Object.values(d)[0]);
            });

        var area = d3.area()
            .x(function (d) { return x(Object.keys(d)[0]); })
            .y0((height))
            .y1(function (d) {
                return y(Object.values(d)[0]);
            })
        var g = chart
            .append("g").attr("transform", "translate(" + this.maPlotMargin.left + "," + "0)");
        g.append("path")
            .datum(data)
            .attr("class", "maplot-area")
            .attr("fill", "blue")
            .attr("opacity", 0.3)
            .attr("d", area)
        g.append("path")
            .datum(data)
            .attr("class", "line")
            .attr("d", line)


    }
}

class maPiePlot {
    constructor(data, featureID) {
        var self = this; // Major improvement. Godly. This will solve 99% of the private/public problem.

        this.maPlotMargin = 22; // bottom incl. legend and text
        this.data = data;
        this.minimumBarHeight = 10;
        this.featureID = featureID;
        this.maPlotID = "#maplot-" + featureID;
        this.maPlotHeight = $(this.maPlotID).height();
        this.maPlotWidth = $(this.maPlotID).width();

        this.initPieMaPlot(data, featureID);
    }

    initPieMaPlot(data, featureID) {
        var self = this;
        var data = this.data;
        // set the dimensions and margins of the graph
        var width = this.maPlotWidth
        var height = this.maPlotHeight
        var margin = this.maPlotMargin

        // The radius of the pieplot is half the width or half the height (smallest one). I substract a bit of margin.
        this.radius = Math.min(width, height - margin) / 2

        // append the svg object to the div
        this.svg = d3.select(this.maPlotID)
            .append("svg")
            .attr("id", "maplot-svg-" + featureID)
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(" + width / 2 + "," + (height - margin) / 2 + ")");

        // set the color scale
        this.color = d3.scaleOrdinal()
            .domain(["a", "b", "c", "d", "e", "f"])
            .range(d3.schemeDark2);
    }

    updateMaPlot(inputData) {
        var duration = 200;
        var data = {};
        for (var i = 0; i < inputData.length; i++) {
            var key = Object.keys(inputData[i])[0];
            var value = Object.values(inputData[i])[0];
            data[key] = value;
        }

        var self = this;
        // Compute the position of each group on the pie:
        var pie = d3.pie()
            .value(function (d) {
                return d.value;
            })
            .sort(function (a, b) { return d3.ascending(a.key, b.key); }) // This make sure that group order remains the same in the pie chart
        var data_ready = pie(d3.entries(data))

        // map to data
        var u = this.svg.selectAll("path")
            .data(data_ready)


        // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
        u
            .enter()
            .append('path')
            .merge(u)
            .transition()
            .duration(duration)
            .attr('d', d3.arc()
                .innerRadius(0)
                .outerRadius(this.radius)
            )
            .attr('fill', function (d) { return (self.color(d.data.key)) })
            .attr("stroke", "none")
            .style("stroke-width", "2px")
            .style("opacity", 1)

        // remove the group that is not present anymore
        u
            .exit()
            .remove()

    }

    maplotMouseOverHandler(e) {
        d3.select(this)
            .style("fill", function (d, i) {
                var gridID = Setup.tempTranslate(Object.keys(d)[0]);
                var currentKey = maplot.currentKey;
                console.log("#" + gridID + "_" + + currentKey)
                d3.select("#" + gridID + "_" + + currentKey).style('fill', "#C0C0C0");
                return "#C0C0C0"
            })
    }

    maplotMouseOutHandler(e) {
        d3.select(this)
            .style("fill", function (d, i) {
                var gridID = Setup.tempTranslate(Object.keys(d)[0]);
                var maplotIndex = setup.findGridByID(gridID).seqid;

                // HighLight main barPlot
                var currentKey = maplot.currentKey;
                d3.select("#" + gridID + "_" + + currentKey).style('fill', colorList[(i) % colorList.length]);
                return colorList[maplotIndex % colorList.length]
            })

    }

}

class maPlots {
    constructor(layerURL) {
        var self = this;
        this.maplotDic = {};
        this.data;
        this.maPlotsFeaturesDic = {
        }; // This list need to be automatically generated.

        var maPlotsFeaturesDic = this.maPlotsFeaturesDic;
        this.featureList = Object.keys(maPlotsFeaturesDic).map(Number);

        var featureList = this.featureList;
        this.currentKey = 2012;

        $.get(layerURL, null, function (mapData) {
            self.data = mapData;
            maPlotLayer = L.geoJson(mapData, {
                style: function (feature) {
                    var nullEdgeColor = "#000000"
                    var nullFillColor = "#000000"
                    var prominentColor = "#6b6b6b"

                    if (prominentCountiesOf15.includes(feature.properties.NAME)) {
                        return {
                            color: nullEdgeColor,
                            fillColor: prominentColor,
                            opacity: 0.3,
                            fillOpacity: 0.3,
                            weight: 1
                        }
                    }
                    else {
                        return {
                            color: nullEdgeColor,
                            fillColor: nullFillColor,
                            opacity: 0.3,
                            fillOpacity: 0,
                            weight: 1
                        }
                    }
                },
                onEachFeature: function (feature, layer) {
                    layer.on({
                        mouseover: self.mouseoverCounty,
                        mouseout: self.mouseoutCounty
                    })
                    if (featureList.includes(feature.properties.GEOID)) { //Need more consider on this
                        // Create maPlot
                        var featureID = feature.properties.GEOID;
                        self.addPopupHandler(featureID, feature);
                        console.log("click county");
                    }

                }
            }).addTo(map);
        }, 'json');
    }

    addPopupHandler(featureID, feature) {
        var content = "<div class= 'maplot-container' id ='maplot-" + featureID + "'>" + "<button class='maplot-switch' id='maplot-switch-" + featureID + "' featureID=" + featureID + ">Switch</button></div>"
        if (feature.geometry.type == "Polygon") {
            var cursorLatLng = maplot.calculateCentroid(feature.geometry.coordinates[0])
        } else {
            var cursorLatLng = maplot.calculateCentroid(feature.geometry.coordinates[0][0])
        }
        var bound = map.getBounds();
        var minLat, maxLat, minLng, maxLng;
        minLat = bound._southWest.lat;
        maxLat = bound._northEast.lat;
        minLng = bound._southWest.lng;
        maxLng = bound._northEast.lng;
        var maplotHeight = 100;
        var latOffset = (maxLat - minLat) / map._size.y * maplotHeight / 2;

        var popup = (L.popup({ closeOnClick: false, autoClose: false, autoPan: false }).setLatLng([cursorLatLng[1], cursorLatLng[0]]).setContent(content));
        popup.on("remove", removeFeatureHandler);
        maplot.maPlotsFeaturesDic[featureID].popup = popup;

        function removeFeatureHandler(e) {// The handler triggered after the popup is closed (for now).
            delete maplot.maPlotsFeaturesDic[featureID];
            maplot.updateAllSubLinesPlots();
        }

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
    drawLinesOnCharts(thisData, attID, plotList) {
        if (propSymbLayerList != undefined && propSymbLayerList.length != 0) {
            var propLayer = propSymbLayerList[propSymbLayerList.length - 1];
            var gridID, plotID, gridSeqID;
            if (propLayer != null) {
                gridID = propLayer.gridID;
                plotID = propLayer.plotID;
                gridSeqID = parseInt(gridID.split('_')[1]) - 1;
            }
            var minX, maxX, minY, maxY;
            // reorganize data structure
            var dataPairList = [];
            var key, value, dataPair;
            // draw new element (bar/line) on card
            thisData.properties.length = 6;
            for (var i = 0; i < thisData.properties.length; i++) {
                key = (2012 + i);
                value = Object.values(thisData.properties[key.toString()][attID.toString()])[0];
                dataPair = { key: key, value: value };
                dataPairList.push(dataPair);
            }

            var plotSetting = setup.findPlotByID(plotID);
            // var range = plotSetting.range;
            // var lowerBound = range[0];
            // var upperBound = range[1];

            var titleMargin = 35 // The margin which is equal to the title. the svg's height should be height of the container (#plot1) - titleMargin. To prevent scroll plot
            var plotMargin = { top: -10, right: 0, bottom: 30, left: 50 };
            var gridSetting = setup.findGridByID(gridID);
            var gridHashID = '#' + gridID;
            var plotWidth;
            if (!document.getElementById("card-size-check").checked) {
                plotWidth = $(gridHashID).width() - plotMargin.left - plotMargin.right - $(gridHashID).width() / 3;
            } else {
                plotWidth = $(gridHashID).width() - plotMargin.left - plotMargin.right;
            }


            var height = $('#' + gridID).height() - titleMargin - plotMargin.top - plotMargin.bottom;;
            var width = plotWidth;
            var data = dataPairList;

            var dotsData = [];
            for (var j = 0; j < data.length; j++) {
                dotsData = dotsData.concat(data[j]);
            }

            var xDomain = [];
            var values = [];

            for (var i = 0; i < dotsData.length; i++) {
                if (!xDomain.includes(dotsData[i].key)) {
                    xDomain.push(dotsData[i].key);
                }

            }
            // var test = $("#xAxis-" + gridID);
            // var rangeXY = test.rangeXY;

            // maxY = upperBound;
            // minY = lowerBound;
            var plotInstance;
            for (var i = 0; i < plotList.length; i++) {
                if (plotID === plotList[i].plotID || plotID == plotList[i].barShortID) {
                    plotInstance = plotList[i];
                }
            }
            minX = plotInstance.minX;
            maxX = plotInstance.maxX;
            minY = plotInstance.minY;
            maxY = plotInstance.maxY;

            for (var j = 0; j < dotsData.length; j++) {
                if (dotsData[j].value === null) {
                    dotsData.splice(j, 1);
                }
            }

            xDomain.sort();


            var y = d3.scaleLinear().rangeRound([height - 3, 20]);

            y.domain([minY, maxY])

            var x = d3.scaleBand()
                .domain(xDomain)
                .rangeRound([0, width])
                .paddingInner(0.05)
                .align(0.1);

            var lineData = [];
            for (var k = 0; k < data.length; k++) {
                var linePoint;
                if (data[k].value === null) {
                    linePoint = [x(data[k].key) + x.bandwidth() / 2, null];
                } else {
                    linePoint = [x(data[k].key) + x.bandwidth() / 2, y(data[k].value)];
                }

                lineData.push(linePoint);
            }
            var defined = function (d) { return d[1] !== null; };
            var line = d3.line();
            var filteredData = lineData.filter(defined);
            var segments = maplot.computeSegments(lineData, defined);

            var g = d3.select("#svg-g-" + gridID);
            g.append('g')
                .attr('id', 'county-segments-line-' + gridID)
                .attr('class', 'county-line');
            g.append('path').attr('id', 'county-gap-line-' + gridID)
                .attr('class', 'county-line');

            d3.select('#county-segments-line-' + gridID).selectAll('path').data(segments)
                .enter()
                .append('path')
                .attr('d', line)
                .style('stroke-width', "1.5px")
                .style("stroke", colorList[gridSeqID % colorList.length])
                // .style("stroke", "black")
                .style("fill", "none");;

            d3.select('#county-gap-line-' + gridID)
                .attr('d', line(filteredData))
                .style('stroke-dasharray', "4 4")
                .style('stroke-width', "1px")
                .style('opacity', "1")
                .style('stroke', colorList[gridSeqID % colorList.length])
                // .style("stroke", "black")
                .style("fill", "none");

            g.selectAll("dot")
                .data(dotsData)
                .enter().append("circle")
                .attr("r", 2)
                .attr("cx", function (d) {
                    return x(d.key) + x.bandwidth() / 2;
                })
                .attr("cy", function (d) {
                    return y(d.value);
                })
                .attr("id", function (d, i) {
                    return "circle-" + self.gridID + "-" + i;
                })
                .attr("class", "county-dot")
                .style("z-index", 99999)
                .style("fill", colorList[gridSeqID % colorList.length])
                .on('mouseover', self.lineMouseInEventHandler)
                .on("mouseout", function (d, i) {
                    if (barPinStatus == true) {
                        return;
                    }
                    d3.selectAll(".circle-" + self.gridID)
                        .attr("r", 4);
                })
                .on('click', function () {
                    barPinStatus = true;
                });

            //add line path symbol in legend area
            /* legend area begins*/
            var legendData = [
                { 'x': 50, 'y': 50 }
            ];
            var leContainerWidth = $("#" + this.legendContainerID).width();
            var leContainerHeight = $("#" + this.legendContainerID).height();

            var hDiff = 20;

            // location of the first line

            var x1 = leContainerWidth / 10;
            var y1 = leContainerHeight / 10 + 10 + 5;
            var x2 = leContainerWidth / 10 + 20;
            var y2 = leContainerHeight / 10 + 10 + 5;
            var legendText = "County Level"
            if (plotSetting.atype == "stackBar") {
                y1 = y1 - hDiff;
                y2 = y2 - hDiff;
                legendText = "Sum for County Level";
            }
            var color = colorList[gridSeqID % colorList.length];
            var context = d3.select("#card-legend-svg-" + gridID).append("g")
                .attr("transform", "translate(0, 0)");
            var cardLegendLine = context.selectAll("path")
                .data(legendData)
                .enter().append("line");
            var symbolAttr = cardLegendLine.attr('x1', x1 + 20)
                .attr('y1', y1 + 4 * hDiff)
                .attr('x2', x2 + 20)
                .attr('y2', y1 + 4 * hDiff)
                .attr("height", 15)
                .attr("width", 20)
                .attr('id', "countyLegLine-" + gridID)
                .attr("class", 'legendLine')
                .style('stroke-width', "2px")
                .style("stroke", color);
            var legendCircle = [{ "x_axis": x1 + 30, "y_axis": y1 + 4 * hDiff, "radius": 2, "color": color }];
            var cardLegendLineDot = context.selectAll('circle')
                .data(legendCircle)
                .enter().append("circle")
                .attr('id', "countyLegDot-" + gridID)
                .attr("cx", function (d) { return d.x_axis; })
                .attr("cy", function (d) { return d.y_axis; })
                .attr("r", function (d) { return d.radius; })
                .style("fill", function (d) { return d.color; });

            d3.select('#card-legend-svg-' + gridID).append("text")
                .attr('id', "countyLegText-" + gridID)
                .attr("class", "legendText")
                .attr("x", x2 + 30)
                .attr("y", y1 + 4 * hDiff - 10)
                .attr("dy", "1em")
                .text(legendText)
                .style("fill", "black");
            // return colorList[gridSeqID % colorList.length];
        }
    }
    mouseoverCounty(e) {
        var thisData = e.target.feature;
        if (prominentCountiesOf15.includes(thisData.properties.NAME)) {
            var layer = e.target;
            // highlight the hovered county
            layer.setStyle({
                weight: 5,
                color: '#666',
                dashArray: '',
                fillOpacity: 0.3
            });

            // highlight vertical bar of slider legend
            var year, attID, gridID;
            var propLayer;
            if (propSymbLayerList != undefined && propSymbLayerList.length != 0) {
                propLayer = propSymbLayerList[propSymbLayerList.length - 1];

                if (propLayer != null) {
                    year = propLayer.year;
                    attID = propLayer.attID;
                    gridID = propLayer.gridID;
                }
                var value = thisData.properties[(year + 2012).toString()][attID.toString()];
                var test = Object.values(value);
                var vertLine = d3.select('#vertLine_' + Object.values(value));
                vertLine.style('stroke-width', 3);
                // document.getElementById('text_map').value += 'Indicator value: ' + Object.values(value);
                // add county information
                document.getElementById('text_map').value += '\n' + 'Indicator Value: ' + Object.values(value);
                document.getElementById('text_map').value += '\n' + 'County Name: ' + thisData.properties.NAME;
            }
            else {
                document.getElementById('text_map').value += '\n' + 'County Name: ' + thisData.properties.NAME;
            }


            //var color = maplot.drawLinesOnCharts(thisData, attID, plotList);
        }
    }
    mouseoutCounty(e) {

        var thisData = e.target.feature;
        if (prominentCountiesOf15.includes(thisData.properties.NAME)) {
            var layer = e.target;
            // highlight the hovered county
            layer.setStyle({
                weight: 1,
                color: "#000000",
                dashArray: '',
                fillOpacity: 0.3
            });

            // add county information
            // $('#text_map').remove();

            // highlight vertical bar of slider legend

            // dehighlight vertical bar of slider legend
            if (propSymbLayerList != undefined && propSymbLayerList.length != 0) {
                var propLayer = propSymbLayerList[propSymbLayerList.length - 1];
                var year, attID, gridID;
                if (propLayer != null) {
                    year = propLayer.year;
                    attID = propLayer.attID;
                    gridID = propLayer.gridID;
                }
                var value = thisData.properties[(year + 2012).toString()][attID.toString()];
                var vertLine = d3.select('#vertLine_' + Object.values(value));
                vertLine.style('stroke-width', 1);
                var text = document.getElementById('text_map').value;
                var text_list = text.split('\n');
                var new_text_list = [];
                for (var k = 0; k < 4; k++) {
                    new_text_list[k] = text_list[k]
                }
                document.getElementById('text_map').value = new_text_list.join('\n');
            }
            else {
                document.getElementById('text_map').value = "Supplementary Information \nIndicator Name:\nUnit of Measure: \nFocus Year: ";
            }
            $('.county-line').remove();
            $('.county-dot').remove();

            $("#countyLegText-" + gridID).remove();
            $("#countyLegDot-" + gridID).remove();
            $("#countyLegLine-" + gridID).remove();


        }

    }

    addFeatureHandler(e) { // The handler triggered after the feature is added/clicked (for now).
        // remove proportional symbols
        if (propSymbLayerList.length != 0) {
            for (var i = 0; i < propSymbLayerList.length; i++) {
                map.removeLayer(propSymbLayerList[i]);
            }
            $('.legend').remove();
            var svg = d3.select("#legend-svg");
            svg.selectAll('*').remove();
        }
        $(".leaflet-popup-content").css("background", "none").css("border-style", "none")
        var curZoom = this._map._zoom; //current zoom level 

        if (curZoom >= setup.acceptZoom || !document.getElementById("myCheck").checked) {
            var thisData = e.target.feature;
            var featureID = thisData.properties.GEOID;
            maplot.maPlotsFeaturesDic[featureID] = { type: "timeSeries" };
            maplot.maPlotsFeaturesDic[featureID].data = thisData.properties;
            maplot.maPlotsFeaturesDic[featureID].geometry = thisData.geometry;

            /* Add and update maplot*/
            maplot.addPopupHandler(featureID, thisData);
            maplot.updateAllMaPlots(maplot.currentKey, maplot.data);

            /* Add sublineplot */
            maplot.updateAllSubLinesPlots();
        }
    }

    calculateCentroid(latlngList) { // center of bounding box
        var lat, lng;
        var minLat = 90, minLng = 180, maxLat = 0, maxLng = -180;
        for (var i = 0; i < latlngList.length; i++) {
            lat = latlngList[i][1];
            lng = latlngList[i][0];
            if (lat < minLat) {
                minLat = lat;
            }
            if (lat > maxLat) {
                maxLat = lat;
            }
            if (lng < minLng) {
                minLng = lng;
            }
            if (lng > maxLng) {
                maxLng = lng;
            }
        }
        var centerLng = (minLng + maxLng) / 2;
        var centerLat = (minLat + maxLat) / 2;
        // var centerLat = minLat;
        return [centerLng, centerLat];
    }
    calculateCentroidProp(latlngList) {
        var lat = 0;
        var lng = 0;
        var latOffset = 0; // To adjust the popup's location so that the maplot fits the county boundary.
        for (var i = 0; i < latlngList.length; i++) {
            lat += latlngList[i][1];
            lng += latlngList[i][0];
        }
        // console.log(lat, lng / latlngList.length);
        return [lng / latlngList.length, lat / latlngList.length - latOffset];
    }

    updateAllMaPlots(key, mapData) {
        this.currentKey = key;
        var self = this;
        var data = mapData.features;
        var maPlotsFeaturesDic = this.maPlotsFeaturesDic;

        this.featureList = Object.keys(maPlotsFeaturesDic).map(Number);
        var featureList = this.featureList;

        for (var i = 0; i < data.length; i++) {
            if (featureList.includes(data[i].properties.GEOID)) {
                var featureID = data[i].properties.GEOID;
                if ($("#maplot-svg-" + featureID).html() == undefined) { // To find out whether the svg has been created: if undefined, not open.
                    if ($("#maplot-" + featureID).html() == undefined) { // To find out whether the popup is open
                        maPlotsFeaturesDic[featureID].popup.openOn(map);

                        $("#maplot-switch-" + featureID).on("click", function (e) {
                            var target = e.target;
                            var featureID = target.attributes.featureid.nodeValue;
                            $("#maplot-svg-" + featureID).remove()
                            if (self.maPlotsFeaturesDic[featureID].type == "pie") {
                                self.maPlotsFeaturesDic[featureID].type = "bar"
                            }
                            else if (self.maPlotsFeaturesDic[featureID].type == "bar") {
                                self.maPlotsFeaturesDic[featureID].type = "timeSeries"
                            }
                            else {
                                self.maPlotsFeaturesDic[featureID].type = "pie"
                            }
                            self.updateAllMaPlots(self.currentKey, self.data)
                        })
                    }


                    // This is the place you should be placing the popup/maplot events and setting, since this place means you already fully open the maplot.

                    $("#maplot-switch-" + featureID).css("opacity", "0");
                    $(".leaflet-popup-close-button").css("opacity", "0");
                    $(".maplot-switch").css("z-index", 9999999);
                    $("#maplot-" + featureID).parent().css("background", "rgba(127, 127, 127, 0.1)")

                    document.getElementById("maplot-" + featureID).parentNode.parentNode.addEventListener('mouseenter', maplotMouseEnterHandler, true);
                    $("#maplot-" + featureID).parent().parent().parent().mouseleave(maplotMouseOutHandler); // Leaflet's fault.

                    function maplotMouseEnterHandler(d) {
                        var curZoom = map.getZoom();
                        if (curZoom >= setup.acceptZoom) {
                            var featureID = findfeatureID(d);
                            $("#maplot-switch-" + featureID).css("opacity", "0");
                            $(".leaflet-popup-close-button").css("opacity", "1");
                            $("#maplot-" + featureID).parent().css("background", "rgba(127, 127, 127, 0)").css("border-style", "none").css("border-color", "rgba(127, 127, 127, 0)")
                        }

                    }

                    function maplotMouseOutHandler(d) {
                        $(".maplot-switch").css("opacity", "0");
                        $(".leaflet-popup-close-button").css("opacity", "0");
                        $(".leaflet-popup-content").css("background", "none").css("border-style", "none")
                    }

                    function findfeatureID(d) { // This is broken.
                        var featureID = d.target.parentElement.id.split("-")[1]
                        if (featureID == undefined) {
                            featureID = d.target.id.split("-")[1]
                        }
                        if (featureID == undefined) {
                            featureID = d.target.children[0].id.split("-")[1]
                        }
                        if (featureID == undefined) {
                            featureID = d.target.children[0].children[0].id.split("-")[1]
                        }
                        return featureID;
                    }

                    var featureID = data[i].properties.GEOID;
                    var thiskeyData = data[i].properties[key];
                    switch (maPlotsFeaturesDic[featureID].type) {
                        case "bar":
                            self.maplotDic[featureID] = (new maBarPlot(thiskeyData, featureID));
                            break;
                        case "pie":
                            self.maplotDic[featureID] = (new maPiePlot(thiskeyData, featureID));
                            break;
                        case "timeSeries":
                            self.maplotDic[featureID] = (new maTimeSeriesPlot(thiskeyData, featureID));
                            break;
                    }
                }
                var thiskeyData = data[i].properties[key];
                var featureID = data[i].properties.GEOID;
                self.maplotDic[featureID.toString()].updateMaPlot(thiskeyData, featureID);
            }
        }
    }

    updateAllSubLinesPlots() {
        var SettingGrid = setup.stateVariables['cardPanel'];
        var gridList = Object.values(SettingGrid)
        for (var i = 1; i < gridList.length - 1; i++) {
            var plotInstance = gridList[i].plotInstance;
            if (plotInstance.type != "bar") {
                continue;
            }

            var data = Object.values(this.maPlotsFeaturesDic).map(x => x.data);
            plotInstance.subLinesPlotInstance.updatePlot(data);
        }
    }
}

// build a class for proportional symbol map
class proportionalSymbol {
    constructor(layerURL, year, attID, color, gridID = null, plotID = null) {
        var self = this;
        this.maplotDic = {};
        this.data;
        this.maPlotsFeaturesDic = {
        }; // This list need to be automatically generated.
        this.numFeature = 0;

        var maPlotsFeaturesDic = this.maPlotsFeaturesDic;
        this.featureList = Object.keys(maPlotsFeaturesDic).map(Number);

        var featureList = this.featureList;

        year = year - 2012;
        // this two is used to pass value from brush to mouseover of slider legend
        this.rangeMax;
        this.rangeMin;
        this.gridID = gridID;
        this.plotID = plotID;

        // use data retrieved in setup as the county level data for map
        // but now the data is randomly generated but not real data
        var mapData = layerWithFields;
        mapData = JSON.parse(mapData);
        self.data = mapData;
        var min = Infinity, max = -Infinity;
        var attri;
        if (mapData.features.length != 0) {
            self.numFeature = mapData.features.length;
        }

        var featureListSymbol = Object.assign({}, self.data.features);
        var attrList = [];
        // build a new feature array
        for (var feature in featureListSymbol) {
            // calculate centroid
            if (featureListSymbol[feature].geometry.type == "Polygon") {
                var coord = maplot.calculateCentroidProp(featureListSymbol[feature].geometry.coordinates[0]);
            } else {
                var coord = maplot.calculateCentroidProp(featureListSymbol[feature].geometry.coordinates[0][0]);
            }
            featureListSymbol[feature].geometry.type = "Point";
            featureListSymbol[feature].geometry.coordinates = coord;

            // get min and max attribute values
            if (Object.values(featureListSymbol[feature].properties)[year] == null) {
                return;
            }
            if (Object.values(featureListSymbol[feature].properties)[year][attID] == null) {
                return;
            }

            if (prominentCountiesOf15.includes(featureListSymbol[feature].properties.NAME)) {
                attri = Object.values(Object.values(featureListSymbol[feature].properties)[year][attID])[0];
                attrList.push(attri);
                if (attri < min) {
                    min = attri;
                }
                if (attri > max) {
                    max = attri;
                }
            }
        }

        // add the symbols on map
        var propSymbLayer = L.geoJson(mapData, {
            pointToLayer: function (feature, latlng) {
                if (prominentCountiesOf15.includes(feature.properties.NAME)) { // only draw symbols for the 15 counties
                    var attri = Object.values(Object.values(feature.properties)[year][attID])[0];
                    var scaleFactor = 2;
                    var area = attri * scaleFactor;
                    var radius = Math.sqrt(area / Math.PI) * 2;
                    var geojsonMarkerOptions = {
                        radius: radius,
                        // fillColor: color,
                        fillColor: color,
                        // color: color,
                        color: "#000",
                        weight: 0.5,
                        opacity: 1,
                        fillOpacity: 0.5
                    };
                    var circleMarker = L.circleMarker(latlng, geojsonMarkerOptions);
                    return circleMarker;
                }
            }
        }).addTo(map);
        // save the current layer information to propSymbLayerList
        propSymbLayer.year = year;
        propSymbLayer.attID = attID;
        propSymbLayer.gridID = gridID;
        propSymbLayer.plotID = plotID;
        propSymbLayerList.push(propSymbLayer);

        // add legend
        // add the two symbols in legend
        var svg = d3.select("#legend-svg");
        svg.selectAll('*').remove();

        var xMin = 25, xMax = $("#side-bar-wrapper").width() - 50;
        var xRange = xMax - xMin;

        var y = 60;
        var legendSym = [
            { key: 'min', 'value': min, 'x': xMin, 'y': y },
            { key: 'max', 'value': max, 'x': xMax, 'y': y }
        ];
        var xScale = d3.scaleLinear().domain([min, max]).range([xMin, xMax]);
        var xAxis = d3.axisBottom().scale(xScale).tickSizeOuter(0);
        var height = y;
        var context = d3.select("#legend-svg").append("g")
            .attr('id', 'vertLineContainer')
            .attr("transform", "translate(0, 0)");
        var symbolLegend = context.selectAll("circle")
            .data(legendSym)
            .enter().append("circle");
        var symbolAttr = symbolLegend.attr('cx', function (d) { return d.x })
            .attr('cy', function (d) { return d.y - Math.sqrt(d.value * 2 / Math.PI) * 2 })
            .attr('r', function (d) { return Math.sqrt(d.value * 2 / Math.PI) * 2; })
            .style("fill", color)
            .style("fill-opacity", 0.5)
            .style('stroke', 'grey')
            .style('stroke-width', 1);
        // add vertical lines between the two symbols
        attrList.sort(function (a, b) {
            return a - b;
        });

        var brushed = function (d) {
            // brushed function for slider legend
            var test = d3.event.selection;
            var s = d3.event.selection || xScale.range();
            var x1 = s[0], x2 = s[1];
            var rangeMin = (x1) / xRange * (max - min) + min;
            var rangeMax = (x2) / xRange * (max - min) + min;
            var lastPropLayer;
            proportionalSymbol.rangeMin = rangeMin;
            proportionalSymbol.rangeMax = rangeMax;

            if (propSymbLayerList.length != 0 && map.hasLayer(propSymbLayerList[propSymbLayerList.length - 1])) {

                lastPropLayer = propSymbLayerList[propSymbLayerList.length - 1];
                for (var i = 0; i < propSymbLayerList.length; i++) {
                    map.removeLayer(propSymbLayerList[i]);
                }
                propSymbLayerList.splice(0, propSymbLayerList.length)

                var propSymbLayer = L.geoJson(mapData, {
                    pointToLayer: function (feature, latlng) {
                        if (prominentCountiesOf15.includes(feature.properties.NAME)) {
                            var attri = Object.values(Object.values(feature.properties)[year][attID])[0];
                            var op;
                            if ((attri <= rangeMax) && (attri >= rangeMin)) {
                                op = 0.5;
                            } else {
                                op = 0;
                            }

                            var attri = Object.values(Object.values(feature.properties)[year][attID])[0];
                            var scaleFactor = 2;
                            var area = attri * scaleFactor;
                            var radius = Math.sqrt(area / Math.PI) * 2;
                            var geojsonMarkerOptions = {
                                radius: radius,
                                fillColor: color,
                                color: "#000",
                                weight: 0.5,
                                opacity: 1,
                                fillOpacity: op
                            };
                            var circleMarker = L.circleMarker(latlng, geojsonMarkerOptions);
                            return circleMarker;
                        }

                    }
                }).addTo(map);
                propSymbLayer.year = lastPropLayer.year;
                propSymbLayer.attID = lastPropLayer.attID;
                propSymbLayer.gridID = lastPropLayer.gridID;
                propSymbLayerList.push(propSymbLayer);
            }
        }

        var brush = d3.brushX()
            .extent([[0, 0], [xRange, height - 25]])
            .on('brush', brushed);
        context.append("g") // Create brushing xAxis
            .attr("class", "x axis1")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);
        var contextArea = d3.area() // Set attributes for area chart in brushing context graph
            .x(xScale) // x is scaled to xScale2
            .y0(height) // Bottom line begins at height2 (area chart not inverted) 
            .y1(0); // Top line of area, 0 (area chart not inverted)

        //plot the rect as the bar at the bottom
        context.append("path") // Path is created using svg.area details
            .attr("class", "area")
            .attr("d", contextArea(attrList)) // pass first categories data .values to area path generator 
            .attr("fill", "#F1F1F2");

        //append the brush for the selection of subsection  
        context.append("g")
            .attr("class", "x brush")
            .attr("transform", "translate(25," + 25 + ")")
            .call(brush)
            .selectAll("rect")
            .attr("height", height - 25) // Make brush rects same height 
            .attr("fill", "grey")
            .attr("fill-opacity", 0)
            .attr("opacity", 1);



        attrList.unshift(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0); // the 0s are counted for ticker lines
        // add verticle lines for the mid-ohio counties
        var lineLegend = context.selectAll('line')
            .data(attrList)
            .enter().append('line')
            .attr('id', function (d) { return "vertLine" + '_' + d.toString() });

        // set line attributes
        var lineAttr = lineLegend.attr('x1', function (d) {
            return (d - min) / (max - min) * xRange + xMin;
        })
            .attr('y1', function (d) {
                return y - Math.sqrt(d * 2 / Math.PI) * 2 * 2;
            })
            .attr('x2', function (d) {
                return (d - min) / (max - min) * xRange + xMin;
            })
            .attr('y2', y)
            .style('stroke', 'grey')
            .style('stroke-width', 1);

        // });

    }
}

class DefaultLegend {
    constructor() {
        $('.legend').remove();
        var svg = d3.select("#legend-svg");
        svg.selectAll('*').remove();
        var svg1 = d3.select("#legend-svg");
        var xMin1 = 25, xMax1 = $("#side-bar-wrapper").width() - 50;
        var xRange1 = xMax1 - xMin1;
        var min1 = 0
        var max1 = 100
        var y1 = 60;
        var legendSym1 = [
            { key: 'min', 'value': min1, 'x': xMin1, 'y': y1 },
            { key: 'max', 'value': max1, 'x': xMax1, 'y': y1 }
        ];
        var xScale1 = d3.scaleLinear().domain([min1, max1]).range([xMin1, xMax1]);
        var xAxis1 = d3.axisBottom().scale(xScale1).tickSizeOuter(0).ticks(1).tickFormat(function (d) {
            switch (d) {
                case 0: return "Min Value"; break;
                case 100: return "Max Value"; break;
                default: return "";
            }
        });
        var height1 = y1;

        var context1 = d3.select("#legend-svg").append("g")
            .attr('id', 'vertLineContainer')
            .attr("transform", "translate(0, 0)");

        var attrList1 = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
        context1.append("g") // Create brushing xAxis
            .attr("class", "x axis1")
            .attr("transform", "translate(0," + height1 + ")")
            .call(xAxis1);


        attrList1.unshift(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0); // need to fix
        var lineLegend1 = context1.selectAll('line')
            .data(attrList1)
            .enter().append('line')
            .attr('id', function (d) { return "vertLine" + '_' + d.toString() });


        var lineAttr1 = lineLegend1.attr('x1', function (d) {
            return (d - min1) / (max1 - min1) * xRange1 + xMin1;
        })
            .attr('y1', function (d) {
                return y1 - Math.sqrt(d * 2 / Math.PI) * 2;
            })
            .attr('x2', function (d) {
                return (d - min1) / (max1 - min1) * xRange1 + xMin1;
            })
            .attr('y2', y1)
            .style('stroke', 'grey')
            .style('stroke-width', 1);

    }
}
