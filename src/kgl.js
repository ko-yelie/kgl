import {
  createMatrix,
  lookAt,
  multiply,
  perspective,
  rotate,
} from './minMatrix.js'
import ObjectGl from './object.js'
import Program from './program.js'

export default class Kgl {
  constructor(option = {}) {
    this.root = null
    this.indexProgram = -1
    this.currentProgramId = null
    this.isUpdateMatrix = false
    this.effectList = []
    this.framebuffers = {}
    this.textureIndex = -1
    this.textureIndexes = []

    const {
      canvas,
      disableClear = false,
      clearedColor,
      hasCamera = false,
      hasLight = false,
      isFullSize = false,
      stencil = false,
      alpha = true,
      premultipliedAlpha = true,
      pixelRatioMax,
      pixelRatioFixed,
    } = option

    this.disableClear = disableClear
    this.clearedColor = clearedColor || [0, 0, 0, 0]
    this.hasCamera = hasCamera
    this.hasLight = hasLight
    this.isFullSize = isFullSize
    this.stencil = stencil
    this.alpha = alpha
    this.premultipliedAlpha = premultipliedAlpha
    this.pixelRatioMax = pixelRatioMax
    this.pixelRatioFixed = pixelRatioFixed

    if (hasCamera) {
      const {
        fov = 50,
        near = 0.1,
        far = 2000,
        cameraPosition = [0, 0, 30],
        cameraRotation = [0, 0],
        extraFar = 1,
      } = option

      this.vMatrix = createMatrix()
      this.pMatrix = createMatrix()
      this.vpMatrix = createMatrix()
      this.fov = fov
      this.near = near
      this.far = far
      this.cameraPosition = cameraPosition
      this.cameraRotation = cameraRotation
      this.isAutoUpdateCameraPositionZ = !(
        'cameraPosition' in option || 'far' in option
      )
      this.extraFar = extraFar
    }

    if (hasLight) {
      const {
        lightDirection = [-1, 1, 1],
        eyeDirection = this.cameraPosition,
        ambientColor = [0.1, 0.1, 0.1],
      } = option

      this.lightDirection = lightDirection
      this.eyeDirection = eyeDirection
      this.ambientColor = ambientColor
    }

    this.setPixelRatio()

    this.root = new ObjectGl(this)

    this._initWebgl(canvas)
  }

  _initWebgl(canvas) {
    if (typeof canvas === 'string') {
      this.canvas = document.querySelector(canvas)
    } else if (
      typeof canvas === 'object' &&
      canvas.constructor.name === 'HTMLCanvasElement'
    ) {
      this.canvas = canvas
    } else {
      this.canvas = document.createElement('canvas')
      this.canvas.style.display = 'block'
      this.canvas.style.width = '100%'
      this.canvas.style.height = '100%'
      document.body.appendChild(this.canvas)
    }

    const contextAttributes = {
      alpha: this.alpha,
      depth: true,
      stencil: this.stencil,
      antialias: false,
      premultipliedAlpha: this.premultipliedAlpha,
      preserveDrawingBuffer: false,
      powerPreference: 'default',
      failIfMajorPerformanceCaveat: false,
    }
    const gl = (this.gl =
      // this.canvas.getContext('webgl2', contextAttributes) ||
      this.canvas.getContext('webgl', contextAttributes) ||
      this.canvas.getContext('experimental-webgl', contextAttributes))

    gl.depthFunc(gl.LEQUAL)
  }

  add(objectGl) {
    this.root.add(objectGl)

    if (this.isAutoUpdateCameraPositionZ && objectGl.isProgram) {
      objectGl.scalePatch = this.pixelRatio
    }
  }

  remove(objectGl) {
    this.root.remove(objectGl)
  }

  createProgram(option = {}) {
    const program = new Program(this, option)
    if (option.isAutoAdd) {
      this.add(program)
    }
    return program
  }

