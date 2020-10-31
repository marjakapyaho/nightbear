import { DAY_IN_MS } from 'core/calculations/calculations';
import { Context } from 'core/models/api';
import { SavedProfile } from 'core/models/model';
import { activateSavedProfile, is } from 'core/models/utils';
import { getActivationTimestamp, humanReadableShortTime } from 'core/utils/time';
import { padStart } from 'lodash';
import { Cronjob } from 'server/main/cronjobs';

// Checks if any of the scheduled profile activations match the given time range.
// If so, activates them.
export const profiles: Cronjob = (context, { then, now }) => {
  return context.storage
    .loadGlobalModels()
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
        context.log(`"${profile.profileName}" set to activate at ${atLocal} (${atUtc}), ${readableMatch}`);
        return match;
      });
      if (profilesToActivate.length > 1) {
        context.log('Warning: Having more than 1 profile activate on the same run is very suspicious; will skip');
      } else if (profilesToActivate.length === 1) {
        activateProfile(context, profilesToActivate[0]);
      }
    });
};

function activateProfile(context: Context, profile: SavedProfile) {
  context.log(`Activating profile "${profile.profileName}"`);
  const activation = activateSavedProfile(profile, context.timestamp());
  return context.storage.saveModel(activation).then(
    () => context.log(`Activated profile "${profile.profileName}"`),
    err => context.log(`Activating profile "${profile.profileName}" failed`, err),
  );
}

function fallsBetween(a: number, b: number, c: number) {
  return a <= b && b <= c;
}
