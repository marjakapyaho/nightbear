"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editProfile = exports.createProfile = exports.activateProfile = exports.getProfiles = void 0;
const api_1 = require("../../utils/api");
const shared_1 = require("@nightbear/shared");
const getProfiles = async (_request, context) => {
    const profiles = await context.db.getProfiles();
    return (0, api_1.createResponse)(profiles);
};
exports.getProfiles = getProfiles;
const activateProfile = async (request, context) => {
    // TODO: better casting
    const body = request.requestBody;
    const profile = 'profile' in body ? body.profile : null;
    const validityInMs = 'validityInMs' in body ? body.validityInMs : 0;
    // TODO: error handling
    if (!profile) {
        return (0, api_1.createResponse)('Error');
    }
    const profileActivation = await context.db.createProfileActivation({
        profileTemplateId: profile.id,
        activatedAt: context.timestamp(),
        deactivatedAt: (0, shared_1.getTimePlusTime)(context.timestamp(), validityInMs),
    });
    return (0, api_1.createResponse)(profileActivation.id);
};
exports.activateProfile = activateProfile;
const createProfile = async (request, context) => {
    // TODO: better casting
    const body = request.requestBody;
    const profile = 'profile' in body ? body.profile : null;
    const validityInMs = 'validityInMs' in body ? body.validityInMs : 0;
    // TODO: error handling
    if (!profile) {
        return (0, api_1.createResponse)('Error');
    }
    const createdProfile = await context.db.createProfile(profile);
    await context.db.createProfileActivation({
        profileTemplateId: createdProfile.id,
        activatedAt: context.timestamp(),
        deactivatedAt: (0, shared_1.getTimePlusTime)(context.timestamp(), validityInMs),
    });
    return (0, api_1.createResponse)(createdProfile.id);
};
exports.createProfile = createProfile;
const editProfile = async (request, context) => {
    // TODO: better casting
    const profile = request.requestBody;
    // TODO: error handling
    if (!profile?.id) {
        return (0, api_1.createResponse)('Error');
    }
    const editedProfile = await context.db.editProfile(profile, profile.id);
    return (0, api_1.createResponse)(editedProfile.id);
};
exports.editProfile = editProfile;
//# sourceMappingURL=handler.js.map