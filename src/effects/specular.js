import Program from '../program.js'
import specularFrag from '../shaders/postprocessing/specular.frag'

export default class Specular extends Program {
  constructor(kgl, option = {}) {
    const { threshold = 0.5 } = option

    const programOption = {
      fragmentShader: specularFrag,
      uniforms: {
        uTexture: 'framebuffer',
        uThreshold: threshold,
      },
      hasCamera: false,
      hasLight: false,
    }

    super(kgl, programOption)
  }

  draw(readFramebufferKey, outFramebufferKey, threshold) {
    this.kgl.bindFramebuffer(outFramebufferKey)
    this.uniforms.uTexture = readFramebufferKey
    if (typeof threshold !== 'undefined') this.uniforms.uThreshold = threshold
    this.kgl.clear()
    super.draw()
  }
}
