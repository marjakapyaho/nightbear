const API_GET_STATUS = 'https://router.nightbear.fi/get-watch-status'
const API_GET_ENTRIES = 'https://router.nightbear.fi/get-entries'

export function NightbearApi() {
  console.log('API: created NightbearApi')
}

NightbearApi.prototype.getBloodSugars = function() {
  return new Promise(function(resolve, reject) {
    fetch(API_GET_ENTRIES).then(function(response) {
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
    fetch(API_GET_STATUS).then(function(response) {
      return response.json();
    }).then(function(json) {
      console.log("API: got status from server")
      resolve(json);
    }).catch(function (error) {
      reject(error);
    })
  })
}