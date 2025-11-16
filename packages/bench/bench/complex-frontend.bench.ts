import { type } from 'arktype'
import { array, boolean, literal, object, string, union } from 'narro'

import { array as arrayInline, boolean as booleanInline, literal as literalInline, object as objectInline, string as stringInline, union as unionInline } from 'narro/inline'
import * as v from 'valibot'
import { bench, describe } from 'vitest'
import { z } from 'zod'

// Realistic frontend form validation - User registration with profile
const validFormData = {
  account: {
    username: 'johndoe123',
    email: 'john.doe@example.com',
    password: 'SecureP@ssw0rd123',
    confirmPassword: 'SecureP@ssw0rd123',
    agreeToTerms: true,
  },
  profile: {
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: '1990-05-15',
    gender: 'male',
    bio: 'Software developer with a passion for open source.',
  },
  contact: {
    phoneNumber: '+1-555-0123',
    address: {
      street: '456 Oak Avenue',
      apartment: 'Apt 12B',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      country: 'US',
    },
  },
  preferences: {
    theme: 'dark',
    language: 'en',
    notifications: {
      email: true,
      push: false,
      sms: true,
    },
    newsletter: true,
  },
  interests: ['technology', 'music', 'travel'],
  referralCode: null,
}

const invalidFormData = {
  account: {
    username: 'jo', // Invalid: too short (min 3)
    email: 'invalid-email', // Invalid: not a proper email format
    password: '12345', // Invalid: too short and weak
    confirmPassword: '123456', // Invalid: doesn't match password
    agreeToTerms: false, // Invalid: must be true
  },
  profile: {
    firstName: 'J', // Invalid: too short
    lastName: 'D', // Invalid: too short
    dateOfBirth: '1990-05-15',
    gender: 'unknown', // Invalid: not in allowed values
    bio: 'Software developer with a passion for open source.',
  },
  contact: {
    phoneNumber: '555', // Invalid: too short
    address: {
      street: '456 Oak Avenue',
      apartment: 'Apt 12B',
      city: 'SF',
      state: 'CA',
      zipCode: '941', // Invalid: too short
      country: 'US',
    },
  },
  preferences: {
    theme: 'rainbow', // Invalid: not in allowed themes
    language: 'en',
    notifications: {
      email: true,
      push: false,
      sms: true,
    },
    newsletter: true,
  },
  interests: ['technology', 'music', 'travel'],
  referralCode: null,
}

// Narro async schema
const narroAsyncUnbuild = object({
  account: object({
    username: string().minLength(3).maxLength(30),
    email: string().minLength(5).maxLength(100),
    password: string().minLength(8).maxLength(100),
    confirmPassword: string().minLength(8).maxLength(100),
    agreeToTerms: literal(true),
  }),
  profile: object({
    firstName: string().minLength(2).maxLength(50),
    lastName: string().minLength(2).maxLength(50),
    dateOfBirth: string().minLength(10).maxLength(10),
    gender: union([literal('male'), literal('female'), literal('other'), literal('prefer-not-to-say')]),
    bio: string().maxLength(500).optional(),
  }),
  contact: object({
    phoneNumber: string().minLength(10).maxLength(20),
    address: object({
      street: string().minLength(5).maxLength(100),
      apartment: string().maxLength(20).optional(),
      city: string().minLength(2).maxLength(50),
      state: string().minLength(2).maxLength(3),
      zipCode: string().minLength(5).maxLength(10),
      country: string().minLength(2).maxLength(3),
    }),
  }),
  preferences: object({
    theme: union([literal('light'), literal('dark'), literal('auto')]),
    language: union([literal('en'), literal('es'), literal('fr'), literal('de'), literal('ja')]),
    notifications: object({
      email: boolean(),
      push: boolean(),
      sms: boolean(),
    }),
    newsletter: boolean(),
  }),
  interests: array(string().minLength(3).maxLength(50)).minLength(1).maxLength(10),
  referralCode: string().nullable(),
})

