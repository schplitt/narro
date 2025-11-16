import { type } from 'arktype'
import { array, literal, number, object, string, union } from 'narro'
import { array as arrayInline, literal as literalInline, number as numberInline, object as objectInline, string as stringInline, union as unionInline } from 'narro/inline'
import * as v from 'valibot'
import { bench, describe } from 'vitest'
import { z } from 'zod'

// Realistic backend POST body validation - E-commerce order creation
const validOrder = {
  customer: {
    id: 'cus_1234567890',
    email: 'customer@example.com',
    name: 'John Doe',
    phone: '+1234567890',
  },
  items: [
    {
      productId: 'prod_abc123',
      sku: 'SHIRT-L-BLUE',
      name: 'Blue Cotton Shirt',
      quantity: 2,
      price: 29.99,
      currency: 'USD',
      metadata: {
        size: 'L',
        color: 'blue',
        material: 'cotton',
      },
    },
    {
      productId: 'prod_def456',
      sku: 'JEANS-32-BLACK',
      name: 'Black Denim Jeans',
      quantity: 1,
      price: 79.99,
      currency: 'USD',
      metadata: {
        size: '32',
        color: 'black',
        material: 'denim',
      },
    },
  ],
  shipping: {
    method: 'express',
    address: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'US',
    },
    trackingNumber: null,
  },
  payment: {
    method: 'card',
    status: 'pending',
    amount: 139.97,
    currency: 'USD',
  },
  notes: 'Please deliver after 5 PM',
  tags: ['priority', 'gift-wrap'],
}

const invalidOrder = {
  customer: {
    id: 'cus_1234567890',
    email: 'invalid-email',
    name: 'John Doe',
    phone: '+1234567890',
  },
  items: [
    {
      productId: 'prod_abc123',
      sku: 'SHIRT-L-BLUE',
      name: 'Blue Cotton Shirt',
      quantity: -2, // Invalid: negative quantity
      price: 29.99,
      currency: 'USD',
      metadata: {
        size: 'L',
        color: 'blue',
        material: 'cotton',
      },
    },
  ],
  shipping: {
    method: 'invalid-method', // Invalid: not a valid shipping method
    address: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'US',
    },
    trackingNumber: null,
  },
  payment: {
    method: 'card',
    status: 'pending',
    amount: 139.97,
    currency: 'USD',
  },
  notes: 'Please deliver after 5 PM',
  tags: ['priority', 'gift-wrap'],
}

// Narro async schema
const narroAsyncUnbuild = object({
  customer: object({
    id: string().minLength(10),
    email: string().minLength(5),
    name: string().minLength(2).maxLength(100),
    phone: string().minLength(10).maxLength(20),
  }),
  items: array(
    object({
      productId: string().minLength(5),
      sku: string().minLength(3),
      name: string().minLength(1).maxLength(200),
      quantity: number().min(1).max(1000),
      price: number().min(0),
      currency: union([literal('USD'), literal('EUR'), literal('GBP')]),
      metadata: object({
        size: string(),
        color: string(),
        material: string(),
      }),
    }),
  ).minLength(1).maxLength(100),
  shipping: object({
    method: union([literal('standard'), literal('express'), literal('overnight')]),
    address: object({
      street: string().minLength(5),
      city: string().minLength(2),
      state: string().minLength(2).maxLength(3),
      zipCode: string().minLength(5).maxLength(10),
      country: string().minLength(2).maxLength(3),
    }),
    trackingNumber: string().nullable(),
  }),
  payment: object({
    method: union([literal('card'), literal('paypal'), literal('bank_transfer')]),
    status: union([literal('pending'), literal('completed'), literal('failed')]),
    amount: number().min(0),
    currency: union([literal('USD'), literal('EUR'), literal('GBP')]),
  }),
  notes: string().optional(),
  tags: array(string()).optional(),
})

const narroAsyncBuilt = await narroAsyncUnbuild.build()

