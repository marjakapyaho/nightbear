import React, { useState } from 'react';
import styles from './Config.module.scss';
import { Profile } from 'shared/types/profiles';

type Props = {
  activeProfile: Profile;
  createProfile: (profile: Profile) => void;
};

export const CreateProfile = ({ activeProfile, createProfile }: Props) => {
  const [localProfile, setLocalProfile] = useState<Profile>(activeProfile);

  return (
    <div className={styles.createProfile}>
      <div className={styles.row}>
        <div className={styles.label}>Profile name</div>
        <div className={styles.field}>
          <input
            className={styles.input}
            value={localProfile.profileName}
            onChange={event =>
              setLocalProfile({ ...localProfile, profileName: event.target.value })
            }
          />
        </div>
      </div>
      <div>
        <button className={styles.createButton} onClick={() => createProfile(localProfile)}>
          Create
        </button>
      </div>
    </div>
  );
};
