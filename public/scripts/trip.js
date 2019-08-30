import { LinkedMarkerMap, MarkerInfoWindow, redMarker, greenMarker } from './map.js';
import { registerNewEventPopup, isMobileDevice } from './popup.js';

const markerHist = [];
let map;
let markerRoot;

const onGMapLoad = async () => {
  // const { coords } = await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res));
  window.map = map;
  map = new LinkedMarkerMap(document.querySelector('.gmap-container'), {
    // center: { lat: coords.latitude, lng: coords.longitude },
    center: { lat: 43.661539, lng: -79.411079 },
    zoom: 14
  });

  const removeFromLink = (marker) => {
    if (marker === markerRoot) {
      markerRoot = marker.prev;
      map.selectMarker(markerRoot);
    }
    map.removeMarkerLink(marker);
  };

  map.addListener('markerregister', (marker, data) => {
    marker.infoWindow.setClosable(false);
  });

  map.addListener('markermouseover', (marker, data) => {
    marker.infoWindow.open(`${data.name}`);
  });

  map.addListener('markermouseout', (marker, data) => {
    marker.infoWindow.close();
  });

  map.addListener('markerclick', (marker, event) => {
    if (marker.prompt) return;
    if (map.isMarkerLinked(marker)) return;
    if (!markerRoot) markerRoot = marker;

    if (markerRoot !== marker) {
      map.addLink(markerRoot, marker);
      markerRoot = marker;
    }
    map.selectMarker(markerRoot);

    // Create a popup to get input
    const onPopupLoad = (marker, containerNode, closeBtnNode) => {
      const submitBtnNode = containerNode.querySelector('button');

      // popup discard
      closeBtnNode.addEventListener('click', (evt) => {
        delete marker.prompt;
        removeFromLink(marker);
      });

      // popup save
      submitBtnNode.addEventListener('click', (evt) => {
        const description = containerNode.querySelector('textarea').value;
        prompt.close();
        delete marker.prompt;
        // Send data to server
        const stop = {

        };
        // Create new floating stop description popup
        marker.stopWindow = new MarkerInfoWindow(marker);
        marker.stopWindow.addListener('markerclick', (marker, containerNode, closeBtnNode) => {
          closeBtnNode.addEventListener('click', () => removeFromLink(marker));
        });
        marker.stopWindow.open(description);
      });
    };

    const addStopPopup = `<div class="edit-stop-popup form-group">
                            <textarea class="stop-editor form-control" placeholder="Description"></textarea>
                            <button type="button" class="form-control btn btn-primary">Save</button>
                          </div>`;
    const prompt = new MarkerInfoWindow(marker);
    prompt.setClosable(true);
    prompt.addListener('markerclick', onPopupLoad);
    marker.infoWindow.close();
    prompt.open(addStopPopup);
    marker.prompt = prompt;
    if (isMobileDevice()) map.setCenter(marker.getPosition());
  });

  registerNewEventPopup(map);

  $(document).ready(() => {
    renderMarkers(window.embededData.events);
    console.log(window.embededData.trips);
  });
};

const renderMarkers = (events) => {
  for (let event of events) {
    if (event.latlng) {
      const icon = event.id[0] === 'c' ? greenMarker : redMarker;
      const marker = map.getNewMarker(event.latlng[0], event.latlng[1], icon);
      map.registerMarker(marker, event);
    }
  }
};

$(document).ready(() => {
  google.maps.event.addDomListener(window, 'load', onGMapLoad);
});
