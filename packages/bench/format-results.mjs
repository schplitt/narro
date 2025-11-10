#!/usr/bin/env node

/**
 * Format Vitest benchmark results into a markdown table for PR comments
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const resultsPath = join(__dirname, 'benchmark-results.json')
const outputPath = join(__dirname, 'report.md')

try {
  const data = readFileSync(resultsPath, 'utf-8')
  const results = JSON.parse(data)

  let markdown = '## 📊 Benchmark Results\n\n'
  markdown += '_Performance comparison of Spur vs Zod, Valibot, and ArkType_\n\n'

  // Parse Vitest benchmark JSON structure
  if (results.files) {
    for (const file of results.files) {
      const fileName = file.filepath.split('/').pop().replace('.bench.ts', '')

      markdown += `<details>\n`
      markdown += `<summary><strong>${fileName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</strong></summary>\n\n`

      for (const group of file.groups) {
        const suiteName = group.fullName.split(' > ').slice(1).join(' > ')

        markdown += `### ${suiteName}\n\n`
        markdown += '| Library | ops/sec | Mean (ms) | vs Fastest |\n'
        markdown += '|---------|---------|----------|------------|\n'

        // Sort by ops/sec descending
        const sortedBenchmarks = [...group.benchmarks].sort((a, b) => b.hz - a.hz)
        const fastestHz = sortedBenchmarks[0].hz

        for (let i = 0; i < sortedBenchmarks.length; i++) {
          const bench = sortedBenchmarks[i]
          const opsPerSec = bench.hz.toLocaleString('en-US', { maximumFractionDigits: 0 })
          const meanMs = (bench.mean * 1000).toFixed(4)

          let comparison = ''
          if (i === 0) {
            comparison = '**fastest**'
          }
          else {
            const percentSlower = ((fastestHz / bench.hz - 1) * 100).toFixed(1)
            const timesFaster = (fastestHz / bench.hz).toFixed(2)
            comparison = `${timesFaster}x slower (${percentSlower}%)`
          }

          markdown += `| ${bench.name} | ${opsPerSec} | ${meanMs} | ${comparison} |\n`
        }

        markdown += '\n'
      }

      markdown += `</details>\n\n`
    }
  }

  markdown += '\n---\n'
  markdown += '_💡 Higher ops/sec is better. Lower mean time is better._\n'

  writeFileSync(outputPath, markdown)
  // eslint-disable-next-line no-console
  console.log('✅ Benchmark report generated:', outputPath)
}
catch (error) {
  console.error('❌ Failed to generate benchmark report:', error.message)

  // Create fallback report
  let fallback = '## 📊 Benchmark Results\n\n'
  fallback += '⚠️ Could not parse benchmark results.\n\n'
  fallback += 'Please check the workflow logs for raw benchmark output.\n'

  writeFileSync(outputPath, fallback)
}
