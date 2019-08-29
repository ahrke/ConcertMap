import { MarkerInfoWindow } from './map.js';

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
};

export { registerNewEventPopup };
