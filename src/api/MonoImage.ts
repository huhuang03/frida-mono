import { createNativeFunction, MonoImageOpenStatus, MonoMetaTableEnum } from '../core'
import { MonoAssemblyName } from './MonoAssemblyName'
import { MonoBase } from './MonoBase'
import { MonoTableInfo } from './MonoTableInfo'
import ExNativeFunction from '../util/ExNativeFunction'

// not exist in unity-mono
let mono_image_open: ExNativeFunction | null = null
let mono_image_open_from_data: ExNativeFunction | null = null
let mono_image_open_raw: ExNativeFunction | null = null
let mono_image_loaded: ExNativeFunction | null = null
let mono_image_get_filename: ExNativeFunction | null = null
let mono_image_get_name: ExNativeFunction | null = null
let mono_image_get_resource: ExNativeFunction | null = null
let mono_image_get_table_info: ExNativeFunction | null = null
let mono_assembly_get_assemblyref: ExNativeFunction | null = null
let mono_assembly_fill_assembly_name: ExNativeFunction | null = null
let mono_assembly_load_reference: ExNativeFunction | null = null

export function initMonoImage() {
  mono_image_open = createNativeFunction('mono_image_open', 'pointer', ['pointer', 'pointer'])
  mono_image_open_from_data = createNativeFunction('mono_image_open_from_data', 'pointer', ['pointer', 'uint32', 'int', 'pointer'])
  mono_image_open_raw = createNativeFunction('mono_image_open_raw', 'pointer', ['pointer', 'pointer'])
  mono_image_loaded = createNativeFunction('mono_image_loaded', 'pointer', ['pointer'])
  mono_image_get_filename = createNativeFunction('mono_image_get_filename', 'pointer', ['pointer'])
  mono_image_get_name = createNativeFunction('mono_image_get_name', 'pointer', ['pointer'])
  mono_image_get_resource = createNativeFunction('mono_image_get_resource', 'pointer', ['pointer', 'uint32', 'pointer'])
  mono_image_get_table_info = createNativeFunction('mono_image_get_table_info', 'pointer', ['pointer', 'int'])
  mono_assembly_get_assemblyref = createNativeFunction('mono_assembly_get_assemblyref', 'void', ['pointer', 'int', 'pointer'])
  mono_assembly_fill_assembly_name = createNativeFunction('mono_assembly_fill_assembly_name', 'bool', ['pointer', 'pointer'])
  mono_assembly_load_reference = createNativeFunction('mono_assembly_load_reference', 'void', ['pointer', 'int'])
}

/*
std::list<MonoClass*> GetAssemblyClassList(MonoImage * image)
{
   std::list<MonoClass*> class_list;

   const MonoTableInfo* table_info = mono_image_get_table_info(image, MONO_TABLE_TYPEDEF);

   int rows = mono_table_info_get_rows(table_info);

   for (int i = 0; i < rows; i++)
   {
       MonoClass* _class = nullptr;
       uint32_t cols[MONO_TYPEDEF_SIZE];
       mono_metadata_decode_row(table_info, i, cols, MONO_TYPEDEF_SIZE);
       const char* name = mono_metadata_string_heap(image, cols[MONO_TYPEDEF_NAME]);
       const char* name_space = mono_metadata_string_heap(image, cols[MONO_TYPEDEF_NAMESPACE]);
       _class = mono_class_from_name(image, name_space, name);
       class_list.push_back(_class);
   }
   return class_list
}
*/

/**
 * Mono doc: http://docs.go-mono.com/?link=xhtml%3adeploy%2fmono-api-image.html
 */

export class MonoImage extends MonoBase {
  /**
   * Used to get the filename that hold the actual MonoImage.
   * @returns {string} The filename
   */
  get fileName(): string {
    return mono_image_get_filename(this.$address).readUtf8String()
  }

  /**
   * @returns {string} The name of the assembly
   */
  get name(): string {
    return mono_image_get_name(this.$address).readUtf8String()
  }

  /**
   * This is a low-level routine that fetches a resource from the metadata that starts at a given offset.
   * The size parameter is filled with the data field as encoded in the metadata.
   * @param {number} offset - The offset to add to the resource
   */
  getResource(offset: number): { name: string; size: number } {
    const sizePtr = Memory.alloc(4)
    const resPtr = mono_image_get_resource(this.$address, offset, sizePtr)
    return {
      name: resPtr.readUtf8String(),
      size: sizePtr.readU32()
    }
  }

  /**
   * @param {MonoMetaTableEnum} tableId
   * @returns {MonoTableInfo}
   */
  getTableInfo(tableId: MonoMetaTableEnum): MonoTableInfo {
    const address = mono_image_get_table_info(this.$address, tableId)
    return MonoTableInfo.fromAddress(address)
  }

  /**
   * Fills out the aname with the assembly name of the index assembly reference in image.
   * @param {number} index - Index to the assembly reference in the image
   */
  getAssemblyRef(index: number): MonoAssemblyName {
    const name = MonoAssemblyName.alloc()
    mono_assembly_get_assemblyref(this.$address, index, name.$address)
    return name
  }

  /**
   * @param {string} assemblyName - The assembly name
   * @returns {boolean}
   */
  fillAssemblyName(assemblyName: string): boolean {
    return mono_assembly_fill_assembly_name(this.$address, Memory.allocUtf8String(assemblyName))
  }

  /**
   * @param {number} index
   */
  loadReference(index: number): void {
    mono_assembly_load_reference(this.$address, index)
  }

  static openFromData(data: ArrayBuffer): MonoImage {
    const len = data.byteLength
    const dataBytes = Memory.alloc(len)
    dataBytes.writeByteArray(data)
    const status = Memory.alloc(Process.pointerSize)
    // how to check result?
    // mono_image_open_from_data = createNativeFunction('mono_image_open_from_data', 'pointer', ['pointer', 'uint32', 'bool', 'pointer'])
    return MonoImage.fromAddress(mono_image_open_from_data(dataBytes, len, -1, status))
  }

  // for now use load1
  static load1(name: string): MonoImage {
    const status = Memory.alloc(Process.pointerSize)
    const address = mono_image_open_raw(Memory.allocUtf8String(name), status)
    if (address.isNull()) {
      throw new Error('Failed loading MonoImage! Error: ' + MonoImageOpenStatus[status.readInt()])
    }
    return MonoImage.fromAddress(address)
  }

  static load2(name: string): MonoImage {
    const status = Memory.alloc(Process.pointerSize)
    const address = mono_image_open(Memory.allocUtf8String(name), status)
    if (address.isNull()) {
      throw new Error('Failed loading MonoImage! Error: ' + MonoImageOpenStatus[status.readInt()])
    }
    return MonoImage.fromAddress(address)
  }

  /**
   * This routine verifies that the given image is loaded. Reflection-only loads do not count.
   * @param {string} name - Path or assembly name of the image to load.
   * @returns {MonoImage} The loaded MonoImage or NULL on failure.
   */
  static loaded(name: string): MonoImage {
    const address: NativePointer = mono_image_loaded(Memory.allocUtf8String(name))
    return MonoImage.fromAddress(address)
  }

  public toString(): string {
    return `MonoImage(name=${this.name})`
  }
}
