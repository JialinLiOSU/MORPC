function downloadClick(gridID) {
    var plotID = setup.stateVariables['cardPanel'][gridID].content;
    var filename = setup.settingPlot[plotID].title;
    $("#general-data-button").off();
    $("#general-data-button").click(function () {
        var data = setup.settingPlot[plotID].data;
        var fields = Object.keys(data[0]);
        var replacer = function (key, value) {
            if (value === null) {
                return '';
            }
            else {
                if (value === "key") {
                    return setup.settingPlot[plotID].title;
                }
                else {
                    return value;
                }
            }
        }
        var csv = data.map(function (row) {
            return fields.map(function (fieldName) {
                return JSON.stringify(row[fieldName], replacer)
            }).join(',')
        })
        csv.unshift(fields.join(',')) // add header column
        csv = csv.join('\r\n');
        var csvContent = "data:text/csv;charset=utf-8," + escape(csv);
        console.log(csvContent)

        // var encodedUri = encodeURIComponent(csvContent);
        // window.open(encodedUri);
        var csvFile = new Blob([csv], { type: "text/csv" });
        var downloadLink = document.createElement("a");
        downloadLink.download = filename + "_region.csv";
        downloadLink.href = window.URL.createObjectURL(csvFile);
        downloadLink.style.display = "none";
        document.body.appendChild(downloadLink);
        downloadLink.click();
    });

    $("#geo-data-button").off();
    $("#geo-data-button").click(function () {
        var titleID = setup.settingPlot[plotID].titleID;
        var downloadURL = "https://cura-sco-dev.asc.ohio-state.edu/test/api/v1/geos/counties/kml/" + titleID
        fetch(downloadURL)
            .then(resp => resp.blob())
            .then(blob => {
                var url = window.URL.createObjectURL(blob);
                var a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = filename + '.kml';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
            })
            .catch(function (e) {
            });
    });

    $("#geo2-data-button").off();
    $("#geo2-data-button").click(function () {
        var titleID = setup.settingPlot[plotID].titleID;
        var downloadURL = "https://cura-sco-dev.asc.ohio-state.edu/test/api/v1/geos/counties/csv/" + titleID
        fetch(downloadURL)
            .then(resp => resp.blob())
            .then(blob => {
                var url = window.URL.createObjectURL(blob);
                var a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = filename + '_counties.csv';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
            })
            .catch(function (e) {
            });
    });
}


function addDescText(gridID, settingGrid, settingPlot) {
    //add description text to card plots
    var gridHashID = "#" + gridID;
    var selectWidth = $(gridHashID).width() * 0.75;
    var gridWidth = $(gridHashID).width();
    var gridHeight = $(gridHashID).height();
    $(gridHashID).append('<div id="card-text-container_' + gridID + '"class = "card-text-container"; style="margin:20px 30px 0px 0px;" ></div>');

    var plotID;
    //if the current content of the grid is null or addButton, use goal_1_1 by default
    if (settingGrid.content == null ||
        settingGrid.content == 'addButton') {
        plotID = 'goal_1_1';
    } else {
        plotID = settingGrid.content;
    }

    $('#card-text-container_' + gridID).append('<textarea class = "card-text";  id="text_' + gridID + '" rows="5" >' +
        settingPlot[plotID].text + '</textarea>');
    $(gridHashID).append('<div id="legend-container-' + gridID + '" class = "legend-container" ></div>');
    $(".card-text").css({ 'width': gridWidth / 3.7, 'height': gridHeight / 3 });

    if (!document.getElementById("card-size-check").checked) {
        $(".card-text-container").css({ 'width': gridWidth / 3.7, 'height': gridHeight / 3, 'left': gridWidth * 2 / 3 });
        $(".legend-container").css({
            'width': gridWidth / 3.7, 'height': gridHeight / 2,
            'left': gridWidth * 2 / 3, 'top': gridHeight / 2 - 20, 'border-opacity': 0
        });
    } else {
        $(".card-text-container").css({ 'width': gridWidth / 3.7, 'height': gridHeight / 3, 'left': gridWidth });
        $(".legend-container").css({
            'width': gridWidth / 3.7, 'height': gridHeight / 2,
            'left': gridWidth, 'top': gridHeight / 2 - 20, 'border-opacity': 0
        });
    }

    $("#text_" + gridID).css({ 'width': gridWidth / 3.7 });
    $('.plot-select').css({ 'width': selectWidth });
}

function addDropdownMenu(gridID, def) {
    var titleID = gridID + '-title';
    var gridHashID = "#" + gridID;
    var titleDiv = document.getElementById(titleID);
    var selectList = document.createElement("select");

    selectList.id = gridID + "-select";
    selectList.className = "plot-select"

    titleDiv.appendChild(selectList);

    for (var j = 0; j < setup.groupNames.length; j++) {
        var gr = document.createElement('OPTGROUP');

        gr.label = setup.groupNames[j];
        for (var i = 0; i < setup.dpOptions[j].length; i++) {
            var option = document.createElement("option");
            option.value = setup.dpOptions[j][i];
            option.text = setup.dpOptions[j][i];
            option.id = setup.dpOptions[j][i].split(' ')[0].replace('.', '_');
            gr.appendChild(option);
            if (def == 1) {
                if (option.value.includes(setup.settingPlot[setup.stateVariables['cardPanel'][gridID].content].title)) {
                    option.selected = true;
                }
            }
        }
        selectList.appendChild(gr);
    }
    setup.selectList = selectList;
    $('#' + gridID + '-select').change(setup.plotSelectChangeHandler);
    return selectList;
}



function closeButtonClick(d) {
    var gridID = d.currentTarget.id.split('-')[0];
    var gridHashID = '#' + gridID;
    var idx = parseInt(gridID.split('_')[1]) - 1; //should be the index in grid item list
    for (var i = 0; i < setup.grid.container.context.childElementCount; i++) {
        if (setup.grid.container.context.childNodes[i.toString()].childNodes['0'].id == gridID) {
            idx = i;
        }
    }
    var x = parseInt(setup.grid.container.context.childNodes[idx.toString()].dataset['gsX']);
    var y = parseInt(setup.grid.container.context.childNodes[idx.toString()].dataset['gsY']);

    var gridstack = $('.grid-stack').data('gridstack');
    var grid = $(gridHashID);
    var el = $(gridHashID).closest('.grid-stack-item')
    gridstack.removeWidget(el);

    delete setup.stateVariables['cardPanel'][gridID];
    // update position of successor cards
    var numCard = setup.grid.container.context.childElementCount;
    for (var i = idx; i < numCard; i++) {
        var x_temp = setup.grid.container.context.childNodes[i.toString()].dataset['gsX'];
        var y_temp = setup.grid.container.context.childNodes[i.toString()].dataset['gsY'];
        setup.grid.move(setup.grid.container.context.childNodes[i.toString()], x, y);
        x = parseInt(x_temp);
        y = parseInt(y_temp);
    }
    setup.changeURL();
}

function addInfoButton(gridID) {
    var titleID = gridID + '-title';
    var titleHashID = '#' + titleID;
    var infoID = gridID + "-info";
    $(titleHashID).append('<i id="' + infoID + '" class="iconlink right fas fa-info"></i>');

    if (!document.getElementById('popup')) {
        $('body').append('<div id = "popup" ><div>')

        $('#popup').append('<div id = "popup_bar" ><div>');
        $('#popup').append('<div id = "popup-info-container"  ><div>');

        $('#popup-info-container').append('<p class = "card-popup-text" id="popup_text" >' + '</p>');
        $('#popup_bar').append('<a id = "popup-bar-title" >Information Card</a>');
        $('#popup_bar').append('<div id = "btn_close"  >X</div>');
        $('#popup').append('<div id="legend-container-info" style = "height:50%;  "></div>');
        var popup = document.getElementById("popup");
        var popup_bar = document.getElementById("popup_bar");
        var popup_text = document.getElementById('popup_text');
        var btn_close = document.getElementById("btn_close");

        // reset div position
        popup.style.top = "5px";
        popup.style.left = $(window).width() / 2 + "px";
        popup.style.width = $('#grid_1').width() + "px";
        popup.style.height = $('#grid_1').height() + "px";
        // popup.style.display = "block";
        popup.style.display = "none";

        //-- let the popup make draggable & movable.
        var offset = { x: 0, y: 0 };

        popup_bar.addEventListener('mousedown', mouseDown, false);
        window.addEventListener('mouseup', mouseUp, false);

        function mouseUp() {
            window.removeEventListener('mousemove', popupMove, true);
        }
        function mouseDown(e) {
            offset.x = e.clientX - popup.offsetLeft;
            offset.y = e.clientY - popup.offsetTop;
            window.addEventListener('mousemove', popupMove, true);
        }
        function popupMove(e) {
            popup.style.position = 'absolute';
            var top = e.clientY - offset.y;
            var left = e.clientX - offset.x;
            popup.style.top = top + 'px';
            popup.style.left = left + 'px';
        }
        btn_close.onclick = function (e) {
            popup.style.display = "none";
        }
    }

    // info button click event
    $("#" + infoID).on("click", infoButtonClick);
}