const narroAsyncBuilt = await object({
  account: object({
    username: string().minLength(3).maxLength(30),
    email: string().minLength(5).maxLength(100),
    password: string().minLength(8).maxLength(100),
    confirmPassword: string().minLength(8).maxLength(100),
    agreeToTerms: literal(true),
  }),
  profile: object({
    firstName: string().minLength(2).maxLength(50),
    lastName: string().minLength(2).maxLength(50),
    dateOfBirth: string().minLength(10).maxLength(10),
    gender: union([literal('male'), literal('female'), literal('other'), literal('prefer-not-to-say')]),
    bio: string().maxLength(500).optional(),
  }),
  contact: object({
    phoneNumber: string().minLength(10).maxLength(20),
    address: object({
      street: string().minLength(5).maxLength(100),
      apartment: string().maxLength(20).optional(),
      city: string().minLength(2).maxLength(50),
      state: string().minLength(2).maxLength(3),
      zipCode: string().minLength(5).maxLength(10),
      country: string().minLength(2).maxLength(3),
    }),
  }),
  preferences: object({
    theme: union([literal('light'), literal('dark'), literal('auto')]),
    language: union([literal('en'), literal('es'), literal('fr'), literal('de'), literal('ja')]),
    notifications: object({
      email: boolean(),
      push: boolean(),
      sms: boolean(),
    }),
    newsletter: boolean(),
  }),
  interests: array(string().minLength(3).maxLength(50)).minLength(1).maxLength(10),
  referralCode: string().nullable(),
}).build()

const narroInlineUnbuild = objectInline({
  account: objectInline({
    username: stringInline().minLength(3).maxLength(30),
    email: stringInline().minLength(5).maxLength(100),
    password: stringInline().minLength(8).maxLength(100),
    confirmPassword: stringInline().minLength(8).maxLength(100),
    agreeToTerms: literalInline(true),
  }),
  profile: objectInline({
    firstName: stringInline().minLength(2).maxLength(50),
    lastName: stringInline().minLength(2).maxLength(50),
    dateOfBirth: stringInline().minLength(10).maxLength(10),
    gender: unionInline([literalInline('male'), literalInline('female'), literalInline('other'), literalInline('prefer-not-to-say')]),
    bio: stringInline().maxLength(500).optional(),
  }),
  contact: objectInline({
    phoneNumber: stringInline().minLength(10).maxLength(20),
    address: objectInline({
      street: stringInline().minLength(5).maxLength(100),
      apartment: stringInline().maxLength(20).optional(),
      city: stringInline().minLength(2).maxLength(50),
      state: stringInline().minLength(2).maxLength(3),
      zipCode: stringInline().minLength(5).maxLength(10),
      country: stringInline().minLength(2).maxLength(3),
    }),
  }),
  preferences: objectInline({
    theme: unionInline([literalInline('light'), literalInline('dark'), literalInline('auto')]),
    language: unionInline([literalInline('en'), literalInline('es'), literalInline('fr'), literalInline('de'), literalInline('ja')]),
    notifications: objectInline({
      email: booleanInline(),
      push: booleanInline(),
      sms: booleanInline(),
    }),
    newsletter: booleanInline(),
  }),
  interests: arrayInline(stringInline().minLength(3).maxLength(50)).minLength(1).maxLength(10),
  referralCode: stringInline().nullable(),
})

