import React from 'react';
import styles from './ProfileEditor.module.scss';
import { AnalyserSettings, Profile } from 'shared/types/profiles';
import { InputText } from 'frontend/components/inputText/InputText';
import { InputNumber } from 'frontend/components/inputNumber/InputNumber';
import { ProfileSelector } from 'frontend/components/profileSelector/ProfileSelector';
import { FieldWithLabel } from 'frontend/components/fieldWithLabel/FieldWithLabel';
import { ModeSettings } from './ProfileEditor';

type Props = {
  modeSettings: ModeSettings;
  profile: Profile;
  setProfile: (profile: Profile) => void;
  validityInHours: number;
  setValidityInHours: (hours: number) => void;
  profiles: Profile[];
};

type EditableAnalyserSetting = {
  key: keyof AnalyserSettings;
  label: string;
  decimals: number;
};

export const Editor = ({
  modeSettings,
  profile,
  setProfile,
  validityInHours,
  setValidityInHours,
  profiles,
}: Props) => {
  const { label, buttonAction, profileName, repeatTime, validHours, analyserSettings } =
    modeSettings;

  const editableAnalyserSettings: EditableAnalyserSetting[] = [
    { key: 'highLevelRel', label: 'High level rel', decimals: 1 },
    { key: 'highLevelAbs', label: 'High level abs', decimals: 1 },
    { key: 'highLevelBad', label: 'High level bad', decimals: 1 },
    { key: 'lowLevelRel', label: 'Low level rel', decimals: 1 },
    { key: 'lowLevelAbs', label: 'Low level abs', decimals: 1 },
    { key: 'timeSinceBgMinutes', label: 'Time since bg min', decimals: 0 },
  ];

  const setAnalyserSetting = (val: number, settingKey: string) =>
    setProfile({
      ...profile,
      analyserSettings: {
        ...profile.analyserSettings,
        [settingKey]: val,
      },
    });

  return (
    <div className={styles.editor}>
      <FieldWithLabel label="Select profile">
        <ProfileSelector profile={profile} setProfile={setProfile} profiles={profiles} />
      </FieldWithLabel>

      {profileName && (
        <FieldWithLabel label="Profile name">
          <InputText
            value={profile.profileName || ''}
            setValue={val => setProfile({ ...profile, profileName: val || undefined })}
          />
        </FieldWithLabel>
      )}

      {repeatTime && (
        <FieldWithLabel label="Repeat time">
          <InputText
            value={profile.repeatTimeInLocalTimezone || ''}
            setValue={val =>
              setProfile({ ...profile, repeatTimeInLocalTimezone: val || undefined })
            }
          />
        </FieldWithLabel>
      )}

      {validHours && (
        <FieldWithLabel label="Repeat time">
          <InputNumber value={validityInHours} setValue={setValidityInHours} decimals={0} />
        </FieldWithLabel>
      )}

      {analyserSettings &&
        editableAnalyserSettings.map(setting => (
          <FieldWithLabel key={setting.key} label="Repeat time">
            <InputNumber
              value={profile.analyserSettings[setting.key]}
              setValue={val => setAnalyserSetting(val, setting.key)}
              decimals={setting.decimals}
            />
          </FieldWithLabel>
        ))}

      <div>
        <button className={styles.actionButton} onClick={buttonAction}>
          {label}
        </button>
      </div>
    </div>
  );
};
