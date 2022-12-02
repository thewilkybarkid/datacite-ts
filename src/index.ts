/**
 * @since 0.1.0
 */
import { Doi } from 'doi-ts'

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * @category model
 * @since 0.1.0
 */
export interface Work {
  readonly doi: Doi
}
