import 'mocha';
import { assert } from 'chai';
import { Model, Carbs, Settings } from '../utils/model';
import { Storage } from './storage';

// Asserts deep equality of 2 Models, ignoring their metadata
function assertEqualWithoutMeta(actual: Model, expected: Model): void {
  assert.deepEqual(
    Object.assign({}, actual, { modelMeta: undefined }),
    Object.assign({}, expected, { modelMeta: undefined }),
  );
}

export const MODEL_1: Carbs = {
  modelType: 'Carbs',
  timestamp: 1508092667717, // i.e. Sun Oct 15 2017 21:37:47 GMT+0300 (EEST)
  amount: 10,
  carbsType: 'normal',
};

export const MODEL_2: Settings = {
  modelType: 'Settings',
  alarmsEnabled: false,
};

export function storageTestSuite(storage: Storage) {

  let timestamp: number;
  let model: Carbs;

  function findModel(models: Model[]): Model {
    const found = models.find(m => m.modelType === model.modelType && m.timestamp === model.timestamp);
    if (found) return found;
    throw new Error(`Couldn't find the Model this test case is operating on`);
  }

  beforeEach(() => {
    timestamp = Date.now(); // we need to have unique timestamps, so each Model is unique
    model = { ...MODEL_1, timestamp };
  });

  it('saves models', () => {
    return storage.saveModel(model)
      .then(actual => assertEqualWithoutMeta(actual, model));
  });

  it('loads timeline models', () => {
    return storage.saveModel(model)
      .then(() => storage.loadTimelineModels(1000 * 60))
      .then(loadedModels => assertEqualWithoutMeta(findModel(loadedModels), model));
  });

  it('loads global models', () => {
    return storage.saveModel(MODEL_2)
      .catch(() => null) // if the Model already existed, this will fail, but for the purposes of this test, it doesn't matter
      .then(() => storage.loadGlobalModels())
      .then(loadedModels => assertEqualWithoutMeta(
        loadedModels.find(model => model.modelType === MODEL_2.modelType) as any, // cheating is allowed in test code
        MODEL_2,
      ));
  });

  it('saves models that have been saved before', () => {
    assert.equal(model.amount, 10); // check baseline assumptions
    return storage.saveModel(model)
      .then(savedModel => ({ ...savedModel, amount: 123 }))
      .then(storage.saveModel)
      .then(savedModel => assertEqualWithoutMeta(
        savedModel,
        { ...model, amount: 123 },
      ));
  });

  it('saves models that have been loaded before', () => {
    assert.equal(model.amount, 10); // check baseline assumptions
    return storage.saveModel(model)
      .then(() => storage.loadTimelineModels(1000 * 60))
      .then(loadedModels => findModel(loadedModels))
      .then(loadedModel => ({ ...loadedModel, amount: 123 }))
      .then(storage.saveModel)
      .then(savedModel => assertEqualWithoutMeta(
        savedModel,
        { ...model, amount: 123 },
      ));
  });

}
