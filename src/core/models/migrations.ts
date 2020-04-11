import { Model } from 'core/models/model';
import { is } from 'core/models/utils';
import { assertExhausted } from 'server/utils/types';

// When bumping the MODEL_VERSION in src/core/models/model.ts, add it here, then add the necessary migration below
export type ModelVersion = 1 | 2;

export function migrateModelIfNeeded(model: Model, version: ModelVersion): Model {
  switch (version) {
    case 1:
      // At 1->2, "BAD" versions of LOW & HIGH were added
      if (is('SavedProfile')(model) || is('ActiveProfile')(model)) {
        return {
          ...model,
          analyserSettings: {
            ...model.analyserSettings,
            LOW_LEVEL_BAD: model.analyserSettings.LOW_LEVEL_ABS, // LOW_LEVEL_BAD didn't exist on this version -> base it on LOW_LEVEL_ABS
            HIGH_LEVEL_BAD: model.analyserSettings.HIGH_LEVEL_ABS, // ^ ditto, but for HIGH_*
          },
          alarmSettings: {
            ...model.alarmSettings,
            BAD_HIGH: { ...model.alarmSettings.HIGH }, // BAD_HIGH didn't exist on this version -> base it on HIGH
            BAD_LOW: { ...model.alarmSettings.LOW }, // ^ ditto, but for BAD_LOW
          },
        };
      }
      return model;
    case 2:
      // this is the current version -> no need to migrate anything
      return model;
    default:
      // Ensure that all versions have a handler
      return assertExhausted(version);
  }
}
