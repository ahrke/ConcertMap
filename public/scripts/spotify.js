 import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_KEY } from '../../config';

// const request = require('request-promise-native');

// const KEY = process.env.SPOTIFY;

// const getGlassAnimalsPromise = () => {
//   return new Promise((res, rej) => {
//     request('https://api.spotify.com/v1/search?q=glass%20animals&type=artist')
//   })
// }

$.get( {
  url: 'https://api.spotify.com/v1/search?q=glass%20animals&type=artist',
  headers: {
    client_id: SPOTIFY_CLIENT_ID,
    client_ket: SPOTIFY_CLIENT_KEY,
    "Content-Type": 'application/json',
    "Accept": "application/json"
  }
})
  .done(res => {
    console.log(res)
    alert(res)
  })

// $(document).ready(function() {
//   alert("we ready!")
//   console.log("we're ready!")
// })

// KEY = ''BQApPUBOqcWZojXe39nTW0TLVBnFDFazge655ogxblBq3pUa8tVzm97qCZ0flvRiyB5aIrJnh-pUJTRfh8citB-AUWW-6-6IyhadO62oDnkDV-WDT-1X56mHKz_BsTFQVMF32kJwQr35a8gOSKFdfQP1qXAlAufC8KNB9FK4IyLJyw510CiTNfPwGf4i1KLlL1SzZJqpGzPqYuQ2zaNRiOJbOdO2GAsrWaGr_HT-0FFAhia8ITmSXGn_aLmjFWy6NEay9W2i5hODQ4crQR7Pd77OEFX8wA'
// https://api.spotify.com/v1/search?q=tania%20bowra&type=artist" -H "Accept: application/json" -H "Content-Type: application/json" -H "Authorization: Bearer BQApPUBOqcWZojXe39nTW0TLVBnFDFazge655ogxblBq3pUa8tVzm97qCZ0flvRiyB5aIrJnh-pUJTRfh8citB-AUWW-6-6IyhadO62oDnkDV-WDT-1X56mHKz_BsTFQVMF32kJwQr35a8gOSKFdfQP1qXAlAufC8KNB9FK4IyLJyw510CiTNfPwGf4i1KLlL1SzZJqpGzPqYuQ2zaNRiOJbOdO2GAsrWaGr_HT-0FFAhia8ITmSXGn_aLmjFWy6NEay9W2i5hODQ4crQR7Pd77OEFX8wA"
