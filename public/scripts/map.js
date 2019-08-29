/* eslint no-undef: 0 */
/* eslint no-unused-vars: 0 */
const redMarker = 'https://maps.google.com/mapfiles/ms/icons/red-dot.png';
const blueMarker = 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png';
const greenMarker = 'https://maps.google.com/mapfiles/ms/icons/green-dot.png';

const MarkerInfoWindow = function(marker, ...p) {
  this._marker = marker;
  this._uniqueId = MarkerInfoWindow.globalCount++;
  this._isClosable = true;
  google.maps.InfoWindow.call(this, ...p);

  this.addListener('domready', (evt) => {
    const containerNode = document.querySelector(`.marker-info-window-content[data-unique-id="${this._uniqueId}"]`);
    const closeBtnNode = containerNode.closest('div.gm-style-iw-c').querySelector('button[title="Close"]');
    if (!this._isClosable) {
      closeBtnNode.style.setProperty('visibility', 'hidden');
    } else {
      closeBtnNode.style.removeProperty('visibility');
    }
    google.maps.event.trigger(this, 'markerclick', this._marker, containerNode, closeBtnNode);
  });
};

MarkerInfoWindow.globalCount = 0;

MarkerInfoWindow.prototype = Object.create(google.maps.InfoWindow.prototype);

MarkerInfoWindow.prototype.setClosable = function(b) {
  this._isClosable = b;
};

MarkerInfoWindow.prototype.open = function(content) {
  const wrappedContent = `<div class="marker-info-window-content" data-unique-id="${this._uniqueId}">${content}</div>`;
  this.setContent(wrappedContent);
  google.maps.InfoWindow.prototype.open.call(this, this._marker.getMap(), this._marker);
};

const LinkedMarkerMap = function(mapNode, opts) {
  this.options = Object.assign({customMarkers: true}, opts);
  this._mapNode = mapNode;
  this.markers = [];
  this.selectedMarker = null;
  google.maps.Map.call(this, mapNode, this.options);

  // Event handlers

  const dropMarker = (latLng) => {
    // Drop marker on evt.latlng
    const marker = this.getNewMarker(latLng.lat(), latLng.lng(), greenMarker);
    marker.setAnimation(google.maps.Animation.DROP);
    marker.setDraggable(true);
    google.maps.event.trigger(this, 'markerdrop', marker);
  };

  const registerDropMarkerHandler = () => {
    let dropMarkerDate = null;
    const newMarkerControl = (() => {
      const wrapper = document.createElement('div');
      wrapper.innerHTML =
        `<div class="custom-marker-container">
         <img draggable="true" class="custom-marker-btn" src="https://maps.google.com/mapfiles/ms/icons/red-dot.png"/>
       </div>`;
      return wrapper.childNodes[0];
    })();

    this.addListener('mouseover', (evt) => {
      if (!this.options.customMarkers) return;
      const now = +new Date;
      if (now - dropMarkerDate < 3000) {
        dropMarkerDate = null;
        dropMarker(evt.latLng);
      }
    });

    this._mapNode.addEventListener('dragover', function(evt) {
      evt.preventDefault();
    });

    newMarkerControl.querySelector('.custom-marker-btn').addEventListener('dragend', function(evt) {
      dropMarkerDate = +new Date;
    });

    this.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(newMarkerControl);
  };

  const registerLongPressHandler = () => {
    let mPressDate = null;

    const onLongPress = (evt) => {
      if (!this.options.customMarkers) return;
      const now = +new Date;
      if (mPressDate && now - mPressDate > 300) {
        mPressDate = null;
        dropMarker(evt.latLng);
      }
    };

    this.addListener('mousedown', function() {
      mPressDate = +new Date;
    });
    this.addListener('drag', function() {
      mPressDate = null;
    });
    this.addListener('mouseover', onLongPress);
    this.addListener('mouseup', onLongPress);
  };

  registerDropMarkerHandler();

  registerLongPressHandler();
};

LinkedMarkerMap.prototype = Object.create(google.maps.Map.prototype);

LinkedMarkerMap.prototype.setCustomMarkers = function(isAllowed) {
  this.options.customMarkers = isAllowed;
  const newMarkerControl = this._mapNode.querySelector('.custom-marker-container');
  if (!isAllowed) {
    if (newMarkerControl) newMarkerControl.style.setProperty('visibility', 'hidden');
  } else {
    if (newMarkerControl) newMarkerControl.style.removeProperty('visibility');
  }
};

LinkedMarkerMap.prototype.selectMarker = function(marker) {
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

LinkedMarkerMap.prototype.filterMarker = function(opts) {
  for (let marker of this.markers) {
    const isFiltered = true;
    marker.setVisible(isFiltered);
  }
};

LinkedMarkerMap.prototype.getNewMarker = function(lat, lng, iconPath) {
  iconPath = iconPath ? iconPath : redMarker;
  const marker = new google.maps.Marker({ position: { lat, lng }, map: this, icon: { url: iconPath } });
  return marker;
};

LinkedMarkerMap.prototype.registerMarker = function(marker, data) {
  marker.addListener('click', evt => google.maps.event.trigger(this, 'markerclick', marker, data));
  marker.addListener('mouseover', evt => google.maps.event.trigger(this, 'markermouseover', marker, data));
  marker.addListener('mouseout', evt => google.maps.event.trigger(this, 'markermouseout', marker, data));
  marker.data = data;
  marker.infoWindow = new MarkerInfoWindow(marker);
  this.markers.push(marker);
  google.maps.event.trigger(this, 'markerregister', marker, data);
};

LinkedMarkerMap.prototype.removeMarker = function(marker) {
  for (let i in this.markers) {
    if (marker === this.markers[i]) {
      this.markers.splice(i, 1);
    }
  }
  this.removeMarkerLink(marker);
  marker.setMap(null);
};

LinkedMarkerMap.prototype.isMarkerLinked = (marker) => {
  return marker && (marker.prev || marker.next);
};

LinkedMarkerMap.prototype.removeMarkerLink = function(marker) {
  if (marker.nextLine) marker.nextLine.setMap(null);
  if (marker.prevLine) marker.prevLine.setMap(null);
  if (marker.next && marker.prev) this.addLink(marker.prev, marker.next);
  delete marker.nextLine;
  delete marker.prevLine;
  delete marker.next;
  delete marker.prev;
};

LinkedMarkerMap.prototype.addLink = function(marker1, marker2) {
  const lineSymbol = { path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW };
  const path = [marker1.position, marker2.position];
  const line = new google.maps.Polyline({
    path,
    map: this,
    icons: [{ icon: lineSymbol }],
  });
  marker1.nextLine = line;
  marker2.prevLine = line;
  marker1.next = marker2;
  marker2.prev = marker1;
};

export { LinkedMarkerMap, MarkerInfoWindow };
