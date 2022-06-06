import Program from '../program'
import zoomblurFrag from '../shaders/postprocessing/zoomblur.frag'

export default class Zoomblur extends Program {
  constructor(kgl) {
    const option = {
      fragmentShader: zoomblurFrag,
      uniforms: {
        uTexture: 'framebuffer',
        uStrength: 5,
        uCenter: [kgl.canvas.width / 2, kgl.canvas.height / 2],
      },
    }
    super(kgl, option)
  }

  draw(readFramebufferKey, outFramebufferKey, strength, center, isOnscreen) {
    this.kgl.bindFramebuffer(isOnscreen ? null : outFramebufferKey)
    this.uniforms.uTexture = readFramebufferKey
    if (typeof strength !== 'undefined') this.uniforms.uStrength = strength
    if (typeof center !== 'undefined') this.uniforms.uCenter = center
    this.kgl.clear()
    super.draw()
  }
}
