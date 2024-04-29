import { chain, sortBy } from 'lodash';
import { isTimeSmallerOrEqual } from 'shared/utils/time';
import { getActivationAsUTCTimestamp } from 'backend/cronjobs/profiles/utils';
import { Context } from 'backend/utils/api';
import { getActiveProfile } from 'shared/utils/profiles';
import { Profile } from 'shared/types/profiles';
import { Cronjob } from 'backend/utils/cronjobs';
import { CronjobsJournal } from 'backend/db/cronjobsJournal/types';

export const profiles: Cronjob = async (
  context,
  journal,
): Promise<Partial<CronjobsJournal> | void> => {
  await checkAndUpdateProfileActivations(context, context.timestamp());
};

export const checkAndUpdateProfileActivations = async (
  context: Context,
  currentTimestamp: string,
) => {
  const { log } = context;

  const profileActivations = await context.db.profiles.getRelevantProfileActivations();

  if (!profileActivations.length) {
    throw new Error('No profile');
  }

  console.log(chain(profileActivations).sortBy('activatedAt').last().value());

  // TODO: TEST THIS
  const latestActivation = chain(profileActivations).sortBy('activatedAt').last().value();

  // Should current activation be deactivated
  if (
    latestActivation.deactivatedAt &&
    isTimeSmallerOrEqual(latestActivation.deactivatedAt, currentTimestamp)
  ) {
    // Find repeating activation that should be activated
    const activationToActivate = chain(profileActivations)
      .map(activation =>
        activation.repeatTimeInLocalTimezone
          ? {
              id: activation.id,
              activationTimestamp: getActivationAsUTCTimestamp(
                activation.repeatTimeInLocalTimezone,
                currentTimestamp,
              ),
            }
          : null,
      )
      .filter(activation => Boolean(activation && activation.activationTimestamp))
      .sortBy('activationTimestamp')
      .last()
      .value();

    await context.db.profiles.reactivateProfileActivation(activationToActivate);
  }

  // TODO: CASTING
  const profilesAfterUpdate = (await context.db.profiles.getProfiles()) as Profile[];
  return getActiveProfile(profilesAfterUpdate);
};
