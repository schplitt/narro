import antfu from '@antfu/eslint-config'

export default antfu({
  type: 'lib',
  typescript: true,
  yaml: true,
  test: true,
  stylistic: true,
  markdown: true,
})
