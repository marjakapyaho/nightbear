import { chain } from 'lodash';
import {
  findRepeatingActivationToActivate,
  shouldNonRepeatingActivationBeDeactivated,
  shouldRepeatingActivationBeSwitched,
} from 'backend/cronjobs/profiles/utils';
import { Context } from 'backend/utils/api';
import { getActiveProfile } from 'shared/utils/profiles';
import { Profile } from 'shared/types/profiles';
import { Cronjob } from 'backend/utils/cronjobs';
import { CronjobsJournal } from 'backend/db/cronjobsJournal/types';

export const profiles: Cronjob = async (
  context,
  _journal,
): Promise<Partial<CronjobsJournal> | void> => {
  const { log } = context;

  log('1. Checking profile activations');

  const activeProfile = await checkAndUpdateProfileActivations(context, context.timestamp());

  log(`3. Ended up with active profile named: ${activeProfile?.profileName}`);
};

export const checkAndUpdateProfileActivations = async (
  context: Context,
  currentTimestamp: string,
  timezone = 'TZ',
) => {
  const { log } = context;
  const profileActivations = await context.db.profiles.getRelevantProfileActivations();
  const latestActivation = chain(profileActivations).sortBy('activatedAt').last().value();
  const activationToActivate = findRepeatingActivationToActivate(
    profileActivations,
    currentTimestamp,
    timezone,
  );

  /**
   * Check if we should reactivate a repeating profile activation in either of two cases:
   * 1. We are using a repeating activation, and it's time to activate another repeating activation
   * 2. We are using a non-repeating activation that has reached its deactivation time
   */
  if (
    shouldRepeatingActivationBeSwitched(latestActivation, activationToActivate) ||
    shouldNonRepeatingActivationBeDeactivated(latestActivation, currentTimestamp)
  ) {
    log(`2. Activating repeating activation with id: ${activationToActivate.id}`);
    await context.db.profiles.reactivateProfileActivation(activationToActivate);
  } else {
    log('2. No activations needed.');
  }

  // TODO: CASTING + get active profile from db with query
  const profilesAfterUpdate = (await context.db.profiles.getProfiles()) as Profile[];
  return getActiveProfile(profilesAfterUpdate);
};
