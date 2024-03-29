import { Model } from 'shared/models/model';
import { is } from 'shared/models/utils';

// When bumping the MODEL_VERSION in src/shared/models/model.ts, add it here, then add the necessary migration below
export type ModelVersion = 1 | 2 | 3;

export function migrateModelIfNeeded(model: Model, version: ModelVersion): Model {
  // At 1->2, "BAD" versions of LOW & HIGH were added
  if (version < 2 && (is('SavedProfile')(model) || is('ActiveProfile')(model))) {
    model = {
      ...model,
      analyserSettings: {
        ...model.analyserSettings,
        LOW_LEVEL_BAD: 3, // LOW_LEVEL_BAD didn't exist on this version -> set it to a sensible default
        HIGH_LEVEL_BAD: 15, // ^ ditto
      },
      alarmSettings: {
        ...model.alarmSettings,
        BAD_HIGH: { ...model.alarmSettings.HIGH }, // BAD_HIGH didn't exist on this version -> base it on HIGH
        BAD_LOW: { ...model.alarmSettings.LOW }, // ^ ditto
      },
    };
  }
  // At 2->3, added a new setting
  if (version < 3 && (is('SavedProfile')(model) || is('ActiveProfile')(model))) {
    model = {
      ...model,
      analyserSettings: {
        ...model.analyserSettings,
        HIGH_CORRECTION_SUPPRESSION_WINDOW: 135, // 2 hours and 15 min
      },
    };
  }
  return model;
}
