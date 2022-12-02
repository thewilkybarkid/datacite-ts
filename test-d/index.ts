import { Temporal } from '@js-temporal/polyfill'
import { Doi } from 'doi-ts'
import { expectTypeOf } from 'expect-type'
import { FetchEnv } from 'fetch-fp-ts'
import * as RTE from 'fp-ts/ReaderTaskEither'
import * as RNEA from 'fp-ts/ReadonlyNonEmptyArray'
import * as C from 'io-ts/Codec'
import * as _ from '../src'

import Codec = C.Codec
import Instant = Temporal.Instant
import PlainDate = Temporal.PlainDate
import PlainYearMonth = Temporal.PlainYearMonth
import ReaderTaskEither = RTE.ReaderTaskEither
import ReadonlyNonEmptyArray = RNEA.ReadonlyNonEmptyArray
import Work = _.Work

declare const doi: Doi
declare const work: Work

//
// Work
//

expectTypeOf(work.descriptions).toEqualTypeOf<ReadonlyArray<{ description: string; descriptionType: string }>>()
expectTypeOf(work.dates).toEqualTypeOf<
  ReadonlyNonEmptyArray<{ date: Instant | PlainDate | PlainYearMonth | number; dateType: string }>
>()
expectTypeOf(work.doi).toEqualTypeOf<Doi>()
expectTypeOf(work.titles).toEqualTypeOf<ReadonlyNonEmptyArray<{ title: string }>>()
expectTypeOf(work.types.resourceType).toEqualTypeOf<string | undefined>()
expectTypeOf(work.types.resourceTypeGeneral).toEqualTypeOf<string | undefined>()
expectTypeOf(work.url).toEqualTypeOf<URL>()

//
// getWork
//

expectTypeOf(_.getWork(doi)).toMatchTypeOf<ReaderTaskEither<FetchEnv, unknown, Work>>()

//
// WorkC
//

expectTypeOf(_.WorkC).toEqualTypeOf<Codec<string, string, Work>>()
