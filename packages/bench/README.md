# Spur Benchmarks

Performance benchmarks comparing Spur with other popular validation libraries: Zod, Valibot, and ArkType.

## Benchmark Suites

### Complex Backend Validation
Simulates realistic e-commerce order creation POST body validation with:
- Nested objects (customer, shipping, payment)
- Arrays of complex items with metadata
- Unions for enums (currency, shipping method, payment status)
- Nullable fields
- Optional fields
- String length constraints
- Number range constraints

### Complex Frontend Validation
Simulates realistic user registration form validation with:
- Multi-level nested objects (account, profile, contact preferences)
- Deep nesting (address within contact)
- Boolean fields
- Array of strings with constraints
- Multiple union types
- Optional fields with constraints

## Running Benchmarks

```bash
# Run benchmarks
pnpm bench
```

## Benchmark Variants

Each suite tests 4 Spur configurations + 3 competitors:

### Spur Variants
1. **spur unbuild async** - Schema built on each validation call
2. **spur async** - Pre-built schema (recommended for production)
3. **spur inline unbuild** - Inline export, built on each call
4. **spur inline** - Inline export, pre-built

### Competitors
- **zod** - Synchronous validation
- **valibot** - Synchronous validation
- **arktype** - Synchronous validation

## Test Scenarios

Each library is tested against:
- ✅ **Valid data** - Measures parsing performance with conforming data
- ❌ **Invalid data** - Measures error detection and reporting performance

## Understanding Results

- **ops/sec** - Operations per second (higher is better)
- **Unbuild** tests show schema construction + validation overhead
- **Built** tests show pure validation performance (recommended metric)
- Async tests include Promise overhead but represent real-world usage
