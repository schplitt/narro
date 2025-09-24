import { string } from 'spur'

// Make functions available globally for the HTML buttons
window.testStringSchema = testStringSchema
window.testStringWithLength = testStringWithLength
window.testUserInput = testUserInput

async function testStringSchema() {
  const resultDiv = document.getElementById('string-test-result')

  try {
    console.log('Creating string schema...')
    const stringSchema = string()
    console.log('String schema created:', stringSchema)

    console.log('Building schema...')
    const builtSchema = await stringSchema['@build']()
    console.log('Schema built:', builtSchema)

    // Test with valid string
    const validResult = builtSchema.safeParse('hello world')
    console.log('Valid string result:', validResult)

    // Test with invalid input
    const invalidResult = builtSchema.safeParse(123)
    console.log('Invalid input result:', invalidResult)

    // Test parse method
    try {
      const parsed = builtSchema.parse('valid string')
      console.log('Parse successful:', parsed)
    }
    catch (error) {
      console.log('Parse error (unexpected):', error)
    }

    try {
      const parsed = builtSchema.parse(456)
      console.log('Parse should have failed but got:', parsed)
    }
    catch (error) {
      console.log('Parse correctly failed:', error.message)
    }

    resultDiv.className = 'test-section success'
    resultDiv.innerHTML = `
      <h3>✅ String Schema Test Results</h3>
      <pre>Valid string: ${JSON.stringify(validResult, null, 2)}</pre>
      <pre>Invalid input (number): ${JSON.stringify(invalidResult, null, 2)}</pre>
      <p>Dynamic imports are working! Schema validation is functional.</p>
    `
  }
  catch (error) {
    console.error('Error in testStringSchema:', error)
    resultDiv.className = 'test-section error'
    resultDiv.innerHTML = `
      <h3>❌ String Schema Test Failed</h3>
      <pre>Error: ${error.message}</pre>
      <pre>Stack: ${error.stack}</pre>
    `
  }
}

async function testStringWithLength() {
  const resultDiv = document.getElementById('length-test-result')

  try {
    console.log('Creating string schema with length validation...')
    const stringSchema = string().minLength(3).maxLength(10)
    console.log('String schema with length created:', stringSchema)

    console.log('Building schema...')
    const builtSchema = await stringSchema['@build']()
    console.log('Schema built:', builtSchema)

    // Test with valid length
    const validResult = builtSchema.safeParse('hello')
    console.log('Valid length result:', validResult)

    // Test with too short
    const tooShortResult = builtSchema.safeParse('hi')
    console.log('Too short result:', tooShortResult)

    // Test with too long
    const tooLongResult = builtSchema.safeParse('this is way too long')
    console.log('Too long result:', tooLongResult)

    // Test with non-string
    const nonStringResult = builtSchema.safeParse(123)
    console.log('Non-string result:', nonStringResult)

    resultDiv.className = 'test-section success'
    resultDiv.innerHTML = `
      <h3>✅ String Length Validation Results</h3>
      <pre>Valid (5 chars): ${JSON.stringify(validResult, null, 2)}</pre>
      <pre>Too short (2 chars): ${JSON.stringify(tooShortResult, null, 2)}</pre>
      <pre>Too long (20 chars): ${JSON.stringify(tooLongResult, null, 2)}</pre>
      <pre>Non-string: ${JSON.stringify(nonStringResult, null, 2)}</pre>
      <p>Length constraints with dynamic imports working perfectly!</p>
    `
  }
  catch (error) {
    console.error('Error in testStringWithLength:', error)
    resultDiv.className = 'test-section error'
    resultDiv.innerHTML = `
      <h3>❌ String Length Test Failed</h3>
      <pre>Error: ${error.message}</pre>
      <pre>Stack: ${error.stack}</pre>
    `
  }
}

async function testUserInput() {
  const resultDiv = document.getElementById('interactive-result')
  const userInput = document.getElementById('user-input').value

  try {
    // Create a schema with multiple constraints
    const stringSchema = string().minLength(2).maxLength(50)
    const builtSchema = await stringSchema['@build']()

    const result = builtSchema.safeParse(userInput)

    if (result.passed) {
      resultDiv.className = 'test-section success'
      resultDiv.innerHTML = `
        <h3>✅ Input Validation Passed</h3>
        <p>Input: "${userInput}"</p>
        <pre>${JSON.stringify(result, null, 2)}</pre>
      `
    }
    else {
      resultDiv.className = 'test-section error'
      resultDiv.innerHTML = `
        <h3>❌ Input Validation Failed</h3>
        <p>Input: "${userInput}"</p>
        <pre>${JSON.stringify(result, null, 2)}</pre>
        <p>Try entering text between 2-50 characters.</p>
      `
    }
  }
  catch (error) {
    console.error('Error in testUserInput:', error)
    resultDiv.className = 'test-section error'
    resultDiv.innerHTML = `
      <h3>❌ Test Failed</h3>
      <pre>Error: ${error.message}</pre>
    `
  }
}

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', async () => {
  console.log('DOM loaded, initializing...')

  try {
    // Test if we can load the module
    console.log('Testing module import...')
    const testSchema = string()
    console.log('Module imported successfully:', testSchema)

    document.getElementById('loading').style.display = 'none'
    document.getElementById('tests').style.display = 'block'

    console.log('Playground ready!')
  }
  catch (error) {
    console.error('Failed to initialize:', error)
    document.getElementById('loading').innerHTML = `
      <div class="test-section error">
        <h3>❌ Failed to Initialize</h3>
        <pre>Error: ${error.message}</pre>
        <p>Dynamic imports may not be working correctly.</p>
      </div>
    `
  }
})
