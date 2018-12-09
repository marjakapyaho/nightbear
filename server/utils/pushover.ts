// import Pushover from 'pushover-notifications';
// const api;

export function initPushoverClient(user: string, token: string) {
  console.log(user, token);
  // api = new Pushover({ user, token });
}

export function sendPushoverAlarm(recipient: string, message: string, retry: number, expire: number) {
  const pushoverAlarm = {
    message,
    title: 'NightBear alert',
    sound: 'persistent',
    device: recipient,
    priority: 2,
    retry,
    expire,
    callback: `${process.env['NIGHTBEAR_API_URL']}/ack-latest-alarm`,
  };

  console.log(pushoverAlarm);
  /*
  return new Promise((resolve, reject) => {
    api.send(pushoverAlarm, (err, result) => {
      if (err) { return reject(err); }
      let receipt = JSON.parse(result).receipt;
      resolve(receipt);
    });
  });
  */
}

export function ackPushoverAlarms(receipts: string[] = []) {
  return Promise.all(
    receipts.map(receipt => {
      return receipt;
      /*
    return axios.post(
      'https://api.pushover.net/1/receipts/' + receipt + '/cancel.json',
      'token=' + encodeURIComponent(token),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    ).then(
      () => log('Ack success:', receipt),
      err => {
        log.error('Ack failure:', err);
        throw err; // keep the Promise rejected
      }
    );
    */
    }),
  );
}
