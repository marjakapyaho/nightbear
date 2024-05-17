import {
  findRepeatingActivationToActivate,
  getLatestProfileActivation,
  shouldNonRepeatingActivationBeDeactivated,
  shouldRepeatingActivationBeSwitched,
} from 'backend/cronjobs/profiles/utils';
import { Context } from 'backend/utils/api';
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
  const profileActivations = await context.db.getRelevantProfileActivations();
  const latestActivation = getLatestProfileActivation(profileActivations);

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
    await context.db.reactivateProfileActivation(activationToActivate.id);
  } else {
    log('2. No activations needed.');
  }

  return context.db.getActiveProfile();
};
