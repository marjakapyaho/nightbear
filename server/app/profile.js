export default app => {

    const log = app.logger(__filename);

    return {

        getActiveProfile(settingsObj) {
            log('Getting active profile');
            const currentTimestamp = app.currentTime();
            // utc 6 = fi 9, utc 20 = fi 23
            if (new Date(currentTimestamp).getHours() > 6 && new Date(currentTimestamp).getHours() < 20) { // DAY
                log('Selected active profile: DAY', new Date(currentTimestamp).getHours());
                return settingsObj.profiles.day;
            }
            else { // NIGHT
                log('Selected active profile: NIGHT', new Date(currentTimestamp).getHours());
                return settingsObj.profiles.night;
            }
        }

    };

}
