import { Doi } from 'doi-ts'
import { expectTypeOf } from 'expect-type'
import * as C from 'io-ts/Codec'
import * as _ from '../src'

import Codec = C.Codec
import Work = _.Work

declare const work: Work

//
// Work
//

expectTypeOf(work.doi).toEqualTypeOf<Doi>()

//
// WorkC
//

expectTypeOf(_.WorkC).toEqualTypeOf<Codec<string, string, Work>>()
