import { Context } from 'core/models/api';
import { SavedProfile } from 'core/models/model';
import { activateSavedProfile, is } from 'core/models/utils';
import { CronJob } from 'cron';
import { padStart } from 'lodash';
import { extendLogger } from 'core/utils/logging';

export function startAutomaticProfileActivation(context: Context) {
  const _context = extendLogger(context, 'profiles');
  context.storage
    .loadGlobalModels()
    .then(models => models.filter(is('SavedProfile')))
    .then(profiles =>
      profiles.forEach(profile => {
        if (!profile.activatedAtUtc) return;
        const { hours, minutes } = profile.activatedAtUtc;
        const readableTime = `${padStart(hours + '', 2, '0')}:${padStart(minutes + '', 2, '0')} UTC`;
        _context.log(`Profile "${profile.profileName}" set to automatically activate at ${readableTime}`);
        new CronJob(
          `0 ${minutes} ${hours} * * *`,
          () => activateProfile(_context, profile),
          null,
          true,
          'UTC', // vs. e.g. "Europe/Helsinki"; see https://momentjs.com/timezone/docs/#/using-timezones/getting-zone-names/
        );
      }),
    );
}

function activateProfile(context: Context, profile: SavedProfile) {
  context.log(`Activating profile "${profile.profileName}"`);
  const activation = activateSavedProfile(profile, context.timestamp());
  return context.storage.saveModel(activation).then(
    () => context.log(`Activated profile "${profile.profileName}"`),
    err => context.log(`Activating profile "${profile.profileName}" failed`, err),
  );
}
