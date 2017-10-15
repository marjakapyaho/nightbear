import 'mocha';
import { assert } from 'chai';
import { getStorageKey } from './storage';
import { Carbs, Settings } from './model';

describe('utils/storage', () => {

  describe('getStorageKey()', () => {

    it('works for timeline models', () => {
      const carbs: Carbs = {
        modelType: 'Carbs',
        modelVersion: 1,
        timestamp: 1508092667717, // i.e. Sun Oct 15 2017 21:37:47 GMT+0300 (EEST)
        amount: 10,
        carbsType: 'normal',
      };
      assert.equal(
        getStorageKey(carbs),
        'timeline/2017-10-15T18:37:47.717Z/Carbs',
      );
    });

    it('works for other models', () => {
      const settings: Settings = {
        modelType: 'Settings',
        modelVersion: 1,
        alarmsEnabled: false,
      };
      assert.equal(
        getStorageKey(settings),
        'other/Settings',
      );
    });

  });

});
