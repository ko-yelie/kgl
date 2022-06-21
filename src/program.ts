import ObjectGl, { Option as OptionObjectGl } from './object'
import { createMatrix, inverse } from './minMatrix'
import Kgl, { KglTexture } from './kgl'
import { Matrix } from './vector'
import {
  attributeNone,
  Attributes,
  AttributeValue,
  getShapeCube,
  getShapeCylinder,
  getShapePlane,
  vertexShaderShape,
} from './shape'

type UniformValue = any

type Uniforms = {
  [K: string]: UniformValue
}

export type Texture = {
  texture: WebGLTexture
  textureIndex: number
}

type Mode =
  | 'POINTS'
  | 'LINE_STRIP'
  | 'LINE_LOOP'
  | 'LINES'
  | 'TRIANGLE_STRIP'
  | 'TRIANGLE_FAN'
  | 'TRIANGLES'

type DrawType = 'STATIC_DRAW' | 'DYNAMIC_DRAW' | 'STREAM_DRAW'

type AttributeProgram = {
  location: number
  size?: number
  isInstanced: boolean
  ibo?: WebGLBuffer | null
  vbo?: WebGLBuffer | null
}

type AnyData = { [K: string]: any }

export type Option = {
  shape?: 'plane' | 'cube' | 'cylinder' | 'point'
  vertexShaderId?: string
  vertexShader?: string
  fragmentShaderId?: string
  fragmentShader?: string
  attributes?: Attributes
  instancedAttributes?: Attributes
  uniforms?: Uniforms
  mode?: Mode
  drawType?: DrawType
  isTransparent?: boolean
  isAdditive?: boolean
  isFloats?: boolean
  isCulling?: boolean
  isDepth?: boolean
  isHidden?: boolean
  isAutoResolution?: boolean
  hasCamera?: boolean
  hasLight?: boolean

  width?: number
  height?: number
  size?: number

  data?: AnyData
} & OptionObjectGl

export default class Program extends ObjectGl {
  isProgram = true
  isPoint = false
  attributes: { [K: string]: AttributeProgram } = {}
  uniforms: Uniforms = {}
  textures: { [K: string]: Texture } = {}

  gl: WebGLRenderingContext

  kglTextures: KglTexture[] = []

  id: number = -1

  invMatrix?: Matrix

  mode?: Mode
  glMode: GLenum
  drawType: DrawType
  isTransparent: boolean
  isAdditive: boolean
  isAutoResolution: boolean
  hasCamera: boolean
  hasLight: boolean
  isCulling: boolean
  isDepth: boolean
  isInstanced: boolean
  isHidden: boolean

  instancedArraysExt?: ANGLE_instanced_arrays

  vertexShader: WebGLShader | null = null
  fragmentShader: WebGLShader | null = null
  program: WebGLProgram | null = null

  indicesCount?: number
  instanceCount?: number
  count?: number

  // ShapePlane
  width?: number
  height?: number

  // ShapeCube
  size?: number

  // ShapeCylinder
  radius?: number
  radiusTop?: number
  radiusBottom?: number
  radialSegments?: number
  heightSegments?: number
  openEnded?: boolean
  thetaStart?: number
  thetaLength?: number

  data: AnyData = {}

  private _dummyCanvas?: HTMLCanvasElement

  constructor(kgl: Kgl, option: Option = {}) {
    const {
      shape,
      vertexShaderId,
      vertexShader = vertexShaderId &&
      document.getElementById(vertexShaderId) &&
      document.getElementById(vertexShaderId)!.textContent
        ? document.getElementById(vertexShaderId)!.textContent!
        : shape
        ? vertexShaderShape.d3
        : vertexShaderShape.d2,
      fragmentShaderId,
      fragmentShader = fragmentShaderId &&
      document.getElementById(fragmentShaderId) &&
      document.getElementById(fragmentShaderId)!.textContent
        ? document.getElementById(fragmentShaderId)!.textContent!
        : '',
      attributes,
      instancedAttributes,
      uniforms = {},
      mode = shape === 'point' ? 'POINTS' : undefined,
      drawType = 'STATIC_DRAW',
      isTransparent = false,
      isAdditive = false,
      isFloats = false,
      isCulling = true,
      isDepth = false,
      isHidden = false,
      isAutoResolution = !isFloats && !uniforms.uResolution,
      hasCamera = !isFloats && kgl.hasCamera,
      hasLight = !isFloats && kgl.hasLight,
    } = option

    const isWhole = !(
      option.shape ||
      option.vertexShaderId ||
      option.vertexShader
    )

    const hasMatrix = !isWhole && hasCamera

    super(kgl, option, hasMatrix)

    this.isProgram = true
    this.isPoint = shape === 'point'
    this.attributes = {}
    this.uniforms = {}
    this.textures = {}

    const { gl } = kgl
    this.gl = gl!
    this.kglTextures = kgl.textures

    kgl.indexProgram = kgl.indexProgram + 1
    this.id = kgl.indexProgram

    if (hasLight) {
      this.invMatrix = createMatrix()
    }

    this.mode = mode
    this.glMode = this.gl[mode || 'TRIANGLE_STRIP']
    this.drawType = drawType
    this.isTransparent = isTransparent
    this.isAdditive = isAdditive
    this.isAutoResolution = isAutoResolution
    this.hasCamera = hasCamera
    this.hasLight = hasLight
    this.isCulling = isCulling
    this.isDepth = isDepth
    this.isInstanced = !!instancedAttributes
    this.isHidden = isHidden

    this.createProgram(vertexShader, fragmentShader)

    this.use()

    if (isWhole) {
      this.createAttribute(attributeNone)
    } else if (shape && shape !== 'point') {
      let shapeData
      switch (shape) {
        case 'plane':
          shapeData = getShapePlane(this, {
            hasLight: this.hasLight,
            width: option.width,
            height: option.height,
          })
          break
        case 'cube':
          shapeData = getShapeCube(this, {
            hasLight: this.hasLight,
            size: option.size,
          })
          break
        case 'cylinder':
          shapeData = getShapeCylinder(this, {
            hasLight: this.hasLight,
            ...option,
          })
          break
      }
      if (shapeData) {
        this.createAttribute(shapeData.attributes)
        uniforms.uResolutionShape = shapeData.resolution
      }
    } else if (attributes) {
      this.createAttribute(attributes)
    }

    if (this.isInstanced && instancedAttributes) {
      const instancedArraysExt = this.gl.getExtension('ANGLE_instanced_arrays')
      if (instancedArraysExt == null) {
        alert('ANGLE_instanced_arrays not supported')
        return
      }
      this.instancedArraysExt = instancedArraysExt
      this.createAttribute(instancedAttributes, true)
    }

    this.createUniform(uniforms)

    if (option.data) {
      this.data = option.data
    }
  }

  createProgram(codeVertexShader: string, codeFragmentShader: string) {
    const { gl } = this

    const program = gl.createProgram()!

    const vertexShader = this.createShader('VERTEX_SHADER', codeVertexShader)
    if (!vertexShader) return
    gl.attachShader(program, (this.vertexShader = vertexShader))

    const fragmentShader = this.createShader(
      'FRAGMENT_SHADER',
      codeFragmentShader
    )
    if (!fragmentShader) return
    gl.attachShader(program, (this.fragmentShader = fragmentShader))

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

  createShader(type: 'VERTEX_SHADER' | 'FRAGMENT_SHADER', content: string) {
    const { gl } = this
    const shader = gl.createShader(gl[type])!

    gl.shaderSource(shader, content)
    gl.compileShader(shader)

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(shader))
      return
    }

    return shader
  }

  createAttribute(data: Attributes, isInstanced = false) {
    Object.keys(data).forEach((key) => {
      const { value, size, isIndices } = data[key]

      this.addAttribute(key, value, size, isIndices, isInstanced)
    })
  }

  addAttribute(
    key: string,
    value: AttributeValue,
    size?: number,
    isIndices: boolean = false,
    isInstanced: boolean = false
  ) {
    const { gl } = this
    const location = gl.getAttribLocation(this.program!, key)
    const attribute: AttributeProgram = {
      location,
      size,
      isInstanced,
    }

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
        this.instanceCount = this.instanceCount || value.length / size!
      }
      this.count = this.count || value.length / size!
    }

    this.attributes[key] = attribute
  }

  setAttribute(key: string) {
    const { gl } = this
    const { location, size, vbo, ibo, isInstanced } = this.attributes[key]

    if (ibo) {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo)
    } else if (vbo) {
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
      gl.enableVertexAttribArray(location)
      gl.vertexAttribPointer(location, size!, gl.FLOAT, false, 0, 0)
      if (isInstanced)
        this.instancedArraysExt!.vertexAttribDivisorANGLE(location, 1)
    }
  }

  updateAttribute(key: string, values: AttributeValue, offset = 0) {
    const { gl } = this

    gl.bindBuffer(gl.ARRAY_BUFFER, this.attributes[key].vbo!)
    gl.bufferSubData(gl.ARRAY_BUFFER, offset, new Float32Array(values))
  }

  updateMatrix(vpMatrix: Matrix) {
    if (!this.hasMatrix) return

    const isUpdateMatrix = super.updateMatrix(vpMatrix)
    if (!isUpdateMatrix) return

    if (this.hasCamera) {
      this.uniforms.uMvpMatrix = this.mvpMatrix
    }

    if (this.hasLight) {
      inverse(this.mMatrix, this.invMatrix!)
      this.uniforms.uInvMatrix = this.invMatrix
    }

    return isUpdateMatrix
  }

  createUniform(data: Uniforms) {
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
    if (this.isPoint) {
      mergedData.uPixelRatio = this.kgl.pixelRatio
    }

    Object.keys(mergedData).forEach((key) => {
      this.addUniform(key, mergedData[key])
    })
  }

  addUniform(key: string, value: UniformValue) {
    let originalType
    let uniformType
    let _value = value

    const getTypeFromString = (type: string, value?: UniformValue) => {
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

    const location = this.gl.getUniformLocation(this.program!, key)
    const type = `uniform${uniformType}`

    let set
    switch (originalType) {
      case 'texture':
        set = (value: UniformValue) => {
          this.use()
          switch (typeof value) {
            case 'number':
              ;(this.gl as any)[type](location, value)
              _value = value
              break
            case 'string':
              _value = this.textures[value].textureIndex
              ;(this.gl as any)[type](location, _value)
              break
            default:
              _value = this.updateTexture(key, value)
          }
        }
        break
      case 'framebuffer':
        set = (framebufferKey: string) => {
          this.use()
          ;(this.gl as any)[type](
            location,
            this.kgl.framebuffers[framebufferKey].textureIndex
          )
          _value = framebufferKey
        }
        break
      case 'matrix':
        set = (newValue: Float32Array) => {
          this.use()
          ;(this.gl as any)[type](location, false, newValue)
          _value = newValue
        }
        break
      default:
        set = (newValue: UniformValue) => {
          this.use()
          ;(this.gl as any)[type](location, newValue)
          _value = newValue
        }
    }

    Object.defineProperty(this.uniforms, key, {
      get: () => _value,
      set,
    })

    if (typeof _value !== 'undefined') this.uniforms[key] = _value
  }

  updateUniforms(uniforms: { [K: string]: UniformValue }) {
    const keys = Object.keys(uniforms)
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      this.uniforms[key] = uniforms[key]
    }
  }

  createTexture(key: string, el: TexImageSource) {
    if (!el) return

    const { gl } = this

    let texture, textureIndex

    const textureMatch = this.kglTextures.filter(
      ({ src }) => (el as HTMLImageElement).currentSrc === src
    )[0]

    if (textureMatch) {
      texture = textureMatch.texture
      textureIndex = textureMatch.textureIndex
    } else {
      texture = gl.createTexture()!
      const textureDeleted = this.kglTextures.filter(
        ({ isActive }) => !isActive
      )[0]
      const indexDeleted = textureDeleted ? textureDeleted.textureIndex : -1
      textureIndex = indexDeleted >= 0 ? indexDeleted : ++this.kgl.textureIndex
      this.kglTextures[textureIndex] = {
        isActive: true,
        texture,
        textureIndex,
        src: (el as HTMLImageElement).currentSrc,
      }
    }

    this.textures[key] = {
      texture,
      textureIndex,
    }

    gl.activeTexture(gl.TEXTURE0 + textureIndex)
    gl.bindTexture(gl.TEXTURE_2D, texture)
    // gl.generateMipmap(gl.TEXTURE_2D)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, el)

    return textureIndex
  }

  updateTexture(key: string, el: TexImageSource) {
    const { gl } = this
    const { textureIndex } = this.textures[key]

    gl.activeTexture(gl.TEXTURE0 + textureIndex)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, el)

    return textureIndex
  }

  use() {
    if (this.id === this.kgl.currentProgramId) return

    this.gl.useProgram(this.program)
    this.kgl.currentProgramId = this.id
  }

  visible() {
    this.isHidden = false
  }

  hidden() {
    this.isHidden = true
  }

  draw() {
    if (this.isHidden) return

    const { gl } = this

    if (this.isUpdateMatrix) {
      this.kgl.updateMatrix()
    }

    this.use()

    if (this.isTransparent) {
      gl.enable(gl.BLEND)
      gl.blendFuncSeparate(
        gl.SRC_ALPHA,
        gl.ONE_MINUS_SRC_ALPHA,
        gl.ONE,
        gl.ONE_MINUS_SRC_ALPHA
      )
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
        this.instancedArraysExt!.drawElementsInstancedANGLE(
          this.glMode,
          this.indicesCount,
          gl.UNSIGNED_SHORT,
          0,
          this.instanceCount!
        )
      } else {
        this.instancedArraysExt!.drawArraysInstancedANGLE(
          this.glMode,
          0,
          this.count!,
          this.instanceCount!
        )
      }
    } else {
      if (this.indicesCount) {
        gl.drawElements(this.glMode, this.indicesCount, gl.UNSIGNED_SHORT, 0)
      } else {
        gl.drawArrays(this.glMode, 0, this.count!)
      }
    }
  }

  destroy() {
    const { gl } = this

    gl.deleteShader(this.vertexShader)
    gl.deleteShader(this.fragmentShader)

    Object.keys(this.attributes).forEach((key) => {
      const { vbo, ibo } = this.attributes[key]
      gl.deleteBuffer(vbo! || ibo!)
    })

    Object.keys(this.textures).forEach((key) => {
      const { texture, textureIndex } = this.textures[key]
      gl.deleteTexture(texture)
      this.kglTextures[textureIndex].isActive = false
    })

    gl.deleteProgram(this.program)
  }
}
