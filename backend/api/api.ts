import express, { Router } from "express";
import serverless from "serverless-http";
import { handlerWithLogging, normalizeRequest } from 'utils/express';
import { getProfiles } from 'api/profiles/handler';
import { extendLogger } from 'utils/logging';
import { createNodeContext } from 'utils/api';
import { generateUuid } from '@nightbear/shared';

const api = express();
const context = createNodeContext()
const log = extendLogger(context.log, 'http');

const router = Router();
router.get("/get-profiles", async (rawReq, rawRes) => {
  const requestId = rawReq.get('X-Request-ID') || generateUuid(); // use Heroku-style req-ID where available, but fall back to our own
  const nbReq = normalizeRequest(requestId, rawReq)
  const nbHandler = handlerWithLogging(getProfiles, log)
  const nbRes = await nbHandler(nbReq, context)
  rawRes.status(nbRes.responseStatus).json(nbRes.responseBody)
})
api.use("/api/", router);

export const handler = serverless(api);
