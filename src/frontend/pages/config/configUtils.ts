import { ActiveProfile, SavedProfile } from 'shared/models/model';
import { getActivationTimestamp, humanReadableShortTime } from 'shared/utils/time';
import { is, lastModel } from 'shared/models/utils';
import { DataState } from 'frontend/data/data/state';

export const getAutoActTime = (profile: SavedProfile): string => {
  if (!profile.activatedAtUtc) return '';
  return humanReadableShortTime(getActivationTimestamp(profile.activatedAtUtc));
};

export const getProfiles = (dataState: DataState) =>
  dataState.globalModels.filter(is('SavedProfile')).filter(profile => profile.profileName !== 'OFF');

export const getActiveProfile = (dataState: DataState) =>
  dataState.timelineModels.filter(is('ActiveProfile')).find(lastModel);

export const isProfileActive = (profile: SavedProfile, activeProfile?: ActiveProfile) =>
  profile.profileName === activeProfile?.profileName;
