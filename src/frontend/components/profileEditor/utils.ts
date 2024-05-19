import { Profile } from 'shared/types/profiles';
import { ProfileEditorMode } from 'frontend/components/profileEditor/ProfileEditor';

export const getProfileWithResets = (selectedProfile: Profile, mode: ProfileEditorMode) => ({
  ...selectedProfile,
  profileName: mode === 'create' ? '' : selectedProfile.profileName,
  repeatTimeInLocalTimezone:
    mode === 'create' ? undefined : selectedProfile.repeatTimeInLocalTimezone,
});
