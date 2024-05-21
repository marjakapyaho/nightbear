"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startExpressServer = void 0;
const bodyParser = __importStar(require("body-parser"));
const shared_1 = require("@nightbear/shared");
const logging_1 = require("./logging");
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const lodash_1 = require("lodash");
const shared_2 = require("@nightbear/shared");
function startExpressServer(context, ...handlers) {
    const log = (0, logging_1.extendLogger)(context.log, 'http');
    return new Promise((resolve, reject) => {
        const app = (0, express_1.default)();
        app.use((0, cors_1.default)());
        app.use(bodyParser.json());
        handlers.forEach(([method, path, handler]) => {
            app[method](path, (req, res) => {
                const requestId = req.get('X-Request-ID') || (0, shared_1.generateUuid)(); // use Heroku-style req-ID where available, but fall back to our own
                Promise.resolve(normalizeRequest(requestId, req))
                    .then(request => handlerWithLogging(handler, log)(request, context))
                    .then(response => {
                    const { responseBody, responseStatus } = response;
                    res.status(responseStatus);
                    res.json(responseBody);
                }, () => res.status(500).json({
                    errorMessage: `Nightbear Server Error (see logs for requestId ${requestId})`,
                }));
            });
        });
        const server = app.listen(context.httpPort, () => {
            const address = server.address();
            if (address && typeof address !== 'string') {
                log(`Server listening on ${address.port}`);
                resolve(address.port);
            }
            else {
                reject(new Error('Could not determine assigned port'));
            }
        });
        server.on('error', err => reject(err));
    });
}
exports.startExpressServer = startExpressServer;
function normalizeRequest(requestId, req) {
    return {
        requestId,
        requestMethod: req.method,
        requestPath: req.path,
        requestParams: (0, lodash_1.pickBy)(req.query, lodash_1.isString),
        requestHeaders: (req.headers ? req.headers : {}), // without this cast, TS refuses to accept this because req.headers can be undefined (the ternary will handle that)
        requestBody: req.body,
    };
}
// Wraps the given handler with logging for input/output
function handlerWithLogging(handler, log) {
    return (request, context) => {
        const debug = (0, logging_1.extendLogger)(log, getLoggingNamespace('req', request.requestId), true);
        const then = context.timestamp();
        const duration = () => ((0, shared_2.getTimeMinusTimeMs)(context.timestamp(), then) / 1000).toFixed(3) + ' sec';
        debug(`Incoming request: ${request.requestMethod} ${request.requestPath}\n%O`, request);
        return handler(request, context).then(res => {
            debug(`Outgoing ${res.responseStatus} response:\n%O`, res.responseBody);
            log(`${request.requestMethod} ${request.requestPath} (${duration()}) => SUCCESS`);
            return res;
        }, err => {
            debug(`Outgoing error:\n%O`, err);
            log(`${request.requestMethod} ${request.requestPath} (${duration()}) => FAILURE`);
            return Promise.reject(err);
        });
    };
}
// Transform an UUID into a helpful logging context/namespace
// @example getContextName() => "default-32846a768f5f"
// @example getContextName('request', req.get('X-Request-ID')) => "request-32846a768f5f"
function getLoggingNamespace(label = 'default', uuid) {
    const [id] = (uuid || (0, shared_1.generateUuid)()).split('-');
    return `${label}-${id}`;
}
//# sourceMappingURL=express.js.map