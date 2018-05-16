export default app => {

    const log = app.logger(__filename);

    return {

        getActiveProfile(settingsObj) {
            log('Getting active profile');
            const currentTimestamp = app.currentTime();
            if (new Date(currentTimestamp).getHours() > 9) { // DAY
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
