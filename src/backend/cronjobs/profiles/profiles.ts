import { chain, sortBy } from 'lodash';
import { isTimeSmallerOrEqual } from 'shared/utils/time';
import { getActivationAsUTCTimestamp } from 'backend/cronjobs/profiles/utils';
import { Context } from 'backend/utils/api';
import { getActiveProfile } from 'shared/utils/profiles';
import { Profile } from 'shared/types/profiles';

export const checkAndUpdateProfileActivations = async (context: Context) => {
  const { log } = context;
  const now = context.timestamp();

  const profileActivations = await context.db.profiles.getRelevantProfileActivations();

  if (!profileActivations.length) {
    throw new Error('No profile');
  }

  // TODO: TEST THIS
  const latestActivation = sortBy(profileActivations, 'activatedAt')[0];

  // Should current activation be deactivated
  if (latestActivation.deactivatedAt && isTimeSmallerOrEqual(latestActivation.deactivatedAt, now)) {
    // Find repeating activation that should be activated
    const activationToActivate = chain(profileActivations)
      .map(activation =>
        activation.repeatTimeInLocalTimezone
          ? {
              id: activation.id,
              activationTimestamp: getActivationAsUTCTimestamp(
                activation.repeatTimeInLocalTimezone,
                now,
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
