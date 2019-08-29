import { MarkerInfoWindow } from './map.js';
import { postObj } from './api.js';

function isMobileDevice() {
  return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
};

const registerNewEventPopup = (map) => {
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
      submitBtnNode.addEventListener('click', async(evt) => {
        const data = {};
        containerNode.querySelectorAll('input[type="text"], input[type="date"], textarea').forEach(n => {
          data[n.getAttribute('name')] = n.value;
        });
        const pos = marker.getPosition();
        data.latlng = [pos.lat(), pos.lng()];
        map.registerMarker(marker, data);
        map.setCustomMarkers(true);
        prompt.close();
        console.log(data);
        await postObj('/users/customEvent', data);
      });

      map.setCustomMarkers(false);
    };

    const customEventPopup =
      `<div class="custom-event-popup form-group">
        <input type="text" name="name" class="form-control" placeholder="Event Name" />
        <input type="text" name="venue" class="form-control" placeholder="Location Name" />
        <input type="date" name="start_date" class="form-control" />
        <textarea name="description" class="form-control" placeholder="Description"></textarea>
        <button type="button" class="form-control btn btn-primary" style="display: block; margin: auto;">Save</button>
       </div>`;
    prompt.setClosable(true);
    prompt.addListener('markerclick', onPopupLoad);
    prompt.open(customEventPopup);
    if (isMobileDevice()) map.setCenter(marker.getPosition());
  });
};

export { registerNewEventPopup, isMobileDevice };
