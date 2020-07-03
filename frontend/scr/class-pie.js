/*!
 * MORPC pie chart
 * @author Luyu Liu
 * @date June 11th, 2019
 */

class piePlot {
    constructor(gridSetting, plotSetting, data) {
        this.highLightFeaturesList = plotSetting.highLightFeaturesList;
        this.layerURL = plotSetting.layerURL;
        this.gridnode = gridSetting;
        this.plotSetting = plotSetting;

        // plot's affiliation
        this.plotID = "#" + this.plotSetting.id; // "#goal_n_m";
        this.plotShortID = this.plotSetting.id // "goal_n_m";

        // grid's affiliation
        this.gridID = gridSetting.id;
        this.gridHashID = "#" + gridSetting.id;
        this.gridPinID = '#' + this.gridnode.pinid; // "#plot1-pin"
        this.gridSeqID = this.gridnode.seqid // 1
        this.legendContainerID = "legend-container-" + this.gridID;

        this.range = plotSetting.range;
        this.titleMargin = 45; // The margin which is equal to the title. the svg's height should be height of the container (#plot1) - titleMargin. To prevent scroll bar

        this.plotMargin = 20; // bottom incl. legend and text

        this.plotWidth = $(this.gridHashID).width() - this.plotMargin * 2 - $(this.gridHashID).width() / 3;
        this.plotHeight = $(this.gridHashID).height() - this.plotMargin * 2;
        this.plotWidth = d3.min([this.plotHeight, this.plotWidth]);
        this.plotHeight = this.plotWidth;

        var self = this;
        var gridID = this.gridID;
        $.get(this.layerURL, null, function (mapData) {
            window[gridID + "Layer"]; // %%!!!!%% : This is global.
            window[gridID + "Layer"] = L.geoJson(mapData, {
                style: function (feature) {
                    var edgeColor = "#777";
                    var highLightEdgeColor = "#000000"
                    var fillColor = "#FFFFFF";
                    var highLightFillColor = "#000000"
                    if (self.highLightFeaturesList.includes(feature.properties.GEOID)) {
                        return {
                            color: highLightEdgeColor,
                            fillColor: highLightFillColor,
                            opacity: 1,
                            fillOpacity: 0.50,
                            weight: 0.8
                        }
                    }
                    else {
                        return {
                            color: edgeColor,
                            fillColor: fillColor,
                            opacity: 1,
                            fillOpacity: 0.50,
                            weight: 0.8
                        };

                    }
                }
            });
        },'json');

    }


    drawPlot() {
        var self = this;
        var height = this.plotHeight;
        var width = this.plotWidth;
        var margin = this.plotMargin
        var gridID = this.gridID;
        var gridHashID = this.gridHashID;

        var data = this.data;
        // set the dimensions and margins of the graph


        // The radius of the pieplot is half the width or half the height (smallest one). I substract a bit of margin.
        this.radius = Math.min(width, height) / 2 - margin

        // append the svg object to the div
        this.svg = d3.select(this.gridHashID)
            .append("svg")
            .attr("id", "plot-svg-" + this.gridID)
            .attr("width", width + this.plotMargin * 2)
            .attr("height", height - this.titleMargin + this.plotMargin * 2)
            .append("g")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
            .style("fill", colorList[this.gridSeqID % colorList.length]);
        // create 2 data_set
        var data1 = { a: 9, b: 20, c: 30, d: 8, e: 12 }
        var data2 = { a: 6, b: 16, c: 20, d: 14, e: 19, f: 12 }

        // set the color scale
        this.color = d3.scaleOrdinal()
            .domain(["a", "b", "c", "d", "e", "f"])
            .range(d3.schemeDark2);

        // Initialize the plot with the first dataset
        this.updateData(data1)

        /* legend area begins*/
        var legendData = [
            { key: 'att1', 'x': 50, 'y': 50 },
            { key: 'att1', 'x': 50, 'y': 80 }
        ];
        var svg = d3.select("#" + this.legendContainerID).append("svg")
            .attr("id", "card-legend-svg-" + this.gridID)
            .attr("width", '100%')
            .attr("height", '100%');

        var leContainerWidth = $("#" + this.legendContainerID).width();
        var leContainerHeight = $("#" + this.legendContainerID).height();

        var context = d3.select("#card-legend-svg-" + this.gridID).append("g")
            .attr("transform", "translate(0, 0)");
        var cardLegend = context.selectAll("rect")
            .data(legendData)
            .enter().append("rect");
        var symbolAttr = cardLegend.attr('x', leContainerWidth / 10)
            .attr('y', leContainerHeight / 10)
            .attr("height", 15)
            .attr("width", 20)
            .attr("class", 'legendRect')
            .style("fill", colorList[this.gridSeqID % colorList.length]);
        svg.append("text")
            .attr("class", "legendText")
            .attr("x", leContainerWidth / 10 + 30)
            .attr("y", leContainerHeight / 10)
            .attr("dy", "1em")
            .text("Franklin")
            .style("fill", "black");
        /* legend area begins*/

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

    updateData(data) {
        var self = this;
        // Compute the position of each group on the pie:
        var pie = d3.pie()
            .value(function (d) { return d.value; })
            .sort(function (a, b) { return d3.ascending(a.key, b.key); }) // This make sure that group order remains the same in the pie chart
        var data_ready = pie(d3.entries(data))

        // Three function that change the tooltip when user hover / move / leave a cell
        var mouseover = function (d) {
            Tooltip
                .style("opacity", 1)
            d3.select(this)
                .style("stroke", "black")
                .style("opacity", 1)

            d3.select(this).transition()
                .ease(d3.easeBounce)
                .duration(200)
                .attr("transform", function (d, i) {
                    var angle = (d.startAngle + d.endAngle) / 2;

                    var pullOutSize = 15;
                    return "translate(" + (Math.sin(angle) * pullOutSize) + ',' + - (Math.cos(angle) * pullOutSize) + ")";
                })
        }
        var mousemove = function (d) {
            Tooltip
                .html("The exact value of<br>this cell is: " + d.value)
                .style("left", (d3.mouse(this)[0] + 250) + "px")
                .style("top", (d3.mouse(this)[1] + 200) + "px")
        }
        var mouseleave = function (d) {
            Tooltip
                .style("opacity", 0)
            d3.select(this)
                .style("stroke", "white")
                .style("opacity", 1)
            d3.select(this).transition()
                .ease(d3.easeBounce)
                .duration(200)
                .attr("transform", function (d, i) {
                    return "translate(" + 0 + ',' + 0 + ")";
                })
        }

        // map to data
        var u = this.svg.selectAll("path")
            .data(data_ready)

        var Tooltip = d3.select(this.gridHashID)
            .append("div")
            .style("opacity", 0)
            .attr("class", "tooltip")
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "2px")
            .style("border-radius", "5px")
            .style("padding", "5px")

        // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
        u
            .enter()
            .append('path')
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave)
            .merge(u)
            .transition()
            .duration(1000)
            .attr('d', d3.arc()
                .innerRadius(0)
                .outerRadius(this.radius)
            )
            .attr('fill', function (d) { return colorList[self.gridSeqID % colorList.length] })
            .attr("stroke", "white")
            .style("stroke-width", "3px")
            .style("opacity", 1)

        // remove the group that is not present anymore
        u
            .exit()
            .remove()

    }



}