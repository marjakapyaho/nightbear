import { me } from "companion";
import { NightbearApi } from "./nightbearApi.js";
import * as util from "../common/utils";
import { outbox } from "file-transfer";
import { encode } from 'cbor';
import { peerSocket } from "messaging";

const MIN_IN_MILLIS = 60*1000
const nightbearApi = new NightbearApi()
let latestData
let manualInterval

// TODO: move this
me.wakeInterval = 5 * MIN_IN_MILLIS

if (manualInterval) {
  self.clearInterval(manualInterval)
}

self.setTimeout(fetchData, 1000)
manualInterval = self.setInterval(fetchData, MIN_IN_MILLIS)

peerSocket.onmessage = function(evt) {
  fetchData()
}

function fetchData() {
  console.log('COM: fetching new data')
  Promise.all([
    nightbearApi.getBloodSugars(),
    nightbearApi.getStatus()
  ])
    .then(function(data) {
      outbox.enqueue("bloodsugardata.json", encode({
        bloodSugarArray: util.getBloodSugarArray(data[0]),
        status: data[1]
      }));
  }).catch(function (e) {
    console.log("COM: error fetching data") 
    console.log(e)
  })
}