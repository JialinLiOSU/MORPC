//*********************add these lines to index.html *************************/

//************************************************************************** */

$("#start-tutorial").click(tutorialHandle) //id of tutorial button

var tutorialList = []
tutorialList.push({
    "item": "sidebar-title",
    "intro": "Welcome to MORPC Regional Sustainability Dashboard! The Dashboard provides the most complete, accurate, and up-to-date representation of the region's sustainability goals, as defined in the Regional Sustainability Agenda, and serves as the official status report for progress toward those goals."
})
tutorialList.push({
    "item": "menu",
    "intro": "The Regional Sustainability Agenda is broken down into five goals.  Each goal has some objectives associated with it.  These objectives serve as measures of the sustainability of our region. Click the name of the goal to see the objectives associated with that goal."
})
tutorialList.push({
    "item": "grid_1",
    "intro": "Each objective is presented as a 'card' like this one.  Each card contains a description of the objective and a chart showing the current status of the objective as well as historical data. A target has been chosen for each objective, and the target value is included on the chart allowing you to see at a glance how well we are satisfying our sustainability goals."
})
tutorialList.push({
    "item": "grid_1-select",
    "intro": "You can customize which objective is displayed on a card by clicking the card title and choosing an objective from the drop-down menu."
})
tutorialList.push({
    "item": "grid_1-close-button",
    "intro": "You can remove cards by clicking the close button."
})
tutorialList.push({
    "item": "addButton",
    "intro": "You can add additional cards by clicking the New Card button."
})
tutorialList.push({
    "item": "plot-svg-grid_1",
    "intro": "The data in the charts represents the MORPC region as a whole. When you hover over a data point in the charts, circles appear on the map showing the data for each county at that point in time.  The circles will disappear when your mouse moves away from the data point.  If you click on the data point, the circles will remain on the map until you click elsewhere."
})
tutorialList.push({
    "item": "options-sidebar-button",
    "intro": "The sidebar provides access to several customization options. To see them, click the Options menu to expand it."
})
tutorialList.push({
    "item": "card-size-switch",
    "intro": "For example, this switch allows you to display the cards in a more compact format. Click Next to see the result."
})
tutorialList.push({
    "item": "grid_2",
    "intro": "Notice how the text and legend are hidden, allowing more cards to fit on the screen. Click Next to reset the cards and continue."
})
tutorialList.push({
    "item": "sidebar-close-button",
    "intro": "You can also hide the sidebar."
})
tutorialList.push({
    "item": "mini",
    "intro": "Click this button to make the sidebar visible again."
})
tutorialList.push({
    "item": "about",
    "intro": "That's the end of the tutorial! Click the About menu to learn more about the Dashboard and why it was created, or feel free to just look around."
})

function tutorialHandle() {

	setup.stateVariables['tutorial'].isActive = true;
    setup.changeURL();

    for (var zz = 0; zz < tutorialList.length; zz++) {
        var item, intro;
        item = tutorialList[zz].item;
        intro = tutorialList[zz].intro;
        console.log(item)
        document.getElementById(item).setAttribute("data-step", (zz + 1).toString());
        document.getElementById(item).setAttribute("data-intro", intro);
        if(item !== 'sidebar-title'){
            document.getElementById(item).setAttribute("data-position", "auto");
        } else{
            document.getElementById(item).setAttribute("data-position", "right");
        }
        
    }

    introJs().setOptions({ 'exitOnOverlayClick': false, 'showStepNumbers': false, 'overlayOpacity' : 0.3 }).onbeforechange(function (targetElement) {
		var scrollDist = $(document).width() / 4 + 30;
        switch (targetElement.getAttribute("id")) {
            case "options-sidebar-button":
                    $("#options-sidebar-button").trigger("click");
					break;
            case "grid_2":
                    $("#options-sidebar-button").trigger("click");
                    $("#card-size-check").trigger("click");
					break;
            case "sidebar-close-button":
                    $("#card-size-check").trigger("click");
					break;
			case "mini":
                    $("#sidebar-close-button").trigger("click");					
					break;
			case "about":
					$("#mini").trigger("click");										
                    break;
            // case "accu1-container":
                // simpleBar.scrollContentEl.scrollTop = scrollDist;
                // break;
            // case "wave1-container":
                // simpleBar.scrollContentEl.scrollTop = scrollDist * 2;
                // break;
            // case "time1-container":
                // simpleBar.scrollContentEl.scrollTop = scrollDist * 3;
                // break;
            // case "time2-container":
                // simpleBar.scrollContentEl.scrollTop = scrollDist * 3;
                // break;
            // case "time3-container":
                // simpleBar.scrollContentEl.scrollTop = scrollDist * 3;
                // break;
            // case "side-bar":
                // if (sideBarStatus != 1) {
                    // $("#mini").trigger("click");
                // }
                // break;
            // case "outcomes-container":
                // if (sideBarStatus != 1) {
                    // $("#mini").trigger("click");
                // }
                // if ($("#outcomes-button")[0].className == "collapsible") {
                    // $("#outcomes-button").trigger("click");
                // }
                // break;
            // case "census-container":
                // if (sideBarStatus != 1) {
                    // $("#mini").trigger("click");
                // }
                // if ($("#census-button")[0].className == "collapsible") {
                    // $("#census-button").trigger("click");
                // }
                // break;
            // case "predictive-health-container":
                // if (sideBarStatus != 1) {
                    // $("#mini").trigger("click");
                // }
                // if ($("#predictive-health-button")[0].className == "collapsible") {
                    // $("#predictive-health-button").trigger("click");
                // }
                // sideBar.scrollContentEl.scrollTop = 15000;
                // break;
            // case "overlay-reference-container":
                // if (sideBarStatus != 1) {
                    // $("#mini").trigger("click");
                // }
                // if ($("#overlay-reference-button")[0].className == "collapsible") {
                    // $("#overlay-reference-button").trigger("click");
                // }
                // sideBar.scrollContentEl.scrollTop = 15000;
                // break;
            // case "layer-query-container":
                // if (sideBarStatus != 1) {
                    // $("#mini").trigger("click");
                // }
                // if ($("#layer-query-button")[0].className == "collapsible") {
                    // $("#layer-query-button").trigger("click");
                // }
                // sideBar.scrollContentEl.scrollTop = 15000;
                // break;
            // case "query-container":
                // if (sideBarStatus != 1) {
                    // $("#mini").trigger("click");
                // }
                // if ($("#layer-query-button")[0].className == "collapsible") {
                    // $("#layer-query-button").trigger("click");
                // }
                // sideBar.scrollContentEl.scrollTop = 15000;
                // break;				
        }
	}).onexit(function() {
		setup.stateVariables['tutorial'].isActive = false;
		setup.changeURL();
	}).start();
}