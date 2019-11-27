var uppsala = {lat: 59.85882, lng: 17.63889};
var markers = [null, null];

function createMarker(location) {
    var marker = new google.maps.Marker({
        position: location, 
        map: map
	});
	
    marker.addListener('click', function() {
        marker.setMap(null);
        if(marker === markers[0]) {
            markers[0] = null;
            document.getElementById('from-dest').value = "";
        } else {
            markers[1] = null;
            document.getElementById('to-dest').value = "";
        }
    });

    return marker;
}

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: uppsala,
        zoom: 15
    });

    geocoder = new google.maps.Geocoder;

    map.addListener('click', function(event) {
        placeMarker(geocoder, event.latLng);
	});
}

function placeMarker(geocoder, location) {
    var marker = createMarker(location);
    
    geocoder.geocode({'location': location}, function(results, status) {
        if(status === 'OK') {
            if(results[0]) {
                var locationName = results[0].address_components[1].short_name; 

                if(!markers[0]) {
                    document.getElementById('from-dest').value = locationName;
                } else {
                    document.getElementById('to-dest').value = locationName;
                }

                if(markers[0] && !markers[1]) {
                    markers[1] = marker;
                } else if(!markers[0]) {
                    markers[0] = marker;
                } else {
                    markers[1].setMap(null);
                    markers[1] = marker;
                }

            } else {
                // NO RESULTS FOUND  
            }
        } else {
            // STATUS NO BUENO
        }
    });
}

function formToMap(field) {
	if(field === 'to') {
		var address = document.getElementById('to-dest').value;
		geocoder.geocode({'address': address}, function(results, status) {
			if(status === 'OK') {
                var marker = createMarker(results[0].geometry.location);

                if(markers[1]) {
                    markers[1].setMap(null);
                }
                markers[1] = marker;
			}
		});
	} else if(field === 'from') {
        var address = document.getElementById('from-dest').value;
		geocoder.geocode({'address': address}, function(results, status) {
			if(status === 'OK') {
                var marker = createMarker(results[0].geometry.location);
                
                if(markers[0]) {
                    markers[0].setMap(null);
                }
                markers[0] = marker;
			}
		});
	} else {
		console.log('Else');
	}
}
