import {
  findRepeatingTemplateToActivate,
  shouldNonRepeatingActivationBeDeactivated,
  shouldRepeatingActivationBeSwitched,
} from './utils';
import { CronjobsJournal } from '../../db/cronjobsJournal/types';
import { Context } from '../../utils/api';
import { Cronjob } from '../../utils/cronjobs';
import { DEFAULT_TIMEZONE } from '@nightbear/shared';

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
  timezone = DEFAULT_TIMEZONE,
) => {
  const { log } = context;
  const profiles = await context.db.getProfiles();
  const latestActivation = await context.db.getLatestProfileActivation();

  const profileToActivate = findRepeatingTemplateToActivate(profiles, currentTimestamp, timezone);

  if (!profileToActivate) {
    throw new Error('Could not find repeating profile to activate');
  }

  /**
   * Check if we should reactivate a repeating profile activation in either of two cases:
   * 1. We are using a repeating activation, and it's time to activate another repeating activation
   * 2. We are using a non-repeating activation that has reached its deactivation time
   */
  if (
    shouldRepeatingActivationBeSwitched(latestActivation, profileToActivate) ||
    shouldNonRepeatingActivationBeDeactivated(latestActivation, currentTimestamp)
  ) {
    log(`2. Activating repeating profile with id: ${profileToActivate.id}`);
    await context.db.createProfileActivation({
      profileTemplateId: profileToActivate.id,
      activatedAt: context.timestamp(),
    });
  } else {
    log('2. No activations needed.');
  }

  return context.db.getActiveProfile();
};
