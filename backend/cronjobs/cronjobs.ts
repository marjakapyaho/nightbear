import { checks } from './checks/checks'
import { devDataImport } from './devDataImport/devDataImport'
import { dexcomShare } from './dexcom/dexcomShare'
import { profiles } from './profiles/profiles'

export default {
  dexcomShare, // run this before checks()
  profiles,
  devDataImport,
  checks, // run this after dexcomShare()
}
