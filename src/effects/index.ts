import { default as Blur } from './blur'
import { default as Specular } from './specular'
import { default as Bloom } from './bloom'
import { default as Zoomblur } from './zoomblur'
import { default as Godray } from './godray'
import { default as GodrayLight } from './godrayLight'

export type EffectInstance =
  | Blur
  | Specular
  | Bloom
  | Zoomblur
  | Godray
  | GodrayLight

export type KeyofEffect =
  | 'blur'
  | 'specular'
  | 'bloom'
  | 'zoomblur'
  | 'godray'
  | 'godrayLight'

export { default as Blur } from './blur'
export { default as Specular } from './specular'
export { default as Bloom } from './bloom'
export { default as Zoomblur } from './zoomblur'
export { default as Godray } from './godray'
export { default as GodrayLight } from './godrayLight'
