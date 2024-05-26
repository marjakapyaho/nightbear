import { createTestContext, truncateDb } from '../../utils/test'
import { beforeEach, describe, expect, it } from 'vitest'
import { mockNow } from '@nightbear/shared'

describe('db/meterEntries', () => {
  const context = createTestContext()

  beforeEach(async () => {
    await truncateDb(context)
  })

  describe('upsert new meter entry', () => {
    it('works', async () => {
      const meterEntry = await context.db.upsertMeterEntry({
        timestamp: mockNow,
        bloodGlucose: 8.5,
      })

      expect(meterEntry.timestamp).toMatch(/^\d+-.*T\d+.*Z$/)
      expect(meterEntry.bloodGlucose).toBe(8.5)
    })
  })
})
