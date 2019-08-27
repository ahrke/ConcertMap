
const getArtistsInfo = async (artists, access_token) => {
  let artistsCollection = {};

  for (let a of artists) {

    let venueArtists = [];

    for (let artist of a.artists) {
      let aObj = {};

      // Search for artist in spotify database
      let artistInfo = await $.ajax({
        url: "https://api.spotify.com/v1/search?q=" + artist + "&type=artist",
        type: "GET",
        headers: {
          "Authorization": "Bearer " + access_token
        }
      })

      // Create an object to hold artist information
      if (artistInfo.artists.items.length === 0) {
        continue;
      }
      let a = artistInfo.artists.items[0];
      aObj.name = a.name || 0;
      aObj.href = a.href || 0;
      aObj.id = a.id || 0;
      if(a.images[0]) {
        aObj.image640 = a.images[0].url;
      }

      let albumUrl = `https://api.spotify.com/v1/artists/${a.id}/albums?market=ES&limit=2`
      let albumInfo = await $.ajax({
        url: albumUrl,
        type: "GET",
        headers: {
          "Authorization": "Bearer " + access_token
        }
      })

      aObj.iframeUrl = `https://open.spotify.com/embed/album/${albumInfo.items[0].id}`

      venueArtists.push(aObj);
    }
    artistsCollection[a.id] = venueArtists;
  }

  console.log(artistsCollection)
  return artistsCollection;
}

const artistDisplay = (artist) => {
  document.querySelector("#artists").innerHTML = ''
  document.querySelector("#artists").innerHTML += `
    <div class='artist_container'>
      <img src="${artist.image640}">
      <h1 class='artist_name'>${artist.name}</h1>

      <iframe src="${artist.iframeUrl}" width="300" height="100%" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>
    </div>
  `
}

const artistsDisplay = (res) => {
  let artistCarouselItems = '';
  document.querySelector("#artists").innerHTML += `
    <div class='artist_container'>
      <img src="${res[3].image640}">
      <div class="artist_info">
        <h1 class='artist_name'>${res[3].name}</h1>

        <iframe src="${res[3].iframeUrl}" width="300" height="600" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>
      </div>
    </div>
  `
}


