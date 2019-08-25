
const getArtistsInfo = async (artists, access_token) => {
  let artistsCollection = [];

  for (let artist of artists) {
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
    console.log(artistInfo.artists.items)
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

    artistsCollection.push(aObj);
  }

  return artistsCollection;
}

const artistsDisplay = (res) => {
  let artistCarouselItems = '';
  for (let artist of res) {
    artistCarouselItems += `
      <div class="carousel-item active">
        <div class='artist_container'>
          <img src="${artist.image640}">
          <div class="artist_info">
            <h1 class='artist_name'>${artist.name}</h1>
            <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Quo eius voluptates nulla recusandae eveniet quaerat ducimus? Mollitia sequi delectus eveniet, vel placeat autem dicta eligendi repudiandae labore laboriosam aut quod, nemo eaque quibusdam odit, rem ipsa. Obcaecati, ratione iure numquam quam aut nobis vel cum itaque reiciendis debitis dolore, inventore quod vero. Vel fugiat neque voluptates nobis officiis sapiente earum!</p>
            <iframe src="${artist.iframeUrl}" width="300" height="200" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>
          </div>
        </div>
      </div>
    `
  }

  document.querySelector("#artists").innerHTML += `
    <div id="carouselExampleControls" class="carousel slide" data-ride="carousel">
      <div class="carousel-inner">
        ${artistCarouselItems}
      </div>
      <a class="carousel-control-prev" href="#carouselExampleControls" role="button" data-slide="prev">
        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
        <span class="sr-only">Previous</span>
      </a>
      <a class="carousel-control-next" href="#carouselExampleControls" role="button" data-slide="next">
        <span class="carousel-control-next-icon" aria-hidden="true"></span>
        <span class="sr-only">Next</span>
      </a>
    </div>
   `
}
// $.get( {
//   url: 'https://api.spotify.com/v1/search?q=glass%20animals&type=artist',
//   headers: {
//     client_id: SPOTIFY_CLIENT_ID,
//     "Content-Type": 'application/json',
//     "Accept": "application/json"
//   }
// })
//   .done(res => {
//     console.log(res)
//     alert(res)
//   })

//       let a = resAlbums

//       $("#artistArea").css({ 'display' : 'block', 'flex' : 1 });
//       document.querySelector("#artists").innerHTML += `
//         <div class='artist_container'>
//           <img src="${artist.image640}">
//           <div class="artist_info">
//             <h1 class='artist_name'>${artist.name}</h1>
//             <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Quo eius voluptates nulla recusandae eveniet quaerat ducimus? Mollitia sequi delectus eveniet, vel placeat autem dicta eligendi repudiandae labore laboriosam aut quod, nemo eaque quibusdam odit, rem ipsa. Obcaecati, ratione iure numquam quam aut nobis vel cum itaque reiciendis debitis dolore, inventore quod vero. Vel fugiat neque voluptates nobis officiis sapiente earum!</p>
//             <iframe src="https://open.spotify.com/embed/album/${a.items[0].id}" width="300" height="200" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>
//           </div>
//         </div>
//         `
