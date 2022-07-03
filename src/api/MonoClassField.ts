import { createNativeFunction } from '../core'
import { MonoBase } from './MonoBase'
import ExNativeFunction from '../util/ExNativeFunction'

let mono_field_get_data: ExNativeFunction | null = null
let mono_field_get_offset: ExNativeFunction | null = null
let mono_field_full_name: ExNativeFunction | null = null

export function initMonoClassField() {
  mono_field_get_data = createNativeFunction('mono_field_get_data', 'pointer', ['pointer'])
  mono_field_get_offset = createNativeFunction('mono_field_get_offset', 'uint32', ['pointer'])
  mono_field_full_name = createNativeFunction('mono_field_full_name', 'pointer', ['pointer'])
}

export class MonoClassField extends MonoBase {
  /**
   * @returns {string} A pointer to the metadata constant value or to the field data if it has an RVA flag.
   */
  get data(): string {
    const address = mono_field_get_data(this.$address)
    return address.readUtf8String()
  }
  /**
   * @returns {string} The full name for the field, made up of the namespace, type name and the field name.
   */
  get fullName(): string {
    const address = mono_field_full_name(this.$address)
    return address.readUtf8String()
  }

  /**
   * @returns {number} The field offset.
   */
  get offset(): number {
    return mono_field_get_offset(this.$address)
  }
}
