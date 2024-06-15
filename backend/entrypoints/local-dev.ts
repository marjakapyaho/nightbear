import debug from 'debug'
import routes from '../api/routes'
import cronjobs from '../cronjobs/cronjobs'
import { createNodeContext } from '../utils/api'
import { startCronJobs } from '../utils/cronjobs'
import { startExpressServer } from '../utils/express'
import { consoleLogStream } from '../utils/logging'

// Direct log output to where we want it
debug.log = consoleLogStream

// Create application runtime context
const context = createNodeContext()

// Start serving API requests
void startExpressServer(context, ...routes)

// Start running periodic tasks
void startCronJobs(context, cronjobs)
