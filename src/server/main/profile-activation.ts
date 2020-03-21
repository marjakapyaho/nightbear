import { Context } from 'core/models/api';
import { is, activateSavedProfile } from 'core/models/utils';
import { pad } from 'lodash';
import { SavedProfile } from 'core/models/model';
import { CronJob } from 'cron';

export function startAutomaticProfileActivation(context: Context) {
  context.storage
    .loadGlobalModels()
    .then(models => models.filter(is('SavedProfile')))
    .then(profiles =>
      profiles.forEach(profile => {
        if (!profile.activatedAtUtc) return;
        const { hours, minutes } = profile.activatedAtUtc;
        const readableTime = `${pad(hours + '', 2, '0')}:${pad(minutes + '', 2, '0')} UTC`;
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
