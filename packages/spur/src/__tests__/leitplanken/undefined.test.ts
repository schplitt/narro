import { describe, expect, it } from 'vitest'

import { parse, safeParse, undefined as undefinedSchema } from '../../index'

describe('undefined schema', () => {
  it('accepts undefined values', async () => {
    const schema = undefinedSchema()

    await expect(parse(schema, undefined)).resolves.toBeUndefined()
  })

  it('rejects defined values', async () => {
    const schema = undefinedSchema()
    const report = await safeParse(schema, 'value')

    expect(report.passed).toBe(false)
    expect('value' in report).toBe(false)
  })
})
