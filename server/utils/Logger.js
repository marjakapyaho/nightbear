import winston from 'winston';
import { Papertrail } from 'winston-papertrail'; // requiring `winston-papertrail` will expose `winston.transports.Papertrail`
import _ from 'lodash';

// @example const createLogger = new Logger(true, 'logs.papertrailapp.com:123');
//          const log = createLogger('MyModule');
//          log('something happened:', { foo: 123 });
export default function(consoleOutput = true, papertrailUrl = null) {

    var logger = new winston.Logger();

    if (consoleOutput) {

        var console = new winston.transports.Console({
            timestamp: () => new Date().toISOString(),
            colorize: true
        });

        logger.add(() => console);

    }

    if (papertrailUrl) {

        const [ host, port ] = papertrailUrl.split(':');
        const papertrail = new winston.transports.Papertrail({ // @see https://github.com/kenperkins/winston-papertrail
            host,
            port,
            program: 'nightbear-server',
            exceptionsLevel: 'error'
        });
        papertrail.exceptionsLevel = 'error'; // @see https://github.com/kenperkins/winston-papertrail/issues/40

        winston.handleExceptions(papertrail); // @see https://github.com/winstonjs/winston#handling-uncaught-exceptions-with-winston

        logger.add(() => papertrail);

    }

    return function(rawLabel) {

        const label = rawLabel.replace(/.*\/([\w-]+).*/, '$1');  // e.g. "/path/to/MyComponent.js" becomes "MyComponent"
        const flatten = ctx => ctx.length === 0 ? null : (ctx.length === 1 ? ctx[0] : ctx);
        const internal = (level, message, ...context) => { logger.log(level, `[${label}] ${message}`, flatten(context)); };

        return _.extend(internal.bind(null, 'info'), {
            error: internal.bind(null, 'error')
        });

    };

}
