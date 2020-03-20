import * as messaging from "messaging";

const BEAR_STATUS_URL = 'https://router.nightbear.fi/legacy-api/v1/status'

messaging.peerSocket.onmessage = function(evt) {
  if (evt.data.ack) {
    ackAlarm()
    .then(function(response) {
      messaging.peerSocket.send('Success')
    })
    .catch(function (error) {
      messaging.peerSocket.send('Ack failed')
      console.log(error)
    })
  }
}

function ackAlarm() {
  return new Promise(function(resolve, reject) {
    fetch(BEAR_STATUS_URL, { method: 'POST', body: 'dummy' }).then(function(response) {
      return response;
    }).then(function(response) {
      resolve(response);
    }).catch(function (error) {
      console.log(error)
      reject(error);
    })
  })
}