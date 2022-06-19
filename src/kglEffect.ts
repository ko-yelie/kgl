import Kgl from './kgl'
import { EffectInstance } from './effects/index'
import { Option as OptionSpecular } from './effects/specular'

export default class KglEffect extends Kgl {
  effectList: EffectInstance[] = []

  createEffect<T extends EffectInstance>(
    EffectClass: { new (kgl: KglEffect, option?: OptionSpecular): T },
    option?: OptionSpecular
  ) {
    const effect = new EffectClass(this, option)
    this.effectList.push(effect)
    return effect
  }

  resize() {
    super.resize()

    this.effectList.forEach((program) => {
      if (program.isAutoResolution) {
        program.uniforms.uResolution = [this.canvas.width, this.canvas.height]
      }
    })
  }
}
