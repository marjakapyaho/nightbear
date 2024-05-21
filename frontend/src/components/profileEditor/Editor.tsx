import styles from './ProfileEditor.module.scss';
import { AnalyserSettings, Profile } from '@nightbear/shared';
import { InputText } from '../inputText/InputText';
import { InputNumber } from '../inputNumber/InputNumber';
import { ProfileSelector } from '../profileSelector/ProfileSelector';
import { FieldWithLabel } from '../fieldWithLabel/FieldWithLabel';
import { ModeSettings } from './ProfileEditor';

type Props = {
  modeSettings: ModeSettings;
  selectedProfile: Profile;
  updateSelectedProfile: (profile: Profile) => void;
  localProfile: Profile;
  setLocalProfile: (profile: Profile) => void;
  validityInHours: number;
  setValidityInHours: (hours: number) => void;
  profiles: Profile[];
};

type EditableAnalyserSetting = {
  key: keyof AnalyserSettings;
  label: string;
  decimals: number;
  unit?: string;
};

export const Editor = ({
  modeSettings,
  selectedProfile,
  updateSelectedProfile,
  localProfile,
  setLocalProfile,
  validityInHours,
  setValidityInHours,
  profiles,
}: Props) => {
  const {
    label,
    profileSelectionLabel,
    buttonAction,
    profileName,
    repeatTime,
    validHours,
    analyserSettings,
  } = modeSettings;

  const editableAnalyserSettings: EditableAnalyserSetting[] = [
    { key: 'highLevelRel', label: 'High relative', decimals: 1 },
    { key: 'highLevelAbs', label: 'High absolute', decimals: 1 },
    { key: 'highLevelBad', label: 'High bad', decimals: 1 },
    { key: 'lowLevelRel', label: 'Low relative', decimals: 1 },
    { key: 'lowLevelAbs', label: 'Low absolute', decimals: 1 },
    { key: 'timeSinceBgMinutes', label: 'Outdated after', decimals: 0, unit: 'min' },
  ];

  const setAnalyserSetting = (val: number, settingKey: string) =>
    setLocalProfile({
      ...localProfile,
      analyserSettings: {
        ...localProfile.analyserSettings,
        [settingKey]: val,
      },
    });

  return (
    <div className={styles.editor}>
      <FieldWithLabel label={profileSelectionLabel}>
        <ProfileSelector
          profile={selectedProfile}
          setProfile={updateSelectedProfile}
          profiles={profiles}
        />
      </FieldWithLabel>

      {profileName && (
        <FieldWithLabel label="Profile name">
          <InputText
            value={localProfile.profileName || ''}
            setValue={val => setLocalProfile({ ...localProfile, profileName: val || undefined })}
          />
        </FieldWithLabel>
      )}

      <div className={styles.validitySelections}>
        {validHours && (
          <FieldWithLabel label="Valid for" unit="h">
            <InputNumber value={validityInHours} setValue={setValidityInHours} decimals={0} />
          </FieldWithLabel>
        )}

        {repeatTime && (
          <FieldWithLabel label="Repeat time">
            <InputText
              value={localProfile.repeatTimeInLocalTimezone || ''}
              setValue={val =>
                setLocalProfile({ ...localProfile, repeatTimeInLocalTimezone: val || undefined })
              }
            />
          </FieldWithLabel>
        )}
      </div>

      {analyserSettings &&
        editableAnalyserSettings.map(setting => (
          <FieldWithLabel key={String(setting.key)} label={setting.label} unit={setting.unit}>
            <InputNumber
              value={localProfile.analyserSettings[setting.key]}
              setValue={val => setAnalyserSetting(val, String(setting.key))}
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
