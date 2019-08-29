import { LinkedMarkerMap, MarkerInfoWindow } from './map.js';
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
    marker.infoWindow.addListener('markerclick', (marker, containerNode, closeBtnNode) => {
      closeBtnNode.addEventListener('click', (evt) => {
        removeFromLink(marker);
      });
    });
  });

  map.addListener('markerclick', (marker, data) => {
    if (map.isMarkerLinked(marker)) return;
    const onPopupLoad = (marker, containerNode, closeBtnNode) => {
      const submitBtnNode = containerNode.querySelector('button');

      // popup discard
      closeBtnNode.addEventListener('click', (evt) => {
        prompt.close();
        removeFromLink(marker);
      });

      // popup save
      submitBtnNode.addEventListener('click', (evt) => {
        const data = containerNode.querySelector('textarea').value;
        prompt.close();
        marker.infoWindow.open(data);
        if (isMobileDevice()) map.setCenter(marker.getPosition());
      });
    };

    const addStopPopup = `<textarea class="stop-editor"></textarea><button type="button">Save</button>`;
    const prompt = new MarkerInfoWindow(marker);
    prompt.setClosable(true);
    prompt.addListener('markerclick', onPopupLoad);
    prompt.open(addStopPopup);
    if (isMobileDevice()) map.setCenter(marker.getPosition());

    if (!markerRoot) markerRoot = marker;

    if (markerRoot !== marker) {
      map.addLink(markerRoot, marker);
      markerRoot = marker;
    }
    map.selectMarker(markerRoot);
  });

  registerNewEventPopup(map);

  $(document).ready(() => {
    renderMarkers(window.embededData);
  });
};

const renderMarkers = (eventsRes) => {
  eventsRes.splice(50);
  for (let eventRes of eventsRes) {
    if (eventRes.latlng) {
      const marker = map.getNewMarker(eventRes.latlng[0], eventRes.latlng[1]);
      map.registerMarker(marker);
    }
  }
};

$(document).ready(() => {
  google.maps.event.addDomListener(window, 'load', onGMapLoad);
});