// Narro inline schema
const narroInlineBuilt = await objectInline({
  account: objectInline({
    username: stringInline().minLength(3).maxLength(30),
    email: stringInline().minLength(5).maxLength(100),
    password: stringInline().minLength(8).maxLength(100),
    confirmPassword: stringInline().minLength(8).maxLength(100),
    agreeToTerms: literalInline(true),
  }),
  profile: objectInline({
    firstName: stringInline().minLength(2).maxLength(50),
    lastName: stringInline().minLength(2).maxLength(50),
    dateOfBirth: stringInline().minLength(10).maxLength(10),
    gender: unionInline([literalInline('male'), literalInline('female'), literalInline('other'), literalInline('prefer-not-to-say')]),
    bio: stringInline().maxLength(500).optional(),
  }),
  contact: objectInline({
    phoneNumber: stringInline().minLength(10).maxLength(20),
    address: objectInline({
      street: stringInline().minLength(5).maxLength(100),
      apartment: stringInline().maxLength(20).optional(),
      city: stringInline().minLength(2).maxLength(50),
      state: stringInline().minLength(2).maxLength(3),
      zipCode: stringInline().minLength(5).maxLength(10),
      country: stringInline().minLength(2).maxLength(3),
    }),
  }),
  preferences: objectInline({
    theme: unionInline([literalInline('light'), literalInline('dark'), literalInline('auto')]),
    language: unionInline([literalInline('en'), literalInline('es'), literalInline('fr'), literalInline('de'), literalInline('ja')]),
    notifications: objectInline({
      email: booleanInline(),
      push: booleanInline(),
      sms: booleanInline(),
    }),
    newsletter: booleanInline(),
  }),
  interests: arrayInline(stringInline().minLength(3).maxLength(50)).minLength(1).maxLength(10),
  referralCode: stringInline().nullable(),
}).build()

// Zod schema
const zodSchema = z.object({
  account: z.object({
    username: z.string().min(3).max(30),
    email: z.string().min(5).max(100),
    password: z.string().min(8).max(100),
    confirmPassword: z.string().min(8).max(100),
    agreeToTerms: z.literal(true),
  }),
  profile: z.object({
    firstName: z.string().min(2).max(50),
    lastName: z.string().min(2).max(50),
    dateOfBirth: z.string().min(10).max(10),
    gender: z.union([z.literal('male'), z.literal('female'), z.literal('other'), z.literal('prefer-not-to-say')]),
    bio: z.string().max(500).optional(),
  }),
  contact: z.object({
    phoneNumber: z.string().min(10).max(20),
    address: z.object({
      street: z.string().min(5).max(100),
      apartment: z.string().max(20).optional(),
      city: z.string().min(2).max(50),
      state: z.string().min(2).max(3),
      zipCode: z.string().min(5).max(10),
      country: z.string().min(2).max(3),
    }),
  }),
  preferences: z.object({
    theme: z.union([z.literal('light'), z.literal('dark'), z.literal('auto')]),
    language: z.union([z.literal('en'), z.literal('es'), z.literal('fr'), z.literal('de'), z.literal('ja')]),
    notifications: z.object({
      email: z.boolean(),
      push: z.boolean(),
      sms: z.boolean(),
    }),
    newsletter: z.boolean(),
  }),
  interests: z.array(z.string().min(3).max(50)).min(1).max(10),
  referralCode: z.string().nullable(),
})

// Valibot schema
const valibotSchema = v.object({
  account: v.object({
    username: v.pipe(v.string(), v.minLength(3), v.maxLength(30)),
    email: v.pipe(v.string(), v.minLength(5), v.maxLength(100)),
    password: v.pipe(v.string(), v.minLength(8), v.maxLength(100)),
    confirmPassword: v.pipe(v.string(), v.minLength(8), v.maxLength(100)),
    agreeToTerms: v.literal(true),
  }),
  profile: v.object({
    firstName: v.pipe(v.string(), v.minLength(2), v.maxLength(50)),
    lastName: v.pipe(v.string(), v.minLength(2), v.maxLength(50)),
    dateOfBirth: v.pipe(v.string(), v.minLength(10), v.maxLength(10)),
    gender: v.union([v.literal('male'), v.literal('female'), v.literal('other'), v.literal('prefer-not-to-say')]),
    bio: v.optional(v.pipe(v.string(), v.maxLength(500))),
  }),
  contact: v.object({
    phoneNumber: v.pipe(v.string(), v.minLength(10), v.maxLength(20)),
    address: v.object({
      street: v.pipe(v.string(), v.minLength(5), v.maxLength(100)),
      apartment: v.optional(v.pipe(v.string(), v.maxLength(20))),
      city: v.pipe(v.string(), v.minLength(2), v.maxLength(50)),
      state: v.pipe(v.string(), v.minLength(2), v.maxLength(3)),
      zipCode: v.pipe(v.string(), v.minLength(5), v.maxLength(10)),
      country: v.pipe(v.string(), v.minLength(2), v.maxLength(3)),
    }),
  }),
  preferences: v.object({
    theme: v.union([v.literal('light'), v.literal('dark'), v.literal('auto')]),
    language: v.union([v.literal('en'), v.literal('es'), v.literal('fr'), v.literal('de'), v.literal('ja')]),
    notifications: v.object({
      email: v.boolean(),
      push: v.boolean(),
      sms: v.boolean(),
    }),
    newsletter: v.boolean(),
  }),
  interests: v.pipe(v.array(v.pipe(v.string(), v.minLength(3), v.maxLength(50))), v.minLength(1), v.maxLength(10)),
  referralCode: v.nullable(v.string()),
})

