/**
 * @since 0.1.0
 */
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
import Json = J.Json
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
  readonly descriptions: ReadonlyArray<{ description: string; descriptionType: string }>
  readonly doi: Doi
  readonly titles: ReadonlyNonEmptyArray<{ title: string }>
}

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
