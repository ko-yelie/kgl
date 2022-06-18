import Kgl from './kgl'

export default class KglEffect extends Kgl {
  effectList: any[] = []

  createEffect(EffectClass: any, option?: any) {
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
