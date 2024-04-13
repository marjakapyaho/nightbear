import { Context, createResponse, Request, Response } from 'backend/utils/api';
import { mockProfiles } from 'shared/mocks/profiles';

export const getActiveProfile = (request: Request, context: Context): Response => {
  return createResponse(mockProfiles[0]);
};

export const getProfiles = (request: Request, context: Context): Response => {
  return createResponse(mockProfiles);
};

export const createProfile = (request: Request, context: Context): Response => {
  return createResponse(mockProfiles[0]);
};