const narroInlineUnbuild = objectInline({
  customer: objectInline({
    id: stringInline().minLength(10),
    email: stringInline().minLength(5),
    name: stringInline().minLength(2).maxLength(100),
    phone: stringInline().minLength(10).maxLength(20),
  }),
  items: arrayInline(
    objectInline({
      productId: stringInline().minLength(5),
      sku: stringInline().minLength(3),
      name: stringInline().minLength(1).maxLength(200),
      quantity: numberInline().min(1).max(1000),
      price: numberInline().min(0),
      currency: unionInline([literalInline('USD'), literalInline('EUR'), literalInline('GBP')]),
      metadata: objectInline({
        size: stringInline(),
        color: stringInline(),
        material: stringInline(),
      }),
    }),
  ).minLength(1).maxLength(100),
  shipping: objectInline({
    method: unionInline([literalInline('standard'), literalInline('express'), literalInline('overnight')]),
    address: objectInline({
      street: stringInline().minLength(5),
      city: stringInline().minLength(2),
      state: stringInline().minLength(2).maxLength(3),
      zipCode: stringInline().minLength(5).maxLength(10),
      country: stringInline().minLength(2).maxLength(3),
    }),
    trackingNumber: stringInline().nullable(),
  }),
  payment: objectInline({
    method: unionInline([literalInline('card'), literalInline('paypal'), literalInline('bank_transfer')]),
    status: unionInline([literalInline('pending'), literalInline('completed'), literalInline('failed')]),
    amount: numberInline().min(0),
    currency: unionInline([literalInline('USD'), literalInline('EUR'), literalInline('GBP')]),
  }),
  notes: stringInline().optional(),
  tags: arrayInline(stringInline()).optional(),
})

// Narro inline schema
const narroInlineBuilt = await objectInline({
  customer: objectInline({
    id: stringInline().minLength(10),
    email: stringInline().minLength(5),
    name: stringInline().minLength(2).maxLength(100),
    phone: stringInline().minLength(10).maxLength(20),
  }),
  items: arrayInline(
    objectInline({
      productId: stringInline().minLength(5),
      sku: stringInline().minLength(3),
      name: stringInline().minLength(1).maxLength(200),
      quantity: numberInline().min(1).max(1000),
      price: numberInline().min(0),
      currency: unionInline([literalInline('USD'), literalInline('EUR'), literalInline('GBP')]),
      metadata: objectInline({
        size: stringInline(),
        color: stringInline(),
        material: stringInline(),
      }),
    }),
  ).minLength(1).maxLength(100),
  shipping: objectInline({
    method: unionInline([literalInline('standard'), literalInline('express'), literalInline('overnight')]),
    address: objectInline({
      street: stringInline().minLength(5),
      city: stringInline().minLength(2),
      state: stringInline().minLength(2).maxLength(3),
      zipCode: stringInline().minLength(5).maxLength(10),
      country: stringInline().minLength(2).maxLength(3),
    }),
    trackingNumber: stringInline().nullable(),
  }),
  payment: objectInline({
    method: unionInline([literalInline('card'), literalInline('paypal'), literalInline('bank_transfer')]),
    status: unionInline([literalInline('pending'), literalInline('completed'), literalInline('failed')]),
    amount: numberInline().min(0),
    currency: unionInline([literalInline('USD'), literalInline('EUR'), literalInline('GBP')]),
  }),
  notes: stringInline().optional(),
  tags: arrayInline(stringInline()).optional(),
}).build()

