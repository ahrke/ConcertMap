import { LinkedMarkerMap } from './map.js';
import { TripController } from './trip-controller.js';
import { registerNewEventPopup } from './popup.js';


const onGMapLoad = async () => {
  let map;
  let tripController;
  // const { coords } = await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res));
  window.map = map;
  map = new LinkedMarkerMap(document.querySelector('.gmap-container'), {
    // center: { lat: coords.latitude, lng: coords.longitude },
    center: { lat: 43.661539, lng: -79.411079 },
    mapTypeControlOptions: { mapTypeIds: [] },
    streetViewControl: false,
    zoom: 14
  });

  $(document).ready(() => {
    tripController = new TripController(map, window.embededData.trips, window.embededData.events, false);
    registerNewEventPopup(map);
  });
};

$(document).ready(() => {
  google.maps.event.addDomListener(window, 'load', onGMapLoad);
});
