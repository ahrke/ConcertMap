import { LinkedMarkerMap } from './map.js';

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

  map.addListener('markerclick', (marker, data) => {
    const editorContent = `<textarea class="stop-editor"></textarea><button type="button">Save</button>`;

    const listHasMarker = (n) => {
      if (!n) return false;
      if (n === marker) return true;
      return listHasMarker(n.prev);
    };

    if (listHasMarker(markerRoot)) return;
    if (!markerRoot) markerRoot = marker;

    if (markerRoot !== marker) {
      map.addLink(markerRoot, marker);
      markerRoot = marker;
    }
    map.selectMarker(markerRoot);
    markerRoot.infoWindow.open(editorContent);
  });

  map.addListener('markerdrop', (marker) => {
    const prompt = new MarkerInfoWindow(marker);

    const onPopupLoad = (marker, containerNode, closeBtnNode) => {
      const submitBtnNode = containerNode.querySelector('.custom-event-popup button');

      // popup discard
      closeBtnNode.addEventListener('click', (evt) => {
        map.removeMarker(marker);
        map.setCustomMarkers(true);
        prompt.close();
      });

      // popup save
      submitBtnNode.addEventListener('click', (evt) => {
        const data = Array.from(containerNode.querySelectorAll('input[type="text"]')).map(textNode => textNode.value);
        map.registerMarker(marker, data);
        map.setCustomMarkers(true);
        prompt.close();
      });

      map.setCustomMarkers(false);
    };

    const customEventPopup =
      `<table class="custom-event-popup">
      <tr><td>Who</td><td><input type="text"/></td></tr>
      <tr><td><label>Where</label></td><td><input type="text"/></td></tr>
      <tr><td><label>When</label></td><td><input type="text"/></td></tr>
      <tr><td colspan="2"><button type="button" style="display: block; margin: auto;">Save</button></td></tr>
    </table>`;
    prompt.setClosable(true);
    prompt.addListener('markerclick', onPopupLoad);
    prompt.open(customEventPopup);
  });

  $(document).ready(() => {
    renderMarkers(window.embededData);
  });
};

const renderMarkers = (eventsRes) => {
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
