function createCountyTooltips(layer){
/* 	var tooltip = L.tooltip(layer.feature.properties['NAME'], {
		permanent: true
	}); */
	layer.bindTooltip(layer.feature.properties["NAME"], {
		permanent: true,
		direction: "center",
	}).openTooltip();

}

function initCountyLabels(map){
	var markerStyle = {
		radius: 1,
		fillColor: "#000000",
		color: "#000000",
		weight: 1,
		opacity: 0,
		fillOpacity: 0
	};

	$.get(countyCentroidsURL, null, function (mapData) {
		countyLabelsLayer = L.geoJSON(mapData,{
			pointToLayer: function (feature, latlng) {
				return L.circleMarker(latlng, markerStyle);
			},
			onEachFeature: function (feature, layer) {
					createCountyTooltips(layer)
			}
		});
		let labelsOn = setup.stateVariables["sidebarPanel"]["Map Plot Control"].countyLabels;
		if( labelsOn ){
			countyLabelsLayer.addTo(map)
		}
	},'json');
}

function addCountyLabels(map){
	countyLabelsLayer.addTo(map);
}

function removeCountyLabels(map){
	countyLabelsLayer.removeFrom(map);
}