import { createNativeFunction } from '../core'
import { MonoBundledAssembly } from './MonoBundledAssembly'
import ExNativeFunction from '../util/ExNativeFunction'
import { MonoDomain } from './MonoDomain'

let mono_thread_attach: ExNativeFunction | null = null
let mono_set_rootdir: ExNativeFunction | null = null
let mono_set_dirs: ExNativeFunction | null = null
let mono_set_assemblies_path: ExNativeFunction | null = null
let mono_register_bundled_assemblies: ExNativeFunction | null = null
let mono_register_config_for_assembly: ExNativeFunction | null = null
let mono_register_symfile_for_assembly: ExNativeFunction | null = null
let mono_register_machine_config: ExNativeFunction | null = null

export function initMono() {
  mono_thread_attach = createNativeFunction('mono_thread_attach', 'pointer', ['pointer'])
  mono_set_rootdir = createNativeFunction('mono_set_rootdir', 'void', ['void'])
  mono_set_dirs = createNativeFunction('mono_set_dirs', 'void', ['pointer', 'pointer'])
  mono_set_assemblies_path = createNativeFunction('mono_set_assemblies_path', 'void', ['pointer'])
  mono_register_bundled_assemblies = createNativeFunction('mono_register_bundled_assemblies', 'void', ['pointer'])
  mono_register_config_for_assembly = createNativeFunction('mono_register_config_for_assembly', 'void', ['pointer', 'pointer'])
  mono_register_symfile_for_assembly = createNativeFunction('mono_register_symfile_for_assembly', 'void', ['pointer', 'pointer', 'int'])
  mono_register_machine_config = createNativeFunction('mono_register_machine_config', 'void', ['pointer'])
}

export class Mono {
  static thread_attach(domain: MonoDomain): NativePointer {
    return mono_thread_attach(domain.$address)
  }

  static setRootDir(): void {
    mono_set_rootdir()
  }

  /**
   * @param {string} assemblyDir
   * @param {string} configDir
   */
  static setDirs(assemblyDir: string, configDir: string): void {
    mono_set_dirs(Memory.allocUtf8String(assemblyDir), Memory.allocUtf8String(configDir))
  }

  /**
   * @param {string} path
   */
  static setAssembliesPath(path: string): void {
    mono_set_assemblies_path(Memory.allocUtf8String(path))
  }

  /**
   * @param {MonoBundledAssembly[]} assemblies
   */
  static registerBundledAssemblies(assemblies: MonoBundledAssembly[] = []): void {
    const address = Memory.alloc((assemblies.length + 1) * Process.pointerSize)
    for (let i = 0; i < assemblies.length; i++) {
      address.add(i * Process.pointerSize).writePointer(assemblies[i].$address)
    }
    mono_register_bundled_assemblies(address)
  }

  /**
   * @param {string} assemblyName
   * @param {string} configXml
   */
  static registerConfigForAssembly(assemblyName: string, configXml: string): void {
    mono_register_config_for_assembly(Memory.allocUtf8String(assemblyName), Memory.allocUtf8String(configXml))
  }

  /**
   * @param {string} assemblyName
   * @param {string} rawContents
   */
  static registerSymfileForAssembly(assemblyName: string, rawContents: string): void {
    mono_register_symfile_for_assembly(Memory.allocUtf8String(assemblyName), Memory.allocUtf8String(rawContents), rawContents.length)
  }

  /**
   * @param {string} configXml
   */
  static registerMachineConfig(configXml: string): void {
    mono_register_machine_config(Memory.allocUtf8String(configXml))
  }
}
