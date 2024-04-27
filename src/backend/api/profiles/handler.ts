import { Context, createResponse, Request, Response } from 'backend/utils/api';
import { mockProfiles } from 'shared/mocks/profiles';

export const getProfiles = (request: Request, context: Context): Response => {
  // TODO
  return createResponse(mockProfiles);
};

export const createProfile = (request: Request, context: Context): Response => {
  const profile = request.requestBody;
  // TODO
  return createResponse(profile);
};
