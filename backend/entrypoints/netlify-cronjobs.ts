import debug from 'debug'
import { devDataImport } from '../cronjobs/devDataImport/devDataImport'
import { createNodeContext } from '../utils/api'
import { runCronJobs } from '../utils/cronjobs'
import { consoleLogStream } from '../utils/logging'

debug.log = consoleLogStream // direct log output to where we want it

const context = createNodeContext() // create application runtime context

export default async (_req: Request) => {
  runCronJobs(context, {
    devDataImport,
  })
}
