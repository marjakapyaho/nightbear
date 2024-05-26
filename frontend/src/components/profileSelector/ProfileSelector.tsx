import styles from './ProfileSelector.module.scss'
import { Profile } from '@nightbear/shared'

type Props = {
  profile: Profile
  setProfile: (profile: Profile) => void
  profiles: Profile[]
}

export const ProfileSelector = ({ profile, setProfile, profiles }: Props) => {
  const onChangeProfile = (profileId: string) => {
    const selectedBaseProfile = profiles.find(profile => profile.id === profileId)
    selectedBaseProfile && setProfile(selectedBaseProfile)
  }

  return (
    <select
      className={styles.profileSelector}
      name="profileSelector"
      id="profileSelector"
      defaultValue={profile.id || ''}
      onChange={event => onChangeProfile(event.target.value)}
    >
      {profiles.map(profile => (
        <option key={profile.id} value={profile.id}>
          {profile.profileName || 'Temporary'}
        </option>
      ))}
    </select>
  )
}
