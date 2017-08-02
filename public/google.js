var map;
var infowindow;
var geocoder;
var config = {
    apiKey: "AIzaSyCOt7IjXqoZxNQefdDheaxQb-aNxCs1HFc",
    authDomain: "fir-ex-22c1a.firebaseapp.com",
    databaseURL: "https://fir-ex-22c1a.firebaseio.com/",
  };
  function retrieve(){
      var database = firebase.database()
      database.ref('location/').once('value').then(
      function(val){
      display(val.val())
      })
  }
  firebase.initializeApp(config);
 function initMap() {
        navigator.geolocation.getCurrentPosition(function(location){
       var uluru = {lat: location.coords.latitude, lng: location.coords.longitude};
        map = new google.maps.Map(document.getElementById('map'), {
          center: uluru,
          zoom: 18,
          mapTypeId: google.maps.MapTypeId.HYBRID,
        });
        var mark = new google.maps.Marker({
          position: uluru,
          map: map,
        //   place: {
        // placeId: 'ChIJhV_ymRRgwokRFCO8ZsIYFIc',
        //   }
          draggable: false,
          setTilt:50
        });
        mark.setAnimation(google.maps.Animation.BOUNCE);

        retrieve(geocoder,map,infowindow);
        var card = document.getElementById('pac-card');
        var input = document.getElementById('pac-input');
        var types = document.getElementById('type-selector');
        var strictBounds = document.getElementById('strict-bounds-selector');

        map.controls[google.maps.ControlPosition.TOP_RIGHT].push(card);

        var autocomplete = new google.maps.places.Autocomplete(input);

        // Bind the map's bounds (viewport) property to the autocomplete object,
        // so that the autocomplete requests use the current map bounds for the
        // bounds option in the request.
        autocomplete.bindTo('bounds', map);

        infowindow = new google.maps.InfoWindow();
        geocoder = new google.maps.Geocoder;
        var infowindowContent = document.getElementById('infowindow-content');
        infowindow.setContent(infowindowContent);
        var marker = new google.maps.Marker({
          map: map,
          anchorPoint: new google.maps.Point(0, -29)
        });
        // marker.setAnimation(google.maps.Animation.BOUNCE);
        autocomplete.addListener('place_changed', function() {
          infowindow.close();
          marker.setVisible(false);
          var place = autocomplete.getPlace();
                if(place){
                    var data =[];
                    var database = firebase.database()
                    database.ref('location/').push({
                        address:place.formatted_address,
                        placeID:place.place_id,
                        latitude:place.geometry.location.lat(),
                        longitude:place.geometry.location.lng(),
                    })
                    database.ref('location/').once('value').then(
                    function(val){
                    display(val.val())
                    })
                }

          if (!place.geometry) {
            // User entered the name of a Place that was not suggested and
            // pressed the Enter key, or the Place Details request failed.
            window.alert("No details available for input: '" + place.name + "'");
            return;
          }

          // If the place has a geometry, then present it on a map.
          if (place.geometry.viewport) {
            map.fitBounds(place.geometry.viewport);
          } else {
            map.setCenter(place.geometry.location);
            map.setZoom(17);  // Why 17? Because it looks good.
          }
          marker.setPosition(place.geometry.location);
          marker.setVisible(true);

          var address = '';
          if (place.address_components) {
            address = [
              (place.address_components[0] && place.address_components[0].short_name || ''),
              (place.address_components[1] && place.address_components[1].short_name || ''),
              (place.address_components[2] && place.address_components[2].short_name || '')
            ].join(' ');
          }

          infowindowContent.children['place-icon'].src = place.icon;
          infowindowContent.children['place-name'].textContent = place.name;
          infowindowContent.children['place-address'].textContent = address;
          infowindow.open(map, marker);
        });

        // Sets a listener on a radio button to change the filter type on Places
        // Autocomplete.
        function setupClickListener(id, types) {
          var radioButton = document.getElementById(id);
          radioButton.addEventListener('click', function() {
            autocomplete.setTypes(types);
          });
        }

        setupClickListener('changetype-all', []);
        setupClickListener('changetype-address', ['address']);
        setupClickListener('changetype-establishment', ['establishment']);
        setupClickListener('changetype-geocode', ['geocode']);

        document.getElementById('use-strict-bounds')
            .addEventListener('click', function() {
              console.log('Checkbox clicked! New state=' + this.checked);
              autocomplete.setOptions({strictBounds: this.checked});
            });
        })
      }


function display(details){
  data = true;
  $('.searches').html('');
  for(var i in details){
    var a = '<div class="row"><h4 class="col-md-9 col-sm-9 col-9">'+details[i].address+'</h4>'+'<button class="locate btn btn-primary col-md-2 col-sm-2 col-2">Locate</button></div>'
    $('.searches').append(a)
  }
    $('.locate').on('click',function(){
      for(var i in details){
        if(details[i].address == $(this).siblings()[0].innerHTML){
          console.log(details[i].placeID)
           var placeId = details[i].placeID;
          geocoder.geocode({'placeId': placeId}, function(results, status) {
          if (status === 'OK') {
            if (results[0]) {
              map.setZoom(18);
              map.setCenter(results[0].geometry.location);
              var marker = new google.maps.Marker({
                map: map,
                position: results[0].geometry.location
              });
              infowindow.setContent(results[0].formatted_address);
              infowindow.open(map, marker);
            } else {
              window.alert('No results found');
            }
          } else {
            window.alert('Geocoder failed due to: ' + status);
          }
        });
        }
      }
    })
  // console.log(map)
}

