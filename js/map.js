var map;
var marker;
var infowindow = null;

// Initial locations data
var locations = [
  {title:'Humble Administrator\'s Garden',
  location: {lat: 31.325573, lng: 120.631319},
  wiki: 'https://en.wikipedia.org/wiki/Humble_Administrator%27s_Garden',
  },
  {title:'Lingering Garden',
  location: {lat: 31.317994, lng: 120.597118},
  wiki: 'https://en.wikipedia.org/wiki/Lingering_Garden',
  },
  {title:'Lion Grove Garden',
  location: {lat:31.322151, lng: 120.630997},
  wiki: 'https://en.wikipedia.org/wiki/Lion_Grove_Garden',
  },
  {title:'Couple\'s Retreat Garden',
  location: {lat: 31.317424, lng: 120.640103},
  wiki: 'https://en.wikipedia.org/wiki/Couple%27s_Retreat_Garden',
  },
  {title:'Retreat & Reflection Garden',
  location: {lat: 31.159137, lng: 120.721853},
  wiki: 'https://en.wikipedia.org/wiki/Retreat_%26_Reflection_Garden',
  }
];

function initMap() {
    // Constructor creates a new map
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 31, lng: 120},
        zoom: 12
    });

    infowindow = new google.maps.InfoWindow();
    bounds = new google.maps.LatLngBounds();
    for (var i = 0; i<locations.length; i++) {
        var position = locations[i];

        marker = new google.maps.Marker({
            position: position.location,
            map: map,
            title: position.title,
            animation: google.maps.Animation.DROP
        });
        
        bounds.extend(marker.getPosition());
        attach(marker);
        position.marker = marker;
    }
    map.fitBounds(bounds);
    ko.applyBindings(new ViewModel());
}


function infoContent(marker, content) {
    var contentString = '<div>' + marker.title +'</div>'+
                        '<a href="https://en.wikipedia.org/w/index.php?title='+marker.title+'">'+
                        'https://en.wikipedia.org/w/index.php?title='+marker.title+'</a>'
    return contentString;
}

function attach(marker) {
    // add bounce animation
    marker.addListener('click', toggleBounce);

    function toggleBounce() {
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
            marker.setAnimation(null);
        }, 1400);
    }

    marker.addListener('click', loadData);

    // use wikipedia API
    function loadData() {
        var url = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' + marker.title+ '&format=json&callback=wikiCallback';
        $.ajax({
            url: url,
            dataType: 'jsonp',
            success: function(response){
                var contentString = infoContent(marker, response[2]);
                infowindow.setContent(contentString);
                infowindow.open(map, marker);
            },
            error: function(err) {
                alert('Failed to load. Please try again');
            }
        });
    }
}


var Place = function(data) {
    this.title = data.title;
    this.location = data.location;
};


var ViewModel = function() {
    var self = this;

    // locations list
    this.locationList = ko.observableArray(locations);

    var clickedPlace = locations.forEach(function(placeItem){
    });

    this.currentPlace = ko.observable(this.locationList());

    this.setPlace = function(clickedPlace) {
        self.currentPlace(clickedPlace);
        google.maps.event.trigger(clickedPlace.marker, 'click');
    };

    // search function
    self.query = ko.observable('');

    function searchFilter(search) {
        search = search.toLowerCase();
        var array = [];
        for (var i=0; i< locations.length; i++) {
            var position = locations[i];
            if (position.title.toLowerCase().includes(search)){
                array.push(position);
                position.marker.setVisible(true);
            } else {
                position.marker.setVisible(false);
            }
        }
        self.locationList(array);
    }
    self.query.subscribe(searchFilter);
};

function mapError() {
    alert('Oops, we cannot load the map!');
}
