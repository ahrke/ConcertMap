// const { SPOTIFY } = process.env.SPOTIFY;

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
    Authorization: 'Bearer BQDlAu2Mcr38b8HrmSwHS8tYuH29Dso-wMSWvi6bAiUPfn9jVnrQmNeTyldH-dVj_UGUGnw80UMbyUnDJ2cVCdWe_PH6i3CTn4t_3z9oTnLK5aAjHtmwF7fFamOdRwpU0raDjgn8eBClwDdk8_N2kP_4qpVZKu06WEXwyP4MPbq6AGxy-KoqnF5SCSnuxzmdFyzUC4cY5cfNs0yJKftHQYUaERnTxBfnZBDMug1g-oJkAvlkdI3xl0Xu7ZH3ttAH459QaPXUqYB8QFpj-tRaf3Rw5tEJ1w',
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
