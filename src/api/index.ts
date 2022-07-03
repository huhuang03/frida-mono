import { initMono } from './Mono'
import { initMonoAssembly } from './MonoAssembly'
import { initMonoClass } from './MonoClass'
import { initMonoClassField } from './MonoClassField'
import { initMonoContext } from './MonoContext'
import { initMonoDomain } from './MonoDomain'
import { initMonoImage } from './MonoImage'
import { initMonoMethod } from './MonoMethod'

export { Mono } from './Mono'
export { MonoAssembly } from './MonoAssembly'
export { MonoBundledAssembly } from './MonoBundledAssembly'
export { MonoClass } from './MonoClass'
export { MonoClassField } from './MonoClassField'
export { MonoContext } from './MonoContext'
export { MonoDomain } from './MonoDomain'
export { MonoEvent } from './MonoEvent'
export { MonoGenericParam } from './MonoGenericParam'
export { MonoImage } from './MonoImage'
export { MonoMethod } from './MonoMethod'
export { MonoReflectionAssembly } from './MonoReflectionAssembly'
export { MonoType } from './MonoType'
export { MonoVTable } from './MonoVTable'

export function initApi() {
  initMono()
  initMonoAssembly()
  initMonoClass()
  initMonoClassField()
  initMonoContext()
  initMonoDomain()
  initMonoImage()
  initMonoMethod()
}
