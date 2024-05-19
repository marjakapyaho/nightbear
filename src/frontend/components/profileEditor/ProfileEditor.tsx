import React, { useState } from 'react';
import styles from 'frontend/components/profileEditor/ProfileEditor.module.scss';
import { Editor } from 'frontend/components/profileEditor/Editor';
import { Profile } from 'shared/types/profiles';
import { HOUR_IN_MS } from 'shared/utils/calculations';
import { PROFILE_BASE } from 'shared/utils/profiles';
import { map } from 'lodash';

export type ProfileEditorMode = 'activate' | 'edit' | 'create';
export type ModeSettings = {
  label: string;
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
  const [mode, setMode] = useState<ProfileEditorMode>('edit');
  const baseProfile = activeProfile ? activeProfile : PROFILE_BASE;
  const [localProfile, setLocalProfile] = useState<Profile>(baseProfile);
  const [validityInHours, setValidityInHours] = useState(1);

  const editorTabs: Record<ProfileEditorMode, ModeSettings> = {
    activate: {
      label: 'Activate',
      buttonAction: () => activateProfile(localProfile, validityInHours * HOUR_IN_MS),
      validHours: true,
    },
    edit: {
      label: 'Edit',
      buttonAction: () => editProfile(localProfile),
      profileName: true,
      repeatTime: true,
      analyserSettings: true,
    },
    create: {
      label: 'Create',
      buttonAction: () => createProfile(localProfile, validityInHours * HOUR_IN_MS),
      profileName: true,
      repeatTime: true,
      validHours: true,
      analyserSettings: true,
    },
  };

  return (
    <div className={styles.profileEditor}>
      <div className={styles.tabs}>
        {map(editorTabs, (settings: ModeSettings, key: ProfileEditorMode) => (
          <div
            key={key}
            className={`${styles.tab} ${mode === key ? styles.selected : ''}`}
            onClick={() => setMode(key)}
          >
            {settings.label}
          </div>
        ))}
      </div>
      <Editor
        modeSettings={editorTabs[mode]}
        profile={localProfile}
        setProfile={setLocalProfile}
        validityInHours={validityInHours}
        setValidityInHours={setValidityInHours}
        profiles={profiles}
      />
    </div>
  );
};