// ArkType schema
const arkTypeSchema = type({
  'account': {
    username: '3 <= string <= 30',
    email: '5 <= string <= 100',
    password: '8 <= string <= 100',
    confirmPassword: '8 <= string <= 100',
    agreeToTerms: 'true',
  },
  'profile': {
    'firstName': '2 <= string <= 50',
    'lastName': '2 <= string <= 50',
    'dateOfBirth': '10 <= string <= 10',
    'gender': '"male" | "female" | "other" | "prefer-not-to-say"',
    'bio?': 'string <= 500',
  },
  'contact': {
    phoneNumber: '10 <= string <= 20',
    address: {
      'street': '5 <= string <= 100',
      'apartment?': 'string <= 20',
      'city': '2 <= string <= 50',
      'state': '2 <= string <= 3',
      'zipCode': '5 <= string <= 10',
      'country': '2 <= string <= 3',
    },
  },
  'preferences': {
    theme: '"light" | "dark" | "auto"',
    language: '"en" | "es" | "fr" | "de" | "ja"',
    notifications: {
      email: 'boolean',
      push: 'boolean',
      sms: 'boolean',
    },
    newsletter: 'boolean',
  },
  'interests': '(1<=unknown[]<=10)',
  'interests[]': '3 <= string <= 50',
  'referralCode': 'string | null',
})

describe('complex frontend: valid parse', () => {
  bench('narro async unbuild valid', async () => {
    await narroAsyncUnbuild.safeParse(validFormData)
  })
  bench('narro async valid', () => {
    narroAsyncBuilt.safeParse(validFormData)
  })

  bench('narro inline unbuild valid', async () => {
    await narroInlineUnbuild.safeParse(validFormData)
  })
  bench('narro inline valid', () => {
    narroInlineBuilt.safeParse(validFormData)
  })
  bench('zod valid', () => {
    zodSchema.safeParse(validFormData)
  })
  bench('valibot valid', () => {
    v.safeParse(valibotSchema, validFormData)
  })
  bench('arktype valid', () => {
    arkTypeSchema(validFormData)
  })
})

describe('complex frontend: invalid parse', () => {
  bench('narro unbuild async invalid', async () => {
    await narroAsyncUnbuild.safeParse(invalidFormData)
  })
  bench('narro async invalid', () => {
    narroAsyncBuilt.safeParse(invalidFormData)
  })
  bench('narro inline unbuild invalid', async () => {
    await narroInlineUnbuild.safeParse(invalidFormData)
  })
  bench('narro inline invalid', () => {
    narroInlineBuilt.safeParse(invalidFormData)
  })
  bench('zod invalid', () => {
    zodSchema.safeParse(invalidFormData)
  })
  bench('valibot invalid', () => {
    v.safeParse(valibotSchema, invalidFormData)
  })
  bench('arktype invalid', () => {
    arkTypeSchema(invalidFormData)
  })
})
