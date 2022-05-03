var APIKEY = "AIzaSyAi2P_fe95Y9Ee4FvXtKErVt9OF_pfPGgs"
var params = window.location.search.split("&")
var query = params[0].split("=")[1]
var zipcode = params[1].split("=")[1]
// var query = JSON.parse(localStorage.getItem("query"))
// var food = query.cuisine.replace(" ", "+")
// var food_arr = food_unfiltered.split(" ")
// var restaurant = food

// Set on search bar
var map;
var geocoder;
var infowindow;


function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: -34.397, lng: 150.644 },
        zoom: 10,
    });
    geocoder = new google.maps.Geocoder();
    infowindow = new google.maps.InfoWindow();

    // geocodeLatLng(geocoder, map, infowindow);
    codeAddress(zipcode)
}

// Geocoding - Look up lat/long from address
function codeAddress(address) {
    geocoder.geocode({ 'address': address }, function (results, status) {
        if (status == 'OK') {
            map.setCenter(results[0].geometry.location);
            const search_coord = results[0].geometry.location
            nearbySearch(search_coord)
        } else {
            alert('Geocode was not successful for the following reason: ' + status);
        }
    });
}

var data

function nearbySearch(search_coord) {
    // Nearby Search
    const latlng = search_coord.lat() + "%2C" + search_coord.lng()
    const radius = 8000
    var URL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?keyword=" + query + "&location=" + latlng + "&radius=" + radius + "&type=restaurant&key=" + APIKEY

    // Custom Herouku app to get past CORS restriction
    // read more: https://stackoverflow.com/questions/47076743/cors-anywhere-herokuapp-com-not-working-503-what-else-can-i-try
    const proxyurl = "https://morning-escarpment-59145.herokuapp.com/" + URL;

    var config = {
        method: 'get',
        url: proxyurl,
        headers: {}
    };

    // IMPORTANT! DO NOT FORGET TO INCLUDE WITH AXIOS REQUESTS
    delete axios.defaults.headers.common["Authorization"];

    axios(config)
        .then(function (response) {
            data = response.data
            console.log(data.status + "| Results: " + data.results.length)

            if(data.status === "ZERO_RESULTS") {
                // TODO: Add Results not found part
            }
            console.log(data)

            fillSliders(data)
            $("#zipcode2").val(zipcode)
            $("#cuisine").val(query.replaceAll("+", " "))
        })
        .catch(function (error) {
            console.log(error);
        });
}

function addMarker(marker, i) {
    marker = new google.maps.Marker({
        position: data.results[i].geometry.location,
        map: map,
    });
    google.maps.event.addListener(marker, 'click', (function (marker) {
        return function () {
            infowindow.setContent((i + 1) + ". " + data.results[i].name + "<br>" + data.results[i].vicinity);
            infowindow.open(map, marker);
        }
    })(marker));
}

// TODO: Randomize recommendation outputs
function fillSliders(data) {
    var marker
    var iters = data.results.length

    if (data.results.length > 9) {
        iters = 9
    }

    // TODO: Implement dynamic adding to card sliders
    /*
    Slider Template
    - - - - - - - - -
    <div class="swiper-slide card">
        <div class="card-content" id="card-1">
            <div class="image">
                <img src="" alt="">
            </div>

            <div class="name-profession">
                <span class="name"></span>
                <span class="address"></span>
            </div>

            <div class="rating" id="rating-1">
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="far fa-star"></i>
                <i class="far fa-star"></i>
            </div>
        </div>
    </div>
    */

    for (let i = 0; i < iters; i++) {
        if (data.results[i].photos) {
            var reference = data.results[i].photos[0].photo_reference
            var src = "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=" + reference + "&key=" + APIKEY
            $('#card-' + i + ' .image img').attr("src", src)
        }
        else {
            $('#card-' + i + ' .image img').attr("src", "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/1665px-No-Image-Placeholder.svg.png")
        }

        $('#card-' + i + ' .name-profession .name').text(data.results[i].name)
        console.log(data.results[i].name)
        $('#card-' + i + ' .name-profession .address').text(data.results[i].vicinity)

        var rating = Math.floor(data.results[i].rating)

        // Star Rating Update
        for (let j = 0; j < 5; j++) {
            // console.log(j + " " + rating)
            if (j < rating) {
                $('#rating-' + i + ":nth-child(" + (j + 1) + ")").addClass("fas")
                $('#rating-' + i + ":nth-child(" + (j + 1) + ")").removeClass("far")
            }
            else {
                $('#rating-' + i + ":nth-child(" + (j + 1) + ")").addClass("far")
                $('#rating-' + i + ":nth-child(" + (j + 1) + ")").removeClass("fas")
            }
        }

        addMarker(marker, i)
    }
}






