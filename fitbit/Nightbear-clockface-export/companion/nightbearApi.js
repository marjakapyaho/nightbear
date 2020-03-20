const BEAR_ENTRIES_URL = 'https://router.nightbear.fi/legacy-api/entries?hours=3'
const BEAR_STATUS_URL = 'https://router.nightbear.fi/legacy-api/v1/status'

export function NightbearApi() {
  console.log('API: created NightbearApi')
}

NightbearApi.prototype.getBloodSugars = function() {
  return new Promise(function(resolve, reject) {
    fetch(BEAR_ENTRIES_URL).then(function(response) {
      return response.json();
    }).then(function(json) {
      console.log("API: got entries from server with length: " + json.length)
      resolve(json);
    }).catch(function (error) {
      reject(error);
    })
  })
}

NightbearApi.prototype.getStatus = function() {
  return new Promise(function(resolve, reject) {
    fetch(BEAR_STATUS_URL).then(function(response) {
      return response.json();
    }).then(function(json) {
      console.log("API: got status from server")
      resolve(json);
    }).catch(function (error) {
      reject(error);
    })
  })
}