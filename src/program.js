import ObjectGl from './object.js'
import { createMatrix, inverse } from './minMatrix.js'

const vertexShaderShape = {
  none: 'attribute vec2 aPosition;void main(){gl_Position=vec4(aPosition,0.,1.);}',
  plane: `
    attribute vec3 aPosition;
    attribute vec2 aUv;
    uniform mat4 uMvpMatrix;
    varying vec2 vUv;
    void main() {
      vUv = aUv;
      gl_Position = uMvpMatrix * vec4(aPosition, 1.);
    }
  `,
}

const attributeNone = {
  aPosition: {
    value: [-1, 1, -1, -1, 1, 1, 1, -1],
    size: 2,
  },
}

function getAttributePlane(option = {}) {
  const { width = 1, height = 1, hasLight = false } = option
  const widthHalf = width / 2
  const heightHalf = height / 2

  const attributes = {
    aPosition: {
      value: [
        -widthHalf,
        heightHalf,
        0,
        -widthHalf,
        -heightHalf,
        0,
        widthHalf,
        heightHalf,
        0,
        widthHalf,
        -heightHalf,
        0,
      ],
      size: 3,
    },
    aUv: {
      value: [0, 1, 0, 0, 1, 1, 1, 0],
      size: 2,
    },
  }

  if (hasLight) {
    attributes.aNormal = {
      value: [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0],
      size: 3,
    }
  }

  return attributes
}

function getAttributeCube(option = {}) {
  const { size = 1, hasLight = false } = option
  const sizeHalf = size / 2

  const attributes = {
    aPosition: {
      value: [
        sizeHalf,
        sizeHalf,
        -sizeHalf,
        sizeHalf,
        sizeHalf,
        sizeHalf,
        sizeHalf,
        -sizeHalf,
        sizeHalf,
        sizeHalf,
        -sizeHalf,
        -sizeHalf,
        -sizeHalf,
        sizeHalf,
        sizeHalf,
        -sizeHalf,
        sizeHalf,
        -sizeHalf,
        -sizeHalf,
        -sizeHalf,
        -sizeHalf,
        -sizeHalf,
        -sizeHalf,
        sizeHalf,
        -sizeHalf,
        sizeHalf,
        sizeHalf,
        sizeHalf,
        sizeHalf,
        sizeHalf,
        sizeHalf,
        sizeHalf,
        -sizeHalf,
        -sizeHalf,
        sizeHalf,
        -sizeHalf,
        -sizeHalf,
        -sizeHalf,
        -sizeHalf,
        sizeHalf,
        -sizeHalf,
        -sizeHalf,
        sizeHalf,
        -sizeHalf,
        sizeHalf,
        -sizeHalf,
        -sizeHalf,
        sizeHalf,
        sizeHalf,
        sizeHalf,
        sizeHalf,
        -sizeHalf,
        sizeHalf,
        sizeHalf,
        -sizeHalf,
        -sizeHalf,
        sizeHalf,
        sizeHalf,
        -sizeHalf,
        sizeHalf,
        -sizeHalf,
        sizeHalf,
        -sizeHalf,
        sizeHalf,
        sizeHalf,
        -sizeHalf,
        sizeHalf,
        -sizeHalf,
        -sizeHalf,
        -sizeHalf,
        -sizeHalf,
        -sizeHalf,
      ],
      size: 3,
    },
    indices: {
      value: [
        0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9, 10, 8, 10, 11, 12, 13, 14, 12,
        14, 15, 16, 17, 18, 16, 18, 19, 20, 21, 22, 20, 22, 23,
      ],
      isIndices: true,
    },
  }

  if (hasLight) {
    attributes.aNormal = {
      value: [
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,
        0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,
        -1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1,
        0, 0, -1,
      ],
      size: 3,
    }
  }

  return attributes
}

