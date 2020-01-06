var uppsala = {lat: 59.85882, lng: 17.63889};
var markers = [null, null];
var geocoder = null;

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
            document.getElementById('fromcoords').value = "";
        } else {
            markers[1] = null;
            document.getElementById('to-dest').value = "";
            document.getElementById('tocoords').value = "";
        }
    });

    return marker;
}

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: uppsala,
        zoom: 10,
        streetViewControl: false,
        mapTypeControlOptions: {
            mapTypeIds: [google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.HYBRID]
        }
    });

    geocoder = new google.maps.Geocoder;

    map.addListener('click', function(event) {
        placeMarker(event.latLng);
	});
}

function showRoute(from, to, riders) {
    var directionsService = new google.maps.DirectionsService;
    var directionsRenderer = new google.maps.DirectionsRenderer;

    map = new google.maps.Map(document.getElementById('map'), {
        center: uppsala,
        zoom: 10,
        streetViewControl: false,
        mapTypeControlOptions: {
            mapTypeIds: [google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.HYBRID]
        }
    });

    var dataObject = JSON.parse(document.getElementById('dataobj').value);
    var from = {lat: dataObject.from_details[0].lat, lng: dataObject.from_details[0].lng};
    var to = {lat: dataObject.to_details[0].lat, lng: dataObject.to_details[0].lng};
    var waypoints = []

    if(dataObject.rider_trips) {
        for(var i = 0; i < dataObject.rider_trips.length; i++) {

            if(dataObject.confirmed_riders.includes(dataObject.rider_trips[i].username)) {
                waypoints.push({
                    location: {lat: dataObject.rider_trips[i].from_lat, lng: dataObject.rider_trips[i].from_lng},
                    stopover: true
                });
    
                waypoints.push({
                    location: {lat: dataObject.rider_trips[i].to_lat, lng: dataObject.rider_trips[i].to_lng},
                    stopover: true
                });
            }
            
        }
    }

    directionsRenderer.setMap(map);
    
    directionsService.route({
        origin: from,
        destination: to,
        waypoints: waypoints,
        optimizeWaypoints: true,
        travelMode: 'DRIVING'
    }, function(response, status) {
        if(status === 'OK') {
            directionsRenderer.setDirections(response);
        } else {
            window.alert('Directions request failed');
        }
    });
}

function placeMarker(location) {
    var marker = createMarker(location);
    
    geocoder.geocode({'location': location}, function(results, status) {
        if(status === 'OK') {
            if(results[0]) {
                var locationName = results[0].address_components[1].short_name; 

                if(!markers[0]) {
                    document.getElementById('fromcoords').value = JSON.stringify(results[0]);
                    document.getElementById('from-dest').value = locationName;
                } else {
                    document.getElementById('tocoords').value = JSON.stringify(results[0]);
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
        if(address) {
            geocoder.geocode({'address': address}, function(results, status) {
                if(status === 'OK') {
                    var marker = createMarker(results[0].geometry.location);
                    document.getElementById('tocoords').value = JSON.stringify(results[0]);

                    if(markers[1]) {
                        markers[1].setMap(null);
                    }
                    markers[1] = marker;
                }
            });
        } else {
            if(markers[1]) {
                markers[1].setMap(null);
                markers[1] = null
                document.getElementById('tocoords').value = "";
            }
        }
	} else if(field === 'from') {
        var address = document.getElementById('from-dest').value;
        if(address) {
            geocoder.geocode({'address': address}, function(results, status) {
                if(status === 'OK') {
                    var marker = createMarker(results[0].geometry.location);
                    document.getElementById('fromcoords').value = JSON.stringify(results[0]);
                    
                    if(markers[0]) {
                        markers[0].setMap(null);
                    }
                    markers[0] = marker;
                }
            });
        } else {
            if(markers[0]) {
                markers[0].setMap(null);
                markers[0] = null;
                document.getElementById('fromcoords').value = "";
            }
        }   
	} else {
		console.log('Else');
	}
}

function getUserLocation() {
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            if(markers[0]) {
                markers[0].setMap(null);
                markers[0] = null;
                document.getElementById('from-dest').value = "";
                document.getElementById('fromcoords').value = "";
            }
            placeMarker(pos);
        });
    }
}