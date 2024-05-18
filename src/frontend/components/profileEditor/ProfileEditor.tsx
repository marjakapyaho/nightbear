import React, { useState } from 'react';
import styles from 'frontend/components/profileEditor/ProfileEditor.module.scss';
import { CreateProfile } from 'frontend/components/createProfile/CreateProfile';
import { Profile } from 'shared/types/profiles';

export type ProfileEditorMode = 'activate' | 'edit' | 'create';

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
  const editorTabs: { key: ProfileEditorMode; label: string }[] = [
    { key: 'activate', label: 'Activate' },
    { key: 'edit', label: 'Edit' },
    { key: 'create', label: 'Create' },
  ];

  return (
    <div className={styles.profileEditor}>
      <div className={styles.tabs}>
        {editorTabs.map(tab => (
          <div
            key={tab.key}
            className={`${styles.tab} ${mode === tab.key ? styles.selected : ''}`}
            onClick={() => setMode(tab.key)}
          >
            {tab.label}
          </div>
        ))}
      </div>
      <div className={styles.tabContent}>
        <CreateProfile
          mode={mode}
          activeProfile={activeProfile}
          activateProfile={activateProfile}
          createProfile={createProfile}
          editProfile={editProfile}
          profiles={profiles}
        />
      </div>
    </div>
  );
};
