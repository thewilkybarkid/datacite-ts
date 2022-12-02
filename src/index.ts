/**
 * @since 0.1.0
 */
import { Temporal } from '@js-temporal/polyfill'
import { Doi, isDoi } from 'doi-ts'
import * as F from 'fetch-fp-ts'
import * as E from 'fp-ts/Either'
import * as J from 'fp-ts/Json'
import * as RTE from 'fp-ts/ReaderTaskEither'
import * as RA from 'fp-ts/ReadonlyArray'
import * as RNEA from 'fp-ts/ReadonlyNonEmptyArray'
import { flow, identity, pipe } from 'fp-ts/function'
import { StatusCodes } from 'http-status-codes'
import * as C from 'io-ts/Codec'
import * as D from 'io-ts/Decoder'
import safeStableStringify from 'safe-stable-stringify'

import Codec = C.Codec
import FetchEnv = F.FetchEnv
import Instant = Temporal.Instant
import Json = J.Json
import PlainDate = Temporal.PlainDate
import PlainYearMonth = Temporal.PlainYearMonth
import ReadonlyNonEmptyArray = RNEA.ReadonlyNonEmptyArray
import ReaderTaskEither = RTE.ReaderTaskEither

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * @category model
 * @since 0.1.0
 */
export interface Work {
  readonly dates: ReadonlyNonEmptyArray<{
    date: Instant | PartialDate
    dateType: string
  }>
  readonly descriptions: ReadonlyArray<{ description: string; descriptionType: string }>
  readonly doi: Doi
  readonly titles: ReadonlyNonEmptyArray<{ title: string }>
}

/**
 * @category model
 * @since 0.1.1
 */
export type PartialDate = number | PlainYearMonth | PlainDate

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

/**
 * @category constructors
 * @since 0.1.0
 */
export const getWork: (doi: Doi) => ReaderTaskEither<FetchEnv, unknown, Work> = doi =>
  pipe(
    new URL(encodeURIComponent(doi), 'https://api.datacite.org/dois/'),
    F.Request('GET'),
    F.send,
    RTE.filterOrElseW(F.hasStatus(StatusCodes.OK), identity),
    RTE.chainTaskEitherKW(F.decode(WorkC)),
  )

// -------------------------------------------------------------------------------------
// codecs
// -------------------------------------------------------------------------------------

const JsonC = C.make(
  {
    decode: (s: string) =>
      pipe(
        J.parse(s),
        E.mapLeft(() => D.error(s, 'JSON')),
      ),
  },
  { encode: (json: Json) => safeStableStringify(json) },
)

const ReadonlyArrayC = flow(C.array, C.readonly)

const ReadonlyNonEmptyArrayC = flow(ReadonlyArrayC, C.refine(RA.isNonEmpty, 'NonEmptyArray'))

const DoiC = C.fromDecoder(D.fromRefinement(isDoi, 'DOI'))

const InstantC = C.make(
  pipe(
    D.string,
    D.parse(string =>
      E.tryCatch(
        () => Instant.from(string),
        () => D.error(string, 'Instant'),
      ),
    ),
  ),
  { encode: String },
)

const PlainDateC = C.make(
  pipe(
    D.string,
    D.parse(string =>
      E.tryCatch(
        () => PlainDate.from(string),
        () => D.error(string, 'PlainDate'),
      ),
    ),
  ),
  { encode: String },
)

const PlainYearMonthC = C.make(
  pipe(
    D.string,
    D.parse(string =>
      E.tryCatch(
        () => PlainYearMonth.from(string),
        () => D.error(string, 'PlainYearMonth'),
      ),
    ),
  ),
  { encode: String },
)

const NumberFromStringC = C.make(
  pipe(
    D.string,
    D.parse(s => {
      const n = +s
      return isNaN(n) || s.trim() === '' ? D.failure(s, 'Number') : D.success(n)
    }),
  ),
  { encode: String },
)

/**
 * @category codecs
 * @since 0.1.0
 */
export const WorkC: Codec<string, string, Work> = pipe(
  JsonC,
  C.compose(
    C.struct({
      data: pipe(
        C.struct({
          type: C.literal('dois'),
          attributes: C.struct({
            dates: ReadonlyNonEmptyArrayC(
              C.struct({
                date:
                  // Unfortunately, there's no way to describe a union encoder, so we must implement it ourselves.
                  // Refs https://github.com/gcanti/io-ts/issues/625#issuecomment-1007478009
                  C.make(D.union(InstantC, PlainDateC, PlainYearMonthC, NumberFromStringC), {
                    encode: date =>
                      date instanceof Instant
                        ? InstantC.encode(date)
                        : date instanceof PlainDate
                        ? PlainDateC.encode(date)
                        : date instanceof PlainYearMonth
                        ? PlainYearMonthC.encode(date)
                        : NumberFromStringC.encode(date),
                  }),
                dateType: C.string,
              }),
            ),
            descriptions: ReadonlyArrayC(
              C.struct({
                description: C.string,
                descriptionType: C.string,
              }),
            ),
            doi: DoiC,
            titles: ReadonlyNonEmptyArrayC(
              C.struct({
                title: C.string,
              }),
            ),
          }),
        }),
      ),
    }),
  ),
  C.imap(
    ({ data }) => data.attributes,
    work => ({ data: { attributes: work, type: 'dois' as const } }),
  ),
)
