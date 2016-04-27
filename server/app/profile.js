export default app => {

    const log = app.logger(__filename);

    return {

        getActiveProfile(settingsObj) {
            log('Getting active profile');
            const currentTimestamp = app.currentTime();
            if (new Date(currentTimestamp).getHours() > 9) { // DAY
                return settingsObj.profiles.day;
            }
            else { // NIGHT
                return settingsObj.profiles.night;
            }
        }

    };

}
