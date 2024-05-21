"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAndUpdateProfileActivations = exports.profiles = void 0;
const utils_1 = require("./utils");
const shared_1 = require("@nightbear/shared");
const profiles = async (context, _journal) => {
    const { log } = context;
    log('1. Checking profile activations');
    const activeProfile = await (0, exports.checkAndUpdateProfileActivations)(context, context.timestamp());
    log(`3. Ended up with active profile named: ${activeProfile?.profileName}`);
};
exports.profiles = profiles;
const checkAndUpdateProfileActivations = async (context, currentTimestamp, timezone = shared_1.DEFAULT_TIMEZONE) => {
    const { log } = context;
    const profiles = await context.db.getProfiles();
    const latestActivation = await context.db.getLatestProfileActivation();
    const profileToActivate = (0, utils_1.findRepeatingTemplateToActivate)(profiles, currentTimestamp, timezone);
    if (!profileToActivate) {
        throw new Error('Could not find repeating profile to activate');
    }
    /**
     * Check if we should reactivate a repeating profile activation in either of two cases:
     * 1. We are using a repeating activation, and it's time to activate another repeating activation
     * 2. We are using a non-repeating activation that has reached its deactivation time
     */
    if ((0, utils_1.shouldRepeatingActivationBeSwitched)(latestActivation, profileToActivate) ||
        (0, utils_1.shouldNonRepeatingActivationBeDeactivated)(latestActivation, currentTimestamp)) {
        log(`2. Activating repeating profile with id: ${profileToActivate.id}`);
        await context.db.createProfileActivation({
            profileTemplateId: profileToActivate.id,
            activatedAt: context.timestamp(),
        });
    }
    else {
        log('2. No activations needed.');
    }
    return context.db.getActiveProfile();
};
exports.checkAndUpdateProfileActivations = checkAndUpdateProfileActivations;
//# sourceMappingURL=profiles.js.map