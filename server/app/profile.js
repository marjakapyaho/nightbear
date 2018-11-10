export default app => {

    const log = app.logger(__filename);

    return {

        // HACK: update if day times change
        getActiveProfileName() {
            const currentTimestamp = app.currentTime();
            if (new Date(currentTimestamp).getHours() > 7 && new Date(currentTimestamp).getHours() < 21) {
                return 'day';
            }
            else {
                return 'night';
            }
        },

        getActiveProfile(settingsObj) {
            const currentTimestamp = app.currentTime();
            // utc 7 = fi 9, utc 21 = fi 23
            if (new Date(currentTimestamp).getHours() > 7 && new Date(currentTimestamp).getHours() < 21) { // DAY
                log.debug('Selected active profile: DAY', new Date(currentTimestamp).getHours());
                return settingsObj.profiles.day;
            }
            else { // NIGHT
                log.debug('Selected active profile: NIGHT', new Date(currentTimestamp).getHours());
                return settingsObj.profiles.night;
            }
        }

    };

}
