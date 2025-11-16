#!/usr/bin/env node

/**
 * Format Vitest benchmark results into a markdown table for PR comments
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const resultsPath = join(__dirname, 'benchmark-results.json')
const mainBenchPath = process.env.MAIN_BENCHMARK_PATH
  ? join(__dirname, process.env.MAIN_BENCHMARK_PATH)
  : null
const outputPath = join(__dirname, 'report.md')

try {
  const data = readFileSync(resultsPath, 'utf-8')
  const results = JSON.parse(data)

  // Try to load main benchmark results
  let mainResults = null
  if (mainBenchPath) {
    try {
      const mainData = readFileSync(mainBenchPath, 'utf-8')
      mainResults = JSON.parse(mainData)
    }
    catch {
      // No main results available
    }
  }

  let markdown = '_Performance comparison of Narro vs Zod, Valibot, and ArkType_\n\n'

  // Build lookup for main results
  const mainMap = new Map()
  if (mainResults?.files) {
    for (const file of mainResults.files) {
      for (const group of file.groups) {
        for (const bench of group.benchmarks) {
          const key = `${file.filepath}::${group.fullName}::${bench.name}`
          mainMap.set(key, bench)
        }
      }
    }
  }

  // Parse Vitest benchmark JSON structure
  if (results.files) {
    for (const file of results.files) {
      const fileName = file.filepath.split('/').pop().replace('.bench.ts', '')

      markdown += `<details>\n`
      markdown += `<summary><strong>${fileName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</strong></summary>\n\n`

      for (const group of file.groups) {
        const suiteName = group.fullName.split(' > ').slice(1).join(' > ')

        markdown += `### ${suiteName}\n\n`

        const headers = mainResults
          ? '| Library | ops/sec | Mean (ms) | vs Fastest | vs Main |\n|---------|---------|----------|------------|----------|\n'
          : '| Library | ops/sec | Mean (ms) | vs Fastest |\n|---------|---------|----------|------------|\n'
        markdown += headers

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

          let row = `| ${bench.name} | ${opsPerSec} | ${meanMs} | ${comparison} |`

          // Add comparison with main if available
          if (mainResults) {
            const mainKey = `${file.filepath}::${group.fullName}::${bench.name}`
            const mainBench = mainMap.get(mainKey)

            let mainComparison = '-'
            if (mainBench) {
              const change = ((bench.hz / mainBench.hz - 1) * 100).toFixed(1)
              const changeNum = Number.parseFloat(change)
              if (changeNum > 5) {
                mainComparison = `🟢 +${change}%`
              }
              else if (changeNum < -5) {
                mainComparison = `🔴 ${change}%`
              }
              else {
                mainComparison = `${change >= 0 ? '+' : ''}${change}%`
              }
            }
            row += ` ${mainComparison} |`
          }

          markdown += `${row}\n`
        }

        markdown += '\n'
      }

      markdown += `</details>\n\n`
    }
  }

  markdown += '\n---\n'
  markdown += '_💡 Higher ops/sec is better. Lower mean time is better._\n'
  if (mainResults) {
    markdown += '_🔵 vs Main: Shows performance change from main branch. 🟢 >5% faster, 🔴 >5% slower._\n'
  }

  writeFileSync(outputPath, markdown)
  // eslint-disable-next-line no-console
  console.log('✅ Benchmark report generated:', outputPath)
}
catch (error) {
  console.error('❌ Failed to generate benchmark report:', error.message)

  // Create fallback report
  let fallback = '⚠️ Could not parse benchmark results.\n\n'
  fallback += 'Please check the workflow logs for raw benchmark output.\n'

  writeFileSync(outputPath, fallback)
}