export default class Program extends ObjectGl {
  constructor(kgl, option = {}) {
    const {
      shape,
      vertexShaderId,
      vertexShader = vertexShaderId
        ? document.getElementById(vertexShaderId).textContent
        : shape
        ? vertexShaderShape[shape]
        : vertexShaderShape.none,
      fragmentShaderId,
      fragmentShader = document.getElementById(fragmentShaderId).textContent,
      attributes,
      instancedAttributes,
      uniforms,
      mode,
      drawType = 'STATIC_DRAW',
      isTransparent = false,
      isAdditive = false,
      isFloats = false,
      isCulling = true,
      isDepth = false,
      isAutoResolution = !isFloats && !(uniforms && uniforms.uResolution),
      hasCamera = !isFloats && kgl.hasCamera,
      hasLight = !isFloats && kgl.hasLight,
    } = option

    option.hasMatrix = hasCamera

    super(kgl, option)

    this.isProgram = true
    this.attributes = {}
    this.uniforms = {}
    this.textures = {}

    const { gl } = kgl
    this.gl = gl

    kgl.indexProgram = kgl.indexProgram + 1
    this.id = kgl.indexProgram

    if (hasLight) {
      this.invMatrix = createMatrix()
    }

    const isWhole = !(
      option.shape ||
      option.vertexShaderId ||
      option.vertexShader
    )

    this.mode = mode
    this.glMode = gl[mode || 'TRIANGLE_STRIP']
    this.drawType = drawType
    this.isTransparent = isTransparent
    this.isAdditive = isAdditive
    this.isAutoResolution = isAutoResolution
    this.hasCamera = hasCamera
    this.hasLight = hasLight
    this.isCulling = isCulling
    this.isDepth = isDepth
    this.isInstanced = instancedAttributes

    this.createProgram(vertexShader, fragmentShader)

    this.use()

    if (isWhole) {
      this.createAttribute(attributeNone)
    } else if (shape) {
      switch (shape) {
        case 'plane':
          this.createAttribute(
            getAttributePlane({
              hasLight: this.hasLight,
              width: option.width,
              height: option.height,
            })
          )
          break
        case 'cube':
          this.createAttribute(
            getAttributeCube({ hasLight: this.hasLight, size: option.size })
          )
          break
      }
    } else if (attributes) {
      this.createAttribute(attributes)
    }

    if (this.isInstanced) {
      this.instancedArraysExt = gl.getExtension('ANGLE_instanced_arrays')
      if (this.instancedArraysExt == null) {
        alert('ANGLE_instanced_arrays not supported')
        return
      }
      this.createAttribute(instancedAttributes, true)
    }

    this.createUniform(uniforms)
  }

