import { describe, expect, it } from 'vitest'

import { parse, safeParse } from '../../index'
import { array } from '../../leitplanken/array'
import { number } from '../../leitplanken/number'
import { string } from '../../leitplanken/string'

describe('array schema', () => {
  it('parses arrays when every element matches the child schema', async () => {
    const schema = array(string().minLength(2))

    await expect(parse(schema, ['hi', 'there'])).resolves.toEqual(['hi', 'there'])
  })

  it('fails when at least one element violates the child schema', async () => {
    const schema = array(number().min(0))

    const report = await safeParse(schema, [1, -1])

    expect(report.passed).toBe(false)
  })

  it('supports optional modifier on the array schema', async () => {
    const schema = array(string()).optional()

    const report = await safeParse(schema, undefined)
    expect(report.passed).toBe(true)
    expect(report.value).toBeUndefined()
  })

  it('enforces array-level minLength constraint', async () => {
    const schema = array(string()).minLength(2)

    const report = await safeParse(schema, ['only-one'])
    expect(report.passed).toBe(false)
  })

  it('allows transforming the parsed array result', async () => {
    const schema = array(number()).transform(values => values.reduce((total, value) => total + value, 0))

    await expect(parse(schema, [1, 2, 3])).resolves.toBe(6)
  })
})
