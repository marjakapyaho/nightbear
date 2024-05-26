import { createTestContext, truncateDb } from '../../utils/test'
import { beforeEach, describe, expect, it } from 'vitest'
import { mockNow } from '@nightbear/shared'

describe('db/insulinEntries', () => {
  const context = createTestContext()

  beforeEach(async () => {
    await truncateDb(context)
  })

  describe('upsert new insulin entry', () => {
    it('works', async () => {
      const insulinEntry = await context.db.upsertInsulinEntry({
        timestamp: mockNow,
        amount: 5,
        type: 'FAST',
      })

      expect(insulinEntry.timestamp).toMatch(/^\d+-.*T\d+.*Z$/)
      expect(insulinEntry.amount).toBe(5)
      expect(insulinEntry.type).toBe('FAST')
    })
  })
})