  createProgram(vertexShader, fragmentShader) {
    const { gl } = this

    const program = gl.createProgram()
    gl.attachShader(
      program,
      (this.vertexShader = this.createShader('VERTEX_SHADER', vertexShader))
    )
    gl.attachShader(
      program,
      (this.fragmentShader = this.createShader(
        'FRAGMENT_SHADER',
        fragmentShader
      ))
    )
    gl.linkProgram(program)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program))
      return
    }

    if (!program) {
      console.error('Failed to create program.')
      return
    }

    this.program = program
  }

  createShader(type, content) {
    const { gl } = this
    const shader = gl.createShader(gl[type])

    gl.shaderSource(shader, content)
    gl.compileShader(shader)

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(shader))
      return
    }

    return shader
  }

  createAttribute(data, isInstanced) {
    Object.keys(data).forEach((key) => {
      const { value, size, isIndices } = data[key]

      this.addAttribute(key, value, size, isIndices, isInstanced)
    })
  }

  addAttribute(key, value, size, isIndices, isInstanced) {
    const { gl } = this
    const location = gl.getAttribLocation(this.program, key)
    const attribute = (this.attributes[key] = {
      location,
      size,
      isInstanced,
    })

    if (isIndices) {
      const ibo = gl.createBuffer()
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo)
      gl.bufferData(
        gl.ELEMENT_ARRAY_BUFFER,
        new Int16Array(value),
        gl[this.drawType]
      )
      attribute.ibo = ibo

      this.indicesCount = this.indicesCount || value.length
      this.glMode = gl[this.mode || 'TRIANGLES']
    } else {
      const vbo = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(value), gl[this.drawType])
      attribute.vbo = vbo

      if (isInstanced) {
        this.instanceCount = this.instanceCount || value.length / size
      }
      this.count = this.count || value.length / size
    }
  }

  setAttribute(key) {
    const { gl } = this
    const { location, size, vbo, ibo, isInstanced } = this.attributes[key]

    if (ibo) {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo)
    } else {
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
      gl.enableVertexAttribArray(location)
      gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0)
      if (isInstanced)
        this.instancedArraysExt.vertexAttribDivisorANGLE(location, 1)
    }
  }

  updateAttribute(key, values, offset = 0) {
    const { gl } = this

    gl.bindBuffer(gl.ARRAY_BUFFER, this.attributes[key].vbo)
    gl.bufferSubData(gl.ARRAY_BUFFER, offset, new Float32Array(values))
  }

  updateMatrix(vpMatrix) {
    if (!this.hasMatrix) return

    const isUpdateMatrix = super.updateMatrix(vpMatrix)
    if (!isUpdateMatrix) return

    if (this.hasCamera) {
      this.uniforms.uMvpMatrix = this.mvpMatrix
    }

    if (this.hasLight) {
      inverse(this.mMatrix, this.invMatrix)
      this.uniforms.uInvMatrix = this.invMatrix
    }
  }

  createUniform(data) {
    const mergedData = Object.assign({}, data)

    if (this.isAutoResolution && !mergedData.uResolution) {
      mergedData.uResolution = [1, 1]
    }
    if (this.hasCamera) {
      mergedData.uMvpMatrix = new Float32Array(16)
    }
    if (this.hasLight) {
      mergedData.uInvMatrix = new Float32Array(16)
      if (!mergedData.uLightDirection) mergedData.uLightDirection = [0, 0, 0]
      if (!mergedData.uEyeDirection) mergedData.uEyeDirection = [0, 0, 0]
      if (!mergedData.uAmbientColor) mergedData.uAmbientColor = [0.1, 0.1, 0.1]
    }

    Object.keys(mergedData).forEach((key) => {
      this.addUniform(key, mergedData[key])
    })
  }

  addUniform(key, value) {
    let originalType
    let uniformType
    let _value = value

    const getTypeFromString = (type, value) => {
      switch (type) {
        case 'texture':
          originalType = 'texture'
          uniformType = '1i'
          _value = this.createTexture(
            key,
            this._dummyCanvas ||
              (this._dummyCanvas = document.createElement('canvas'))
          )
          break
        case 'framebuffer':
          originalType = 'framebuffer'
          uniformType = '1i'
          _value = value
          break
        default:
          uniformType = type
          _value = value
      }
    }

    switch (typeof value) {
      case 'number':
        uniformType = '1f'
        break
      case 'boolean':
        uniformType = '1i'
        break
      case 'string':
        getTypeFromString(value)
        break
      case 'object':
        switch (value.constructor.name) {
          case 'Float32Array':
          case 'Array':
            switch (value.length) {
              case 16:
                originalType = 'matrix'
                uniformType = 'Matrix4fv'
                break
              default:
                uniformType = `${value.length}fv`
            }
            break
          case 'HTMLImageElement':
          case 'HTMLVideoElement':
          case 'HTMLCanvasElement':
            originalType = 'texture'
            uniformType = '1i'
            _value = this.createTexture(key, value)
            break
          case 'Object':
            getTypeFromString(value.type, value.value)
            break
        }
        break
    }

    if (!uniformType) {
      console.error(`Failed to add uniform "${key}".`)
      return
    }

    const location = this.gl.getUniformLocation(this.program, key)
    const type = `uniform${uniformType}`

    let set
    switch (originalType) {
      case 'texture':
        set = (value) => {
          this.use()
          switch (typeof value) {
            case 'number':
              this.gl[type](location, value)
              _value = value
              break
            case 'string':
              _value = this.textures[value].textureIndex
              this.gl[type](location, _value)
              break
            default:
              _value = this.updateTexture(key, value)
          }
        }
        break
      case 'framebuffer':
        set = (framebufferKey) => {
          this.use()
          this.gl[type](
            location,
            this.kgl.framebuffers[framebufferKey].textureIndex
          )
          _value = framebufferKey
        }
        break
      case 'matrix':
        set = (newValue) => {
          this.use()
          this.gl[type](location, false, newValue)
          _value = newValue
        }
        break
      default:
        set = (newValue) => {
          this.use()
          this.gl[type](location, newValue)
          _value = newValue
        }
    }

    Object.defineProperty(this.uniforms, key, {
      get: () => _value,
      set,
    })

    if (typeof _value !== 'undefined') this.uniforms[key] = _value
  }

  updateUniforms(uniforms) {
    const keys = Object.keys(uniforms)
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      this.uniforms[key] = uniforms[key]
    }
  }

  createTexture(key, el) {
    if (!el) return

    const { gl } = this
    const texture = gl.createTexture()
    const textureIndex = ++this.kgl.textureIndex
    this.textures[key] = {
      texture,
      textureIndex,
    }

    gl.activeTexture(gl[`TEXTURE${textureIndex}`])
    gl.bindTexture(gl.TEXTURE_2D, texture)
    // gl.generateMipmap(gl.TEXTURE_2D)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, el)

    return textureIndex
  }

  updateTexture(key, el) {
    const { gl } = this

    gl.activeTexture(gl[`TEXTURE${this.textures[key].textureIndex}`])
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, el)
  }

  use() {
    if (this.id === this.kgl.currentProgramId) return

    this.gl.useProgram(this.program)
    this.kgl.currentProgramId = this.id
  }

  draw() {
    const { gl } = this

    if (this.isUpdateMatrix) {
      this.kgl.updateMatrix()
    }

    this.use()

    if (this.isTransparent) {
      gl.enable(gl.BLEND)
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    } else if (this.isAdditive) {
      gl.enable(gl.BLEND)
      gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE, gl.ONE, gl.ONE)
    } else {
      gl.disable(gl.BLEND)
    }

    if (this.isCulling) {
      gl.enable(gl.CULL_FACE)
    } else {
      gl.disable(gl.CULL_FACE)
    }

    if (this.isDepth) {
      gl.enable(gl.DEPTH_TEST)
    } else {
      gl.disable(gl.DEPTH_TEST)
    }

    const keys = Object.keys(this.attributes)
    for (let i = 0; i < keys.length; i++) {
      this.setAttribute(keys[i])
    }

    if (this.isInstanced) {
      if (this.indicesCount) {
        this.instancedArraysExt.drawElementsInstancedANGLE(
          this.glMode,
          this.indicesCount,
          gl.UNSIGNED_SHORT,
          0,
          this.instanceCount
        )
      } else {
        this.instancedArraysExt.drawArraysInstancedANGLE(
          this.glMode,
          0,
          this.count,
          this.instanceCount
        )
      }
    } else {
      if (this.indicesCount) {
        gl.drawElements(this.glMode, this.indicesCount, gl.UNSIGNED_SHORT, 0)
      } else {
        gl.drawArrays(this.glMode, 0, this.count)
      }
    }
  }

  destroy() {
    const { gl } = this

    gl.deleteShader(this.vertexShader)
    gl.deleteShader(this.fragmentShader)

    Object.keys(this.attributes).forEach((key) => {
      const { vbo, ibo } = this.attributes[key]
      gl.deleteBuffer(vbo || ibo)
    })

    Object.keys(this.textures).forEach((key) => {
      const { texture } = this.textures[key]
      gl.deleteTexture(texture)
    })

    gl.deleteProgram(this.program)
  }
}
