import { describe, expect, it } from 'vitest'

import { undefined as undefinedSchema } from '../../index'

describe('undefined schema', () => {
  it('accepts undefined values', async () => {
    const schema = undefinedSchema()

    await expect(schema.parse(undefined)).resolves.toBeUndefined()
  })

  it('rejects defined values', async () => {
    const schema = undefinedSchema()
    const report = await schema.safeParse('value')

    expect(report.passed).toBe(false)
    expect('value' in report).toBe(false)
  })
})
