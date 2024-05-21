import { Profile } from '@nightbear/shared';
import { ProfileEditorMode } from './ProfileEditor';

export const getProfileWithResets = (selectedProfile: Profile, mode: ProfileEditorMode) => ({
  ...selectedProfile,
  profileName: mode === 'create' ? '' : selectedProfile.profileName,
  repeatTimeInLocalTimezone:
    mode === 'create' ? undefined : selectedProfile.repeatTimeInLocalTimezone,
});