function infoButtonClick(d) {
    if (document.getElementById('info-legend-svg')) {
        $('#info-legend-svg').remove();
    }
    var gridID = d.currentTarget.id.split('-')[0];
    var plotContent = setup.stateVariables['cardPanel'][gridID].content;
    var popup = document.getElementById("popup");
    var popup_text = document.getElementById('popup_text');
    var popup_legend = document.getElementById('legend-container-info');
    popup.style.width = $('#grid_1').width() + "px";
    popup.style.height = $('#grid_1').height() + "px";
    popup_text.innerHTML = "\n" + setup.settingPlot[plotContent].text;

    var legendContainerID = 'legend-container-info';
    var plotSetting = setup.findPlotByID(plotContent);
    var plotType = plotSetting.atype;

    if (plotSetting.data.length != 1) {
        addInfoCardLegend(legendContainerID, plotSetting, gridID, plotType);
        popup_legend.style.display = "block";
    }
    popup.style.display = "block";
}



function addInfoCardLegend(legendContainerID, plotSetting, gridID, plotType) {
    /* legend area begins*/
    var legendData = [
        { 'x': 50, 'y': 50 }
    ];

    var svg = d3.select("#" + legendContainerID).append("svg")
        .attr("id", "info-legend-svg");

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
            addLegendLine('targetline', x1, y1, x2, y2);
            addLegendLine('baseline', x1, y1 + hDiff, x2, y2 + hDiff);
        } else {
            addLegendLine('baseline', x1, y1, x2, y2);
            addLegendLine('targetline', x1, y1 + hDiff, x2, y2 + hDiff);
        }
    } else if (targetlineExists) {
        addLegendLine('targetline', x1, y1, x2, y2);
    } else if (baselineExists) {
        addLegendLine('baseline', x1, y1, x2, y2);
    }

    // add symbols in the legend of info card
    addLegendSymInfoCard(gridID, plotType, legendData, x1, x2, y1, y2, hDiff, plotSetting);
}


function addLegendSymInfoCard(gridID, plotType, legendData, x1, x2, y1, y2, hDiff, plotSetting) {
    //add symbols in legend area
    var context = d3.select("#info-legend-svg").append("g")
        .attr("transform", "translate(0, 0)");
    var gridSeqID = gridID.split('_')[1] - 1;
    if (plotType == "line") {
        //add line path symbol in legend area
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
            .style("stroke", colorList[gridSeqID % colorList.length]);
        var legendCircle = [{ "x_axis": x1 + 10, "y_axis": y1 + 2 * hDiff, "radius": 4, "color": colorList[gridSeqID % colorList.length] }];
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
    } else if (plotType == 'bar') {
        //add bar symbol in legend area
        var cardLegendBar = context.selectAll("rect")
            .data(legendData)
            .enter().append("rect");
        var symbolAttr = cardLegendBar.attr('x', x1)
            .attr('y', y1 + 2 * hDiff - 7.5)
            .attr("height", 15)
            .attr("width", 20)
            .attr("class", 'legendRect')
            .style("fill", colorList[gridSeqID % colorList.length])
            .style("fill-opacity", 0.8);
        d3.select('#info-legend-svg').append("text")
            .attr("class", "legendText")
            .attr("x", x2 + 10)
            .attr("y", y1 + 2 * hDiff - 10)
            .attr("dy", "1em")
            // .text(this.plotSetting.title)
            .text('Region Level')
            .style("fill", "black");
    } else {
        // add legend for each of the stacked indicators
        legendData = [
            { key: 'att1', 'x': 50, 'y': 50 }
        ];
        var indicator, opacity, data;
        data = plotSetting.data;
        for (var i = 0; i < data.columns.length; i++) {
            opacity = (0.8 - 0.1 * i);
            context.append("g").attr("transform", "translate(0, 0)")
                .selectAll("rect")
                .data(legendData)
                .enter().append("rect")
                .attr('x', x1)
                .attr('y', y1 - 10 + (data.columns.length + 1 - i) * hDiff)// the last +1 is for the dynamic added legend line
                .attr("height", 15)
                .attr("width", 20)
                .attr("class", 'legendRect')
                .style("fill", colorList[gridSeqID % colorList.length])
                .style('fill-opacity', opacity);

            indicator = data.columns[i];
            d3.select('#info-legend-svg').append("text")
                .attr("id", "stack-legend-" + indicator)
                .attr("class", "legendText")
                .attr("x", x2 + 10)
                .attr("y", y2 - 10 + (data.columns.length + 1 - i) * hDiff)
                .attr("dy", "1em")
                .text(indicator)
                .style("fill", "black");
        }
    }
}

function addLegendLine(type, x1, y1, x2, y2) {
    var legendContainerIDHash = '#info-legend-svg';

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