  createGroup(option = {}) {
    const group = new ObjectGl(this, option)
    if (option.isAutoAdd) {
      this.add(group)
    }
    return group
  }

  createEffect(EffectClass, option) {
    const effect = new EffectClass(this, option)
    this.effectList.push(effect)
    return effect
  }

  createFramebuffer(
    key,
    width = this.canvas.width,
    height = this.canvas.height
  ) {
    const { gl } = this

    const framebuffer = gl.createFramebuffer()
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
    const depthRenderBuffer = gl.createRenderbuffer()
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthRenderBuffer)
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height)
    gl.framebufferRenderbuffer(
      gl.FRAMEBUFFER,
      gl.DEPTH_ATTACHMENT,
      gl.RENDERBUFFER,
      depthRenderBuffer
    )
    const texture = gl.createTexture()
    const textureIndex = ++this.textureIndex
    gl.activeTexture(gl[`TEXTURE${textureIndex}`])
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      width,
      height,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null
    )
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      texture,
      0
    )
    gl.bindRenderbuffer(gl.RENDERBUFFER, null)
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)

    this.framebuffers[key] = {
      framebuffer,
      textureIndex,
      texture,
      depthRenderBuffer,
    }
  }

  resizeFramebuffer(
    key,
    width = this.canvas.width,
    height = this.canvas.height
  ) {
    const { gl } = this
    const {
      framebuffer,
      textureIndex,
      depthRenderBuffer,
      isFloat,
    } = this.framebuffers[key]
    if (isFloat) return

    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthRenderBuffer)
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height)
    gl.framebufferRenderbuffer(
      gl.FRAMEBUFFER,
      gl.DEPTH_ATTACHMENT,
      gl.RENDERBUFFER,
      depthRenderBuffer
    )
    gl.activeTexture(gl[`TEXTURE${textureIndex}`])
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      width,
      height,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null
    )
  }

  createFramebufferFloat(key, width, height = width) {
    const { gl } = this
    const textureFloat = gl.getExtension('OES_texture_float')
    const textureHalfFloat = gl.getExtension('OES_texture_half_float')

    if (!(textureFloat || textureHalfFloat)) {
      console.error('float texture not support')
      return
    }

    const flg = textureHalfFloat ? textureHalfFloat.HALF_FLOAT_OES : gl.FLOAT
    const framebuffer = gl.createFramebuffer()
    const texture = gl.createTexture()
    const textureIndex = ++this.textureIndex

    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
    gl.activeTexture(gl[`TEXTURE${textureIndex}`])
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      width,
      height,
      0,
      gl.RGBA,
      flg,
      null
    )
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      texture,
      0
    )
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)

    this.framebuffers[key] = {
      framebuffer,
      textureIndex,
      texture,
      isFloat: true,
    }
  }

  bindFramebuffer(key) {
    const { gl } = this

    gl.bindFramebuffer(
      gl.FRAMEBUFFER,
      key ? this.framebuffers[key].framebuffer : null
    )
  }

  unbindFramebuffer() {
    const { gl } = this

    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  }

  setPixelRatio() {
    this.pixelRatio = this.pixelRatioFixed
      ? this.pixelRatioFixed
      : this.pixelRatioMax
      ? Math.min(this.pixelRatioMax, window.devicePixelRatio)
      : window.devicePixelRatio
  }

  resize() {
    const { gl } = this

    this.canvas.width = ''
    this.canvas.height = ''
    this.canvasNativeWidth = this.canvas.clientWidth
    this.canvasNativeHeight = this.canvas.clientHeight

    this.setPixelRatio()
    const { pixelRatio } = this

    if (this.isAutoUpdateCameraPositionZ) {
      this.root.forEachProgram((program) => {
        program.scalePatch = this.pixelRatio
      })
    }

    const windowWidth = Math.max(
      Math.min(window.innerWidth, window.outerWidth),
      this.canvasNativeWidth
    )

    this.width = this.widthView = this.isFullSize
      ? windowWidth
      : this.canvasNativeWidth
    this.height = this.isFullSize
      ? Math.max(
          Math.min(window.innerHeight, window.outerHeight),
          this.canvasNativeHeight
        )
      : this.canvasNativeHeight

    this.root.scalePatch =
      this.height > this.width ? this.width / this.height : 1

    const width = Math.floor(this.width * pixelRatio)
    const height = Math.floor(this.height * pixelRatio)

    this.canvas.width = width
    this.canvas.height = height

    gl.viewport(0, 0, width, height)

    this.root.forEachProgram((program) => {
      if (program.isAutoResolution) {
        program.uniforms.uResolution = [width, height]
      }

      if (program.isPoint) {
        program.uniforms.uPixelRatio = this.pixelRatio
      }
    })

    this.effectList.forEach((program) => {
      if (program.isAutoResolution) {
        program.uniforms.uResolution = [width, height]
      }
    })

    Object.keys(this.framebuffers).forEach((key) => {
      this.resizeFramebuffer(key)
    })

    if (this.hasCamera) {
      this.aspect = width / height
      this.updateCamera()
    }
    if (this.hasLight) {
      this.updateLight()
    }
  }

  setIsUpdateMatrix() {
    this.isUpdateMatrix = true
    this.root.setIsUpdateMatrix()
  }

  updateCamera() {
    const { cameraPosition, cameraRotation, vMatrix, pMatrix, vpMatrix } = this

    if (this.isAutoUpdateCameraPositionZ) {
      cameraPosition[2] =
        Math.min(this.canvas.width, this.canvas.height) /
        2 /
        Math.tan((this.fov / 2) * (Math.PI / 180))

      this.far = cameraPosition[2] + this.extraFar
    }

    if (this.hasLight) {
      this.eyeDirection = cameraPosition
    }

    lookAt(
      cameraPosition,
      [cameraPosition[0], cameraPosition[1], 0],
      [0, 1, 0],
      vMatrix
    )
    perspective(this.fov, this.aspect, this.near, this.far, pMatrix)

    cameraRotation[0] = cameraRotation[0] % (Math.PI * 2)
    cameraRotation[1] = cameraRotation[1] % (Math.PI * 2)
    rotate(vMatrix, cameraRotation[0], [0, 1, 0], vMatrix)
    rotate(vMatrix, cameraRotation[1], [-1, 0, 0], vMatrix)

    multiply(pMatrix, vMatrix, vpMatrix)

    this.setIsUpdateMatrix()
  }

  updateLight() {
    const { lightDirection, eyeDirection, ambientColor } = this

    this.root.forEachProgram((program) => {
      if (program.hasLight) {
        program.uniforms.uLightDirection = lightDirection
        program.uniforms.uEyeDirection = eyeDirection
        program.uniforms.uAmbientColor = ambientColor
      }
    })
  }

  updateMatrix() {
    if (!this.isUpdateMatrix) return

    this.root.updateMatrix(this.vpMatrix)
    this.isUpdateMatrix = false
  }

  clear() {
    const { gl } = this
    gl.clearColor(
      this.clearedColor[0],
      this.clearedColor[1],
      this.clearedColor[2],
      this.clearedColor[3]
    )
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  }

  draw() {
    if (!this.disableClear) {
      this.clear()
    }

    this.root.forEachProgram((program) => {
      program.draw()
    })
  }

  destroy() {
    const { gl } = this

    Object.keys(this.framebuffers).forEach((key) => {
      const { framebuffer, texture, depthRenderBuffer } = this.framebuffers[key]
      gl.deleteFramebuffer(framebuffer)
      gl.deleteTexture(texture)
      if (depthRenderBuffer) {
        gl.deleteRenderbuffer(depthRenderBuffer)
      }
    })

    this.root.forEachProgram((program) => {
      program.destroy()
    })

    gl.getExtension('WEBGL_lose_context')?.loseContext() // eslint-disable-line no-unused-expressions
  }
}
