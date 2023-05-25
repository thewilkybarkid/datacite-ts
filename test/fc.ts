import { fc } from '@fast-check/jest'
import { Temporal } from '@js-temporal/polyfill'
import { Doi, isDoi } from 'doi-ts'
import { MockResponseObject } from 'fetch-mock'
import { isNonEmpty } from 'fp-ts/Array'
import { NonEmptyArray } from 'fp-ts/NonEmptyArray'
import * as _ from '../src'

export const { constant, string, tuple } = fc

export const nonEmptyArray = <T>(
  arb: fc.Arbitrary<T>,
  constraints: fc.ArrayConstraints = {},
): fc.Arbitrary<NonEmptyArray<T>> => fc.array(arb, { minLength: 1, ...constraints }).filter(isNonEmpty)

const year = (): fc.Arbitrary<number> => fc.integer({ min: -9999, max: 9999 })

const plainYearMonth = (): fc.Arbitrary<Temporal.PlainYearMonth> =>
  fc
    .record({
      year: year(),
      month: fc.integer({ min: 1, max: 12 }),
    })
    .map(args => Temporal.PlainYearMonth.from(args))

const plainDate = (): fc.Arbitrary<Temporal.PlainDate> =>
  fc
    .record({
      year: year(),
      month: fc.integer({ min: 1, max: 12 }),
      day: fc.integer({ min: 1, max: 31 }),
    })
    .map(args => Temporal.PlainDate.from(args))

export const instant = (): fc.Arbitrary<Temporal.Instant> =>
  fc.date().map(date => Temporal.Instant.from(date.toISOString()))

export const error = (): fc.Arbitrary<Error> => fc.string().map(error => new Error(error))

export const statusCode = (): fc.Arbitrary<number> => fc.integer({ min: 200, max: 599 })

export const url = (): fc.Arbitrary<URL> => fc.webUrl().map(url => new URL(url))

export const doi = (): fc.Arbitrary<Doi> =>
  fc
    .tuple(
      fc.stringOf(fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9'), { minLength: 2 }),
      fc.unicodeString({ minLength: 1 }),
    )
    .map(([prefix, suffix]) => `10.${prefix}/${suffix}`)
    .filter(isDoi)

const headerName = () =>
  fc.stringOf(
    fc.char().filter(char => /^[\^_`a-zA-Z\-0-9!#$%&'*+.|~]$/.test(char)),
    { minLength: 1 },
  )

const headers = () => fc.option(fc.dictionary(headerName(), fc.string()), { nil: undefined })

export const response = ({
  status,
  text,
}: { status?: fc.Arbitrary<number>; text?: fc.Arbitrary<string> } = {}): fc.Arbitrary<MockResponseObject> =>
  fc.record({
    body: text ?? fc.oneof(fc.string(), fc.constant(undefined)),
    headers: headers(),
    status: status ?? fc.oneof(statusCode(), fc.constant(undefined)),
  })

export const dataciteWork = (): fc.Arbitrary<_.Work> =>
  fc.record({
    creators: fc.array(
      fc.oneof(
        fc.record(
          {
            familyName: fc.string(),
            givenName: fc.string(),
            nameIdentifiers: fc.array(fc.record({ nameIdentifier: fc.string(), nameIdentifierScheme: fc.string() })),
          },
          { requiredKeys: ['familyName', 'nameIdentifiers'] },
        ),
        fc.record({
          name: fc.string(),
        }),
      ),
    ),
    dates: nonEmptyArray(
      fc.record({
        date: fc.oneof(instant(), plainDate(), plainYearMonth(), year()),
        dateType: fc.string(),
      }),
    ),
    descriptions: fc.array(
      fc.record({
        description: fc.string(),
        descriptionType: fc.string(),
      }),
    ),
    doi: doi(),
    identifiers: fc.array(
      fc.record({
        identifier: fc.string(),
        identifierType: fc.string(),
      }),
    ),
    publisher: fc.string(),
    relatedIdentifiers: fc.array(
      fc.record(
        {
          relationType: fc.string(),
          relatedIdentifier: fc.string(),
          resourceTypeGeneral: fc.string(),
          relatedIdentifierType: fc.string(),
        },
        { requiredKeys: ['relationType', 'relatedIdentifier', 'relatedIdentifierType'] },
      ),
    ),
    titles: nonEmptyArray(
      fc.record({
        title: fc.string(),
      }),
    ),
    types: fc.record(
      {
        resourceType: fc.string(),
        resourceTypeGeneral: fc.string(),
      },
      { withDeletedKeys: true },
    ),
    url: url(),
  })
