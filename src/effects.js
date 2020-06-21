import Program from './program'
import textureFrag from './shaders/template/texture.frag'
import blurFrag from './shaders/postprocessing/blur.frag'
import specularFrag from './shaders/postprocessing/specular.frag'
import bloomFrag from './shaders/postprocessing/bloom.frag'
import zoomblurFrag from './shaders/postprocessing/zoomblur.frag'

export class Blur extends Program {
  constructor (webgl) {
    const option = {
      fragmentShader: blurFrag,
      uniforms: {
        texture: 'framebuffer',
        radius: 0,
        isHorizontal: false
      },
      hasCamera: false,
      hasLight: false
    }

    super(webgl, option)

    this.radius = 0.5
  }

  draw (readFramebufferKey, cacheFramebufferKey, radius, isOnscreen) {
    this.use()

    const iterations = 8
    for (let i = 0; i < iterations; i++) {
      this.webgl.bindFramebuffer(isOnscreen && i >= iterations - 1 ? null : cacheFramebufferKey)
      this.uniforms.texture = readFramebufferKey
      this.uniforms.radius = (iterations - 1 - i) * (typeof radius !== 'undefined' ? radius : this.radius)
      this.uniforms.isHorizontal = i % 2 === 0
      super.draw()

      const t = cacheFramebufferKey
      cacheFramebufferKey = readFramebufferKey
      readFramebufferKey = t
    }
    // output: readFramebufferKey
  }
}

class Specular extends Program {
  constructor (webgl, option = {}) {
    const {
      threshold = 0.5
    } = option

    const programOption = {
      fragmentShader: specularFrag,
      uniforms: {
        texture: 'framebuffer',
        threshold
      },
      hasCamera: false,
      hasLight: false
    }

    super(webgl, programOption)
  }

  draw (readFramebufferKey, outFramebufferKey, threshold) {
    this.webgl.bindFramebuffer(outFramebufferKey)
    this.use()
    this.uniforms.texture = readFramebufferKey
    if (typeof threshold !== 'undefined') this.uniforms.threshold = threshold
    super.draw()
  }
}

export class Bloom extends Program {
  constructor (webgl) {
    if (!webgl.effects['bloomSpecular']) {
      webgl.effects['bloomSpecular'] = new Specular(webgl, {
        threshold: 0.3
      })
    }

    if (!webgl.effects['bloomBlur']) {
      webgl.effects['bloomBlur'] = new Blur(webgl)
    }

    if (!webgl.effects['bloomBase']) {
      webgl.effects['bloomBase'] = new Program(webgl, {
        fragmentShader: textureFrag,
        uniforms: {
          texture: 'framebuffer'
        }
      })
    }

    const option = {
      fragmentShader: bloomFrag,
      uniforms: {
        specular: 'framebuffer'
      },
      isAdditive: true,
      hasCamera: false,
      hasLight: false,
      isClear: false
    }
    super(webgl, option)

    this.radius = 0.4
  }

  draw (readFramebufferKey, cacheFramebufferKey, outFramebufferKey, radius, isOnscreen) {
    this.webgl.effects['bloomSpecular'].draw(readFramebufferKey, cacheFramebufferKey)

    this.webgl.effects['bloomBlur'].draw(
      cacheFramebufferKey,
      outFramebufferKey,
      typeof radius !== 'undefined' ? radius : this.radius
    )

    this.webgl.bindFramebuffer(isOnscreen ? null : outFramebufferKey)

    {
      const program = this.webgl.effects['bloomBase']
      program.use()
      program.uniforms.texture = readFramebufferKey
      program.draw()
    }

    this.use()
    this.uniforms.specular = cacheFramebufferKey
    super.draw()
  }
}

export class Zoomblur extends Program {
  constructor (webgl) {
    const option = {
      fragmentShader: zoomblurFrag,
      uniforms: {
        texture: 'framebuffer',
        strength: 5,
        center: [webgl.canvas.width / 2, webgl.canvas.height / 2]
      }
    }
    super(webgl, option)
  }

  draw (readFramebufferKey, outFramebufferKey, strength, center, isOnscreen) {
    this.webgl.bindFramebuffer(isOnscreen ? null : outFramebufferKey)
    this.use()
    this.uniforms.texture = readFramebufferKey
    if (typeof strength !== 'undefined') this.uniforms.strength = strength
    if (typeof center !== 'undefined') this.uniforms.center = center
    super.draw()
  }
}

export class Godray extends Program {
  constructor (webgl) {
    if (!webgl.effects['godraySpecular']) {
      webgl.effects['godraySpecular'] = new Specular(webgl, {
        threshold: 0.75
      })
    }

    if (!webgl.effects['godrayZoomblur']) {
      webgl.effects['godrayZoomblur'] = new Zoomblur(webgl)
    }

    if (!webgl.effects['godrayBlur']) {
      webgl.effects['godrayBlur'] = new Blur(webgl)
    }

    if (!webgl.effects['godrayBase']) {
      webgl.effects['godrayBase'] = new Program(webgl, {
        fragmentShader: textureFrag,
        uniforms: {
          texture: 'framebuffer'
        }
      })
    }

    const option = {
      fragmentShader: textureFrag,
      uniforms: {
        texture: 'framebuffer'
      },
      isAdditive: true,
      isClear: false
    }
    super(webgl, option)

    this.radius = 0.02
  }

  draw (readFramebufferKey, cacheFramebufferKey, outFramebufferKey, strength, center, radius, isOnscreen) {
    this.webgl.effects['godraySpecular'].draw(readFramebufferKey, outFramebufferKey)

    this.webgl.effects['godrayZoomblur'].draw(outFramebufferKey, cacheFramebufferKey, strength, center)

    this.webgl.effects['godrayBlur'].draw(
      cacheFramebufferKey,
      outFramebufferKey,
      typeof radius !== 'undefined' ? radius : this.radius
    )

    this.webgl.bindFramebuffer(isOnscreen ? null : outFramebufferKey)

    {
      const program = this.webgl.effects['godrayBase']
      program.use()
      program.uniforms.texture = readFramebufferKey
      program.draw()
    }

    this.use()
    this.uniforms.texture = cacheFramebufferKey
    super.draw()
  }
}

export class GodrayLight extends Program {
  constructor (webgl) {
    if (!webgl.effects['godraySpecular']) {
      webgl.effects['godraySpecular'] = new Specular(webgl, {
        threshold: 0.75
      })
    }

    if (!webgl.effects['godrayZoomblur']) {
      webgl.effects['godrayZoomblur'] = new Zoomblur(webgl)
    }

    if (!webgl.effects['godrayBlur']) {
      webgl.effects['godrayBlur'] = new Blur(webgl)
    }

    const option = {
      fragmentShader: textureFrag,
      uniforms: {
        texture: 'framebuffer'
      },
      isAdditive: true,
      isClear: false
    }
    super(webgl, option)

    this.radius = 0.02
  }

  draw (readFramebufferKey, cacheFramebufferKey, outFramebufferKey, strength, center, radius, isOnscreen) {
    this.webgl.effects['godraySpecular'].draw(readFramebufferKey, outFramebufferKey)

    this.webgl.effects['godrayZoomblur'].draw(outFramebufferKey, cacheFramebufferKey, strength, center)

    this.webgl.effects['godrayBlur'].draw(
      cacheFramebufferKey,
      outFramebufferKey,
      typeof radius !== 'undefined' ? radius : this.radius
    )

    this.webgl.bindFramebuffer(isOnscreen ? null : outFramebufferKey)

    this.use()
    this.uniforms.texture = cacheFramebufferKey
    super.draw()
  }
}
