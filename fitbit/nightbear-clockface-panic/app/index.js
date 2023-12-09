import clock from 'clock';
import document from 'document';
import { inbox } from 'file-transfer';
import { readFileSync } from 'fs';
import { preferences } from 'user-settings';
import * as util from '../common/utils';
import { vibration } from 'haptics';
import { peerSocket } from 'messaging';

// Update the clock every minute
clock.granularity = 'minutes';

const clockEl = document.getElementById('clock');
const timeSinceEl = document.getElementById('timeSince');
const alarmEl = document.getElementById('alarm');
const bloodSugarEl = document.getElementById('bloodSugar');
let vibrationTimer, dataTimer;
let timeSinceCounter = Date.now();
let bloodSugarArray = [];
let situationStatus = {};
const MIN_IN_MILLIS = 60 * 1000;

update();
setInterval(update, MIN_IN_MILLIS);

clock.ontick = evt => {
  console.log('APP: updating clock and timer');
  updateTimeSince();
  updateClock(evt);
};

// Wait for bloodsugar data in file
inbox.onnewfile = () => {
  console.log('APP: new file detected');
  let fileName;
  do {
    fileName = inbox.nextFile();
    if (fileName) {
      console.log('APP: received API data');
      const data = readFileSync(fileName, 'cbor');
      timeSinceCounter = Date.now();
      bloodSugarArray = data.bloodSugarArray;
      situationStatus = data.status;
      updateTimeSince();
      updateBloodSugarData();
      updateStatus();
    }
  } while (fileName);
};

function sendRequestForData() {
  if (peerSocket.readyState === peerSocket.OPEN) {
    console.log('APP: sending request');
    peerSocket.send({ getBloodSugar: true });
  } else {
    console.log('APP: peer socket not open');
    setError('Error 2');
  }
}

function update() {
  sendRequestForData();
  updateBloodSugarData();
}

function setError(type) {
  bloodSugarEl.text = type;
}

function updateClock(evt) {
  let today = evt.date;
  let hours = today.getHours();
  hours = util.zeroPad(hours);
  let mins = util.zeroPad(today.getMinutes());
  clockEl.text = `${hours}:${mins}`;
}

function updateTimeSince() {
  let timeSince = Math.round((Date.now() - timeSinceCounter) / util.MIN_IN_MILLIS);
  timeSinceEl.text = `${timeSince} min`;
  if (timeSince > 3) {
    setError('OLD');
  }
}

function updateStatus() {
  let alarmType = '';
  if (situationStatus && situationStatus.alarms && situationStatus.alarms.length) {
    alarmType = situationStatus.alarms[0].situationType;
    startVibration();
  } else {
    stopVibration();
  }

  alarmEl.text = getStatusForUI(alarmType);
}

function startVibration() {
  clearInterval(vibrationTimer); // clear previous if there is one
  vibrationTimer = setInterval(
    function(vibration) {
      vibration.start('ring');
    },
    5000,
    vibration,
  );
}

function stopVibration() {
  vibration.stop();
  clearInterval(vibrationTimer);
}

function updateBloodSugarData() {
  let lastDataPoint = bloodSugarArray[bloodSugarArray.length - 1];
  let secondLastDataPoint = bloodSugarArray[bloodSugarArray.length - 2];
  const sugarValue = (lastDataPoint && lastDataPoint.s) || (secondLastDataPoint && secondLastDataPoint.s) || '-';

  bloodSugarEl.text = sugarValue;
  drawGraph(bloodSugarArray);
}

function drawGraph(bloodSugars) {
  try {
    let elements = document.getElementsByClassName('dot');
    elements.forEach(function(element, index) {
      let sugar = bloodSugars[index] && bloodSugars[index].s;
      let insulin = bloodSugars[index] && bloodSugars[index].i;
      let carbs = bloodSugars[index] && bloodSugars[index].c;
      let isRaw = bloodSugars[index] && bloodSugars[index].r;

      element.cx = 18 + 9 * index;
      element.r = 2; // reset element size

      if (sugar) {
        element.cy = 320 - 10 * parseFloat(sugar);
        element.style.fill = getFillColor(sugar);
      } else {
        element.style.fill = util.GREY;
      }

      if (isRaw) {
        element.style.fill = 'white';
      }

      if (insulin) {
        element.r = 8;
        element.style.fill = util.RED;
        element.layer = 1000;
      }

      if (carbs) {
        element.r = 8;
        element.style.fill = util.YELLOW;
        element.layer = 1000;
      }
    });
  } catch (error) {
    console.error(error);
    setError(error);
  }
}

function getFillColor(sugar) {
  if (sugar > 9) {
    return util.YELLOW;
  } else if (sugar < 4) {
    return util.RED;
  } else {
    return util.GREEN;
  }
}

function getStatusForUI(status) {
  if (status === 'LOW') {
    return 'LOW';
  }
  if (status === 'HIGH') {
    return 'HIGH';
  }
  if (status === 'FALLING') {
    return 'FALLING';
  }
  if (status === 'RISING') {
    return 'RISING';
  }
  if (status === 'BATTERY') {
    return 'BATTERY';
  }
  if (status === 'PERSISTENT_HIGH') {
    return 'P. HIGH';
  }
  if (status === 'OUTDATED') {
    return 'OUTDATED';
  } else {
    return '';
  }
}
