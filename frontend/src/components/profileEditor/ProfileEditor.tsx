import { useState } from 'react';
import styles from './ProfileEditor.module.scss';
import { Editor } from './Editor';
import { Profile, HOUR_IN_MS, PROFILE_BASE } from '@nightbear/shared';
import { map } from 'lodash';
import { getProfileWithResets } from './utils';

export type ProfileEditorMode = 'activate' | 'create' | 'edit';
export type ModeSettings = {
  label: string;
  profileSelectionLabel: string;
  buttonAction: () => void;
  profileName?: boolean;
  repeatTime?: boolean;
  validHours?: boolean;
  analyserSettings?: boolean;
};

type Props = {
  activeProfile: Profile;
  activateProfile: (profile: Profile, validityInMs: number) => void;
  editProfile: (profile: Profile) => void;
  createProfile: (profile: Profile, validityInMs: number) => void;
  profiles: Profile[];
};

export const ProfileEditor = ({
  activeProfile,
  activateProfile,
  createProfile,
  editProfile,
  profiles,
}: Props) => {
  const [mode, setMode] = useState<ProfileEditorMode>('activate');
  const baseProfile = activeProfile ? activeProfile : PROFILE_BASE;
  const [localProfile, setLocalProfile] = useState<Profile>(baseProfile);
  const [selectedProfile, setSelectedProfile] = useState<Profile>(baseProfile);
  const [validityInHours, setValidityInHours] = useState(1);

  const editorTabs: Record<ProfileEditorMode, ModeSettings> = {
    activate: {
      label: 'Activate',
      profileSelectionLabel: 'Profile to activate',
      buttonAction: () => activateProfile(localProfile, validityInHours * HOUR_IN_MS),
      validHours: true,
    },
    create: {
      label: 'Create',
      profileSelectionLabel: 'Based on profile',
      buttonAction: () => createProfile(localProfile, validityInHours * HOUR_IN_MS),
      profileName: true,
      repeatTime: true,
      validHours: true,
      analyserSettings: true,
    },
    edit: {
      label: 'Edit',
      profileSelectionLabel: 'Profile to edit',
      buttonAction: () => editProfile(localProfile),
      profileName: true,
      repeatTime: true,
      analyserSettings: true,
    },
  };

  const updateSelectedProfile = (selectedProfile: Profile) => {
    setSelectedProfile(selectedProfile);
    setLocalProfile(getProfileWithResets(selectedProfile, mode));
  };

  const updateMode = (mode: ProfileEditorMode) => {
    setMode(mode);
    setLocalProfile(getProfileWithResets(selectedProfile, mode));
  };

  return (
    <div className={styles.profileEditor}>
      <div className={styles.tabs}>
        {map(editorTabs, (settings: ModeSettings, key: ProfileEditorMode) => (
          <div
            key={key}
            className={`${styles.tab} ${mode === key ? styles.selected : ''}`}
            onClick={() => updateMode(key)}
          >
            {settings.label}
          </div>
        ))}
      </div>
      <Editor
        modeSettings={editorTabs[mode]}
        selectedProfile={selectedProfile}
        updateSelectedProfile={updateSelectedProfile}
        localProfile={localProfile}
        setLocalProfile={setLocalProfile}
        validityInHours={validityInHours}
        setValidityInHours={setValidityInHours}
        profiles={profiles}
      />
    </div>
  );
};
