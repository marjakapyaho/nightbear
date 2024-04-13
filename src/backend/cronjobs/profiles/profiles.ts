import { DAY_IN_MS, MIN_IN_MS } from 'shared/utils/calculations';
import { getActivationTimestamp, humanReadableShortTime } from 'shared/utils/time';
import { padStart } from 'lodash';
import { Cronjob } from 'backend/utils/cronjobs';

// Checks if any of the scheduled profile activations match the given time range.
// If so, activates them.
export const profiles: Cronjob = (context, journal) => {
  const { log } = context;
  const now = Date.now();
  return Promise.resolve()
    .then(() => {
      const then = journal.previousExecutionAt?.getTime();
      if (!then) return; // we don't know when we last ran -> let's try again on the next run
      const sinceMin = (now - then) / MIN_IN_MS;
      if (sinceMin > 5) log(`${sinceMin.toFixed(1)} min since last profile activation check, suspicious`);
      return Promise.resolve()
        .then(() => context.storage.loadGlobalModels())
        .then(models => models.filter(is('SavedProfile')))
        .then(profiles => {
          const profilesToActivate = profiles.filter(profile => {
            if (!profile.activatedAtUtc) return false; // doesn't have a schedule -> don't care
            const t = humanReadableShortTime;
            const { hours, minutes } = profile.activatedAtUtc;
            const yesterday = getActivationTimestamp(profile.activatedAtUtc) - DAY_IN_MS;
            const today = getActivationTimestamp(profile.activatedAtUtc);
            const atUtc = `${padStart(hours + '', 2, '0')}:${padStart(minutes + '', 2, '0')} UTC`;
            const atLocal = t(today);
            const match = fallsBetween(then, yesterday, now) || fallsBetween(then, today, now);
            const readableMatch = `${match ? 'DOES' : "doesn't"} fall between ${t(then)} and ${t(now)}`;
            if (match) log(`"${profile.profileName}" set to activate at ${atLocal} (${atUtc}), ${readableMatch}`);
            return match;
          });
          if (profilesToActivate.length > 1) {
            log('Having more than 1 profile activate on the same run is very suspicious; will skip');
          } else if (profilesToActivate.length === 1) {
            activateProfile(context, profilesToActivate[0]);
          } else {
            log(`None of the ${profiles.length} profiles need activation`);
          }
        });
    })
    .then(() => ({ previousExecutionAt: new Date(now) })); // store the timestamp of this run into the CronjobsJournal
};

function activateProfile(context: Context, profile: SavedProfile) {
  const { log } = context;
  log(`Activating profile "${profile.profileName}"`);
  const activation = activateSavedProfile(profile, context.timestamp());
  return context.storage.saveModel(activation).then(
    () => log(`Activated profile "${profile.profileName}"`),
    err => log(`Activating profile "${profile.profileName}" failed`, err),
  );
}

function fallsBetween(a: number, b: number, c: number) {
  return a <= b && b <= c;
}
