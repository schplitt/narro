import { describe, expect, it } from 'vitest'

import { null as nullSchema } from '../../index'

describe('null schema', () => {
  it('accepts null values', async () => {
    const schema = nullSchema()

    await expect(schema.parse(null)).resolves.toBeNull()
  })

  it('rejects non-null values', async () => {
    const schema = nullSchema()
    const report = await schema.safeParse('not-null')

    expect(report.success).toBe(false)
    expect('data' in report).toBe(false)
  })
})
