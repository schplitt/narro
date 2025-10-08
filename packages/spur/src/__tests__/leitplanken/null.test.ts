import { describe, expect, it } from 'vitest'

import { null as nullSchema, parse, safeParse } from '../../index'

describe('null schema', () => {
  it('accepts null values', async () => {
    const schema = nullSchema()

    await expect(parse(schema, null)).resolves.toBeNull()
  })

  it('rejects non-null values', async () => {
    const schema = nullSchema()
    const report = await safeParse(schema, 'not-null')

    expect(report.passed).toBe(false)
    expect('value' in report).toBe(false)
  })
})
