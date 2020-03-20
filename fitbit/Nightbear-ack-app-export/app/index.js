import * as messaging from "messaging"
import document from "document"
import { me } from "appbit";

const BEAR_BASE_URL = 'http://legacy.nightbear.fi/api/v1'
const messageEl = document.getElementById("message");

// Listen for the onopen event
messaging.peerSocket.onopen = function() {
  console.log('APP: Acking alarm on open')
  updateUI("Sending ack")
  messaging.peerSocket.send({ ack: true })
}

// Listen for the onmessage event
messaging.peerSocket.onmessage = function(evt) {
  updateUI(evt.data)
  setTimeout(function(){ me.exit() }, 3000);
}

// Listen for the onerror event
messaging.peerSocket.onerror = function(err) {
  updateUI('Init failed')
}

function updateUI(text) {
  messageEl.text = text
}