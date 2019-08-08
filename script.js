var lastModifiedDateRetrieved;
var deliveryUrl;

$.urlParam = function(name) {
    var results = new RegExp('[\?&]' + name + '=([^&#]*)')
        .exec(window.location.search);

    return (results !== null) ? results[1] || 0 : false;
}

function checkLastModifiedDate() {
    hideAlert();
    $.ajax({
        type: "GET",
        url: deliveryUrl + "&limit=1&elements=title",
        dataType: "json",
        success: actOnDateCheck,
        error: function() {
            showAlert("JSON call to CaaS failed - modification check");
        }
    });
}

function showAlert(message) {
    $(".alert-bottom").html(message);
    $(".alert-bottom").show();
}

function hideAlert() {
    $(".alert-bottom").hide();
}

function actOnDateCheck(data) {
    var lastModifiedDate = data.items[0].system.last_modified;
    console.log("Last modification date from KC: " + lastModifiedDate);
    if (lastModifiedDateRetrieved !== lastModifiedDate) {
        getNewSlides();
        lastModifiedDateRetrieved = lastModifiedDate;
    }
}

function getNewSlides() {
    $.ajax({
        type: "GET",
        url: deliveryUrl + "&limit=5",
        dataType: "json",
        success: processData,
        error: function() {
            showAlert("JSON call to CaaS failed - retrieve slides");
        }
    });
}

// Process the retrieved data. 
function processData(data) {
    console.log("Retrieved data from KC");
    console.log(data);

    var slideIndex = 0;

    resetCarousel();

    data.items.map(function(item) {
        $(createSlide(item)).appendTo('.carousel-inner');
        $(createIndicator(slideIndex)).appendTo('.carousel-indicators');
        slideIndex++;
    });

    $('.carousel-item').first().addClass('active');
    $('.carousel-indicators > li').first().addClass('active');
    $('#carouselSlideContainer').carousel('cycle');
}

function resetCarousel() {
    $('.carousel-item').remove();
    $('.carousel-indicators > li').remove();
    $('#carouselSlideContainer').carousel('dispose');
}

function createSlide(item) {
    var carouselItem = '<div class="carousel-item" style="background-image: url(\'' + item.elements.slide_image.value[0].url + '\')">' +
        '<div class="carousel-caption d-md-block">' +
        '<h2 class="display-4">' + item.elements.title.value + '</h2>' +
        item.elements.description.value +
        '</div>' +
        '</div>';
    return carouselItem;
}

function createIndicator(index) {
    var indicatorItem = '<li data-target="#carouselSlideContainer" data-slide-to="' + index + '"></li>'
    return indicatorItem;
}

function setDeliveryUrl() {
    var adTag = $.urlParam("tag");
    if (!adTag) {
        adTag = "lamington";
    }

    deliveryUrl = "https://deliver.kenticocloud.com/1c7a9e17-7ff3-0235-eb49-1d37c47ae828/items/?system.type=display_ad&order=system.last_modified[desc]&elements.display_ad_tag[contains]=" + adTag;
}

setDeliveryUrl();
checkLastModifiedDate();

var intervalMins = 2;
var intervalMilliSeconds = 1000 * 60 * intervalMins;
setInterval(checkLastModifiedDate, intervalMilliSeconds);