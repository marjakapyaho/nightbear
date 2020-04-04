import { Context } from 'core/models/api';
import { SavedProfile } from 'core/models/model';
import { activateSavedProfile, is } from 'core/models/utils';
import { CronJob } from 'cron';
import { padStart } from 'lodash';

export function startAutomaticProfileActivation(context: Context) {
  context.storage
    .loadGlobalModels()
    .then(models => models.filter(is('SavedProfile')))
    .then(profiles =>
      profiles.forEach(profile => {
        if (!profile.activatedAtUtc) return;
        const { hours, minutes } = profile.activatedAtUtc;
        const readableTime = `${padStart(hours + '', 2, '0')}:${padStart(minutes + '', 2, '0')} UTC`;
        context.log.info(`Profile "${profile.profileName}" set to automatically activate at ${readableTime}`);
        new CronJob(
          `0 ${minutes} ${hours} * * *`,
          () => activateProfile(context, profile),
          null,
          true,
          'UTC', // vs. e.g. "Europe/Helsinki"; see https://momentjs.com/timezone/docs/#/using-timezones/getting-zone-names/
        );
      }),
    );
}

function activateProfile(context: Context, profile: SavedProfile) {
  context.log.debug(`Activating profile "${profile.profileName}"`);
  const activation = activateSavedProfile(profile, context.timestamp());
  return context.storage.saveModel(activation).then(
    () => context.log.info(`Activated profile "${profile.profileName}"`),
    err => context.log.error(`Activating profile "${profile.profileName}" failed`, err),
  );
}
