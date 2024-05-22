"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLatestProfileActivation = exports.shouldNonRepeatingActivationBeDeactivated = exports.shouldRepeatingActivationBeSwitched = exports.isActivationRepeating = exports.findRepeatingTemplateToActivate = exports.getActivationAsUTCTimestamp = void 0;
const luxon_1 = require("luxon");
const shared_1 = require("@nightbear/shared");
const shared_2 = require("@nightbear/shared");
const lodash_1 = require("lodash");
const getActivationAsUTCTimestamp = (repeatTimeInLocalTimezone, now, timezone) => {
    const timeParts = repeatTimeInLocalTimezone.split(':').map(part => parseInt(part, 10));
    const currentTimestampInLocalTime = luxon_1.DateTime.fromISO(now).setZone(timezone);
    const repeatTimestampInLocalTime = currentTimestampInLocalTime.set({
        hour: timeParts[0],
        minute: timeParts[1],
    });
    // If time is in the future, move it to yesterday
    const timeInLocalTimezone = repeatTimestampInLocalTime > currentTimestampInLocalTime
        ? repeatTimestampInLocalTime.minus(shared_2.DAY_IN_MS)
        : repeatTimestampInLocalTime;
    return timeInLocalTimezone.toUTC().toISO();
};
exports.getActivationAsUTCTimestamp = getActivationAsUTCTimestamp;
const findRepeatingTemplateToActivate = (profiles, currentTimestamp, timezone) => (0, lodash_1.chain)(profiles)
    .map(profile => profile.repeatTimeInLocalTimezone
    ? {
        id: profile.id,
        activationTimestamp: (0, exports.getActivationAsUTCTimestamp)(profile.repeatTimeInLocalTimezone, currentTimestamp, timezone),
    }
    : null)
    .filter(mappedProfile => Boolean(mappedProfile && mappedProfile.activationTimestamp))
    .sortBy('activationTimestamp')
    .last()
    .value();
exports.findRepeatingTemplateToActivate = findRepeatingTemplateToActivate;
const isActivationRepeating = (activation) => !activation.deactivatedAt;
exports.isActivationRepeating = isActivationRepeating;
const shouldRepeatingActivationBeSwitched = (currentActivation, potentialProfileTemplate) => (0, exports.isActivationRepeating)(currentActivation) &&
    potentialProfileTemplate &&
    potentialProfileTemplate.id !== currentActivation.profileTemplateId;
exports.shouldRepeatingActivationBeSwitched = shouldRepeatingActivationBeSwitched;
const shouldNonRepeatingActivationBeDeactivated = (currentActivation, currentTimestamp) => currentActivation.deactivatedAt &&
    (0, shared_1.isTimeSmallerOrEqual)(currentActivation.deactivatedAt, currentTimestamp);
exports.shouldNonRepeatingActivationBeDeactivated = shouldNonRepeatingActivationBeDeactivated;
const getLatestProfileActivation = (profileActivations) => {
    const latestActivation = (0, lodash_1.chain)(profileActivations).sortBy('activatedAt').last().value();
    if (!latestActivation) {
        throw new Error('Could not find any profile activations');
    }
    return latestActivation;
};
exports.getLatestProfileActivation = getLatestProfileActivation;
//# sourceMappingURL=utils.js.map