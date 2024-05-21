import * as messaging from "messaging";

const API_ACK_ALARM = 'https://router.nightbear.fi/ack-latest-alarm'

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
    fetch(API_ACK_ALARM, { 
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ acknowledged_by: 'fitbit' })
    }).then(function(response) {
      return response;
    }).then(function(response) {
      resolve(response);
    }).catch(function (error) {
      console.log(error)
      reject(error);
    })
  })
}