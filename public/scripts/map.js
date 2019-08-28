/* eslint no-undef: 0 */
/* eslint no-unused-vars: 0 */
const redMarker = 'https://maps.google.com/mapfiles/ms/icons/red-dot.png';
const blueMarker = 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png';
const greenMarker = 'https://maps.google.com/mapfiles/ms/icons/green-dot.png';

const ConcertMap = function(mapNode, ...p) {
  google.maps.Map.call(this, mapNode, ...p);
  this.popup = new google.maps.InfoWindow();
  this.lines = [];
  this.markers = [];
  this.selectedMarker = null;

  // Event handlers

  const onPopupDiscard = (evt) => {
    if (customMarkerNode) {
      customMarkerNode.classList.remove('disabled');
    }
    popup.isVisible = false;
    popup.marker.setMap(null);
    delete popup.marker;
  };

  const onPopupSave = (evt) => {
    if (customMarkerNode) {
      customMarkerNode.classList.remove('disabled');
    }
    const popupNode = document.querySelector('.custom-event-popup');
    const data = Array.from(popupNode.querySelectorAll('input[type="text"]')).map(textNode => textNode.value);
    popup.close();
    popup.isVisible = false;
    popup.marker.setAnimation(null);
    this.registerMarker(popup.marker, data);
    delete popup.marker;
  };

  const onPopupLoad = (evt) => {
    document.querySelector('.gm-ui-hover-effect').addEventListener('click', onPopupDiscard);
    const popupNode = document.querySelector('.custom-event-popup');
    const submitBtnNode = popupNode.querySelector('button');
    submitBtnNode.addEventListener('click', onPopupSave);
  };

  const onPopupShow = (evt) => {
    if (customMarkerNode) {
      customMarkerNode.classList.add('disabled');
    }
    const marker = getMarker(evt.latLng.lat(), evt.latLng.lng(), greenMarker);
    marker.setAnimation(google.maps.Animation.DROP);
    marker.setDraggable(true);
    const cusEventPopup =
      `<table class="custom-event-popup">
      <tr><td>Who</td><td><input type="text"/></td></tr>
      <tr><td><label>Where</label></td><td><input type="text"/></td></tr>
      <tr><td><label>When</label></td><td><input type="text"/></td></tr>
      <tr><td colspan="2"><button type="button" style="display: block; margin: auto;">Save</button></td></tr>
    </table>`;
    popup.setContent(cusEventPopup);
    popup.open(map, marker);
    popup.marker = marker;
    popup.isVisible = true;
    popup.addListener('domready', onPopupLoad);
  };

  const registerDropMarkerHandler = () => {
    const map = this;
    let dropMarkerDate = null;
    const customMarkerNode = (() => {
      const wrapper = document.createElement('div');
      wrapper.innerHTML =
        `<div class="custom-marker-container">
         <img draggable="true" class="custom-marker-btn" src="https://maps.google.com/mapfiles/ms/icons/red-dot.png"/>
       </div>`;
      return wrapper.childNodes[0];
    })();

    map.addListener('mouseover', (evt) => {
      const now = +new Date;
      if (now - dropMarkerDate < 3000) {
        dropMarkerDate = null;
        onPopupShow.call(this, evt);
      }
    });

    mapNode.addEventListener('dragover', function(evt) {
      evt.preventDefault();
    });

    customMarkerNode.querySelector('.custom-marker-btn').addEventListener('dragend', function(evt) {
      dropMarkerDate = +new Date;
    });

    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(customMarkerNode);
  };

  const registerLongClickHandler = () => {
    const map = this;
    let mPressDate = null;

    const onLongPress = (evt) => {
      const now = +new Date;
      if (!this.popup.isVisible && mPressDate && now - mPressDate > 300) {
        mPressDate = null;
        onPopupShow.call(this, evt);
      }
    };

    map.addListener('mousedown', function() {
      mPressDate = +new Date;
    });
    map.addListener('drag', function() {
      mPressDate = null;
    });
    map.addListener('mouseover', onLongPress);
    map.addListener('mouseup', onLongPress);
  };

  registerDropMarkerHandler();

  registerLongClickHandler();
};

ConcertMap.prototype = Object.create(google.maps.Map.prototype);

ConcertMap.prototype.selectMarker = function(marker) {
  if (marker === this.selectedMarker) return;

  if (this.selectedMarker) {
    this.selectedMarker.setAnimation(null);
    google.maps.event.trigger(this, 'markerdeselect', this.selectedMarker);
  }

  this.selectedMarker = marker;

  if (marker) {
    marker.setAnimation(google.maps.Animation.BOUNCE);
    google.maps.event.trigger(this, 'markerselect', marker);
  }
};

ConcertMap.prototype.filterMarker = function(opts) {
  // for (let marker of markers) {

  // }
};

ConcertMap.prototype.registerMarker = function(marker, data) {
  const onMarkerClick = (evt, marker, data) => {
    google.maps.event.trigger(this, 'markerclick', marker, data);
  };

  const onMarkerMouseOver = (evt, marker, data) => {
    if (!this.selectedMarker) {
      this.selectMarker(marker);
    }
    google.maps.event.trigger(this, 'markermouseover', marker, data);
  };

  const onMarkerMouseOut = (evt, marker, data) => {
    if (this.selectedMarker) {
      this.selectMarker(null);
    }
    google.maps.event.trigger(this, 'markermouseout', marker, data);
  };

  marker.addListener('click', evt => onMarkerClick(evt, marker, data));
  marker.addListener('mouseover', evt => onMarkerMouseOver(evt, marker, data));
  marker.addListener('mouseout', evt => onMarkerMouseOut(evt, marker, data));
  this.markers.push(marker);
  google.maps.event.trigger(this, 'markerregister', marker, data);
};

ConcertMap.prototype.getMarker = function(lat, lng, iconPath) {
  iconPath = iconPath ? iconPath : redMarker;
  return new google.maps.Marker({ position: { lat, lng }, map: this, icon: { url: iconPath } });
};

ConcertMap.prototype.addStop = function(lat, lng, data, iconPath) {
  const marker = getMarker(lat, lng, iconPath);
  registerMarker(marker, data);
  if (markers.length >= 2) {
    const lineSymbol = { path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW };
    const path = [markers[markers.length - 2].position, markers[markers.length - 1].position];
    const line = new google.maps.Polyline({
      path,
      map,
      icons: [{ icon: lineSymbol }],
    });
  }
  return marker;
};

export { ConcertMap, redMarker, blueMarker, greenMarker };
