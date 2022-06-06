import Kgl from './kgl.ts'
import * as Effects from './effects/index.js'

export default class KglEffect extends Kgl {
  effectList = []

  createEffect(EffectClass, option) {
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
