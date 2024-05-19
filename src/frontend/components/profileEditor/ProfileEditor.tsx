import React, { useState } from 'react';
import styles from 'frontend/components/profileEditor/ProfileEditor.module.scss';
import { Editor } from 'frontend/components/profileEditor/Editor';
import { Profile } from 'shared/types/profiles';
import { HOUR_IN_MS } from 'shared/utils/calculations';
import { PROFILE_BASE } from 'shared/utils/profiles';
import { map } from 'lodash';
import { getProfileWithCorrectName } from 'frontend/components/profileEditor/utils';

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
  activeProfile?: Profile;
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
    setLocalProfile(getProfileWithCorrectName(selectedProfile, mode));
  };

  const updateMode = (mode: ProfileEditorMode) => {
    setMode(mode);
    setLocalProfile(getProfileWithCorrectName(selectedProfile, mode));
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