// Zod schema
const zodSchema = z.object({
  customer: z.object({
    id: z.string().min(10),
    email: z.string().min(5),
    name: z.string().min(2).max(100),
    phone: z.string().min(10).max(20),
  }),
  items: z.array(
    z.object({
      productId: z.string().min(5),
      sku: z.string().min(3),
      name: z.string().min(1).max(200),
      quantity: z.number().min(1).max(1000),
      price: z.number().min(0),
      currency: z.union([z.literal('USD'), z.literal('EUR'), z.literal('GBP')]),
      metadata: z.object({
        size: z.string(),
        color: z.string(),
        material: z.string(),
      }),
    }),
  ).min(1).max(100),
  shipping: z.object({
    method: z.union([z.literal('standard'), z.literal('express'), z.literal('overnight')]),
    address: z.object({
      street: z.string().min(5),
      city: z.string().min(2),
      state: z.string().min(2).max(3),
      zipCode: z.string().min(5).max(10),
      country: z.string().min(2).max(3),
    }),
    trackingNumber: z.string().nullable(),
  }),
  payment: z.object({
    method: z.union([z.literal('card'), z.literal('paypal'), z.literal('bank_transfer')]),
    status: z.union([z.literal('pending'), z.literal('completed'), z.literal('failed')]),
    amount: z.number().min(0),
    currency: z.union([z.literal('USD'), z.literal('EUR'), z.literal('GBP')]),
  }),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

// Valibot schema
const valibotSchema = v.object({
  customer: v.object({
    id: v.pipe(v.string(), v.minLength(10)),
    email: v.pipe(v.string(), v.minLength(5)),
    name: v.pipe(v.string(), v.minLength(2), v.maxLength(100)),
    phone: v.pipe(v.string(), v.minLength(10), v.maxLength(20)),
  }),
  items: v.pipe(
    v.array(
      v.object({
        productId: v.pipe(v.string(), v.minLength(5)),
        sku: v.pipe(v.string(), v.minLength(3)),
        name: v.pipe(v.string(), v.minLength(1), v.maxLength(200)),
        quantity: v.pipe(v.number(), v.minValue(1), v.maxValue(1000)),
        price: v.pipe(v.number(), v.minValue(0)),
        currency: v.union([v.literal('USD'), v.literal('EUR'), v.literal('GBP')]),
        metadata: v.object({
          size: v.string(),
          color: v.string(),
          material: v.string(),
        }),
      }),
    ),
    v.minLength(1),
    v.maxLength(100),
  ),
  shipping: v.object({
    method: v.union([v.literal('standard'), v.literal('express'), v.literal('overnight')]),
    address: v.object({
      street: v.pipe(v.string(), v.minLength(5)),
      city: v.pipe(v.string(), v.minLength(2)),
      state: v.pipe(v.string(), v.minLength(2), v.maxLength(3)),
      zipCode: v.pipe(v.string(), v.minLength(5), v.maxLength(10)),
      country: v.pipe(v.string(), v.minLength(2), v.maxLength(3)),
    }),
    trackingNumber: v.nullable(v.string()),
  }),
  payment: v.object({
    method: v.union([v.literal('card'), v.literal('paypal'), v.literal('bank_transfer')]),
    status: v.union([v.literal('pending'), v.literal('completed'), v.literal('failed')]),
    amount: v.pipe(v.number(), v.minValue(0)),
    currency: v.union([v.literal('USD'), v.literal('EUR'), v.literal('GBP')]),
  }),
  notes: v.optional(v.string()),
  tags: v.optional(v.array(v.string())),
})

// ArkType schema
const arkTypeSchema = type({
  'customer': {
    id: 'string > 10',
    email: 'string > 5',
    name: '2 <= string <= 100',
    phone: '10 <= string <= 20',
  },
  'items': '(1<=unknown[]<=100)',
  'items[]': {
    productId: 'string > 5',
    sku: 'string > 3',
    name: '1 <= string <= 200',
    quantity: '1<=number<=1000',
    price: 'number>=0',
    currency: '"USD" | "EUR" | "GBP"',
    metadata: {
      size: 'string',
      color: 'string',
      material: 'string',
    },
  },
  'shipping': {
    method: '"standard" | "express" | "overnight"',
    address: {
      street: 'string > 5',
      city: 'string > 2',
      state: '2 <= string <= 3',
      zipCode: '5 <= string <= 10',
      country: '2 <= string <= 3',
    },
    trackingNumber: 'string | null',
  },
  'payment': {
    method: '"card" | "paypal" | "bank_transfer"',
    status: '"pending" | "completed" | "failed"',
    amount: 'number>=0',
    currency: '"USD" | "EUR" | "GBP"',
  },
  'notes?': 'string',
  'tags?': 'string[]',
})

describe('complex backend: valid parse', () => {
  bench('narro unbuild async valid', async () => {
    await narroAsyncUnbuild.safeParse(validOrder)
  })
  bench('narro async valid', () => {
    narroAsyncBuilt.safeParse(validOrder)
  })
  bench('narro inline unbuild valid', async () => {
    await narroInlineUnbuild.safeParse(validOrder)
  })
  bench('narro inline valid', () => {
    narroInlineBuilt.safeParse(validOrder)
  })
  bench('zod valid', () => {
    zodSchema.safeParse(validOrder)
  })
  bench('valibot valid', () => {
    v.safeParse(valibotSchema, validOrder)
  })
  bench('arktype valid', () => {
    arkTypeSchema(validOrder)
  })
})

describe('complex backend: invalid parse', () => {
  bench('narro unbuild async invalid', async () => {
    await narroAsyncUnbuild.safeParse(invalidOrder)
  })
  bench('narro async invalid', () => {
    narroAsyncBuilt.safeParse(invalidOrder)
  })
  bench('narro inline unbuild invalid', async () => {
    await narroInlineUnbuild.safeParse(invalidOrder)
  })
  bench('narro inline invalid', () => {
    narroInlineBuilt.safeParse(invalidOrder)
  })
  bench('zod invalid', () => {
    zodSchema.safeParse(invalidOrder)
  })
  bench('valibot invalid', () => {
    v.safeParse(valibotSchema, invalidOrder)
  })
  bench('arktype invalid', () => {
    arkTypeSchema(invalidOrder)
  })
})
