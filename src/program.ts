import ObjectGl from './object'
import { createMatrix, inverse, normalize } from './minMatrix'
import { Matrix, Vec3 } from './type'
import Kgl, { KglTexture } from './kgl'

type AttributeValue = number[]

type Attributes = {
  [K: string]: {
    value: AttributeValue
    size?: number
    isIndices?: boolean
  }
}

type UniformValue = any

type Uniforms = {
  [K: string]: UniformValue
}

type Shape = {
  attributes: Attributes
  resolution: [number, number]
}

const vertexShaderShape = {
  d2: 'attribute vec2 aPosition;void main(){gl_Position=vec4(aPosition,0.,1.);}',
  d3: `
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

type OptionShapePlane = {
  program: Program
  width: number
  height: number
  hasLight: boolean
}

function getShapePlane(option: OptionShapePlane | {} = {}): Shape {
  const {
    program,
    width = 1,
    height = 1,
    hasLight = false,
  } = option as OptionShapePlane

  program.width = width
  program.height = height

  const widthHalf = width / 2
  const heightHalf = height / 2

  const attributes: Attributes = {
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

  return { attributes, resolution: [width, height] }
}

type OptionShapeCube = {
  program: Program
  size: number
  hasLight: boolean
}

function getShapeCube(option: OptionShapeCube | {} = {}): Shape {
  const { program, size = 1, hasLight = false } = option as OptionShapeCube

  program.size = size

  const sizeHalf = size / 2

  const attributes: Attributes = {
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
    aUv: {
      value: [
        1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0,
        1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0,
      ],
      size: 2,
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

  return { attributes, resolution: [size, size] }
}

type OptionShapeCylinder = {
  program: Program
  radius: number
  radiusTop: number
  radiusBottom: number
  height: number
  radialSegments: number
  heightSegments: number
  openEnded: boolean
  thetaStart: number
  thetaLength: number
  hasLight: boolean
}

function getShapeCylinder(option: OptionShapeCylinder | {} = {}): Shape {
  const {
    program,
    radius = 1,
    radiusTop = radius,
    radiusBottom = radius,
    height = 1,
    radialSegments = 8,
    heightSegments = 1,
    openEnded = true,
    thetaStart = 0,
    thetaLength = Math.PI * 2,
    hasLight = false,
  } = option as OptionShapeCylinder

  program.radius = radius
  program.radiusTop = radiusTop
  program.radiusBottom = radiusBottom
  program.height = height
  program.radialSegments = radialSegments
  program.heightSegments = heightSegments
  program.openEnded = openEnded
  program.thetaStart = thetaStart
  program.thetaLength = thetaLength

  const indices: number[] = []
  const vertices: number[] = []
  const normals: number[] = []
  const uvs: number[] = []

  // helper variables
  let index = 0
  const indexArray: number[][] = []
  const halfHeight = height / 2

  // generate geometry
  generateTorso()

  if (openEnded === false) {
    if (radiusTop > 0) generateCap(true)
    if (radiusBottom > 0) generateCap(false)
  }

  function generateTorso() {
    // this will be used to calculate the normal
    const slope = (radiusBottom - radiusTop) / height

    // generate vertices, normals and uvs
    for (let y = 0; y <= heightSegments; y++) {
      const indexRow: number[] = []

      const v = y / heightSegments

      // calculate the radius of the current row
      const radius = v * (radiusBottom - radiusTop) + radiusTop

      for (let x = 0; x <= radialSegments; x++) {
        const u = x / radialSegments

        const theta = u * thetaLength + thetaStart

        const sinTheta = Math.sin(theta)
        const cosTheta = Math.cos(theta)

        // vertex
        vertices.push(
          radius * sinTheta,
          -v * height + halfHeight,
          radius * cosTheta
        )

        // normal
        if (hasLight) {
          const normal: Vec3 = [sinTheta, slope, cosTheta]
          normalize(normal)
          normals.push(normal[0], normal[1], normal[2])
        }

        // uv
        uvs.push(u, 1 - v)

        // save index of vertex in respective row
        indexRow.push(index++)
      }

      // now save vertices of the row in our index array
      indexArray.push(indexRow)
    }

    // generate indices
    for (let x = 0; x < radialSegments; x++) {
      for (let y = 0; y < heightSegments; y++) {
        // we use the index array to access the correct indices
        const a = indexArray[y][x]
        const b = indexArray[y + 1][x]
        const c = indexArray[y + 1][x + 1]
        const d = indexArray[y][x + 1]

        // faces
        indices.push(a, b, d)
        indices.push(b, c, d)
      }
    }
  }

  function generateCap(isTop: boolean) {
    // save the index of the first center vertex
    const centerIndexStart = index

    const radius = isTop ? radiusTop : radiusBottom
    const sign = isTop ? 1 : -1

    // first we generate the center vertex data of the cap.
    // because the geometry needs one set of uvs per face,
    // we must generate a center vertex per face/segment
    for (let x = 1; x <= radialSegments; x++) {
      // vertex
      vertices.push(0, halfHeight * sign, 0)

      // normal
      normals.push(0, sign, 0)

      // uv
      uvs.push(0.5, 0.5)

      // increase index
      index++
    }

    // save the index of the last center vertex
    const centerIndexEnd = index

    // now we generate the surrounding vertices, normals and uvs
    for (let x = 0; x <= radialSegments; x++) {
      const u = x / radialSegments
      const theta = u * thetaLength + thetaStart

      const cosTheta = Math.cos(theta)
      const sinTheta = Math.sin(theta)

      // vertex
      vertices.push(radius * sinTheta, halfHeight * sign, radius * cosTheta)

      // normal
      normals.push(0, sign, 0)

      // uv
      uvs.push(cosTheta * 0.5 + 0.5, sinTheta * 0.5 * sign + 0.5)

      // increase index
      index++
    }

    // generate indices
    for (let x = 0; x < radialSegments; x++) {
      const c = centerIndexStart + x
      const i = centerIndexEnd + x

      if (isTop) {
        // face top
        indices.push(i, i + 1, c)
      } else {
        // face bottom
        indices.push(i + 1, i, c)
      }
    }
  }

  const attributes: Attributes = {
    aPosition: {
      value: vertices,
      size: 3,
    },
    aUv: {
      value: uvs,
      size: 2,
    },
    indices: {
      value: indices,
      isIndices: true,
    },
  }

  if (hasLight) {
    attributes.aNormal = {
      value: normals,
      size: 3,
    }
  }

  return { attributes, resolution: [radius * 2 * Math.PI, height] }
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

export type OptionProgram = {
  shape: 'plane' | 'cube' | 'cylinder' | 'point'
  vertexShaderId: string
  vertexShader: string
  fragmentShaderId: string
  fragmentShader: string
  attributes: Attributes
  instancedAttributes: Attributes
  uniforms: Uniforms
  mode: Mode
  drawType: DrawType
  isTransparent: boolean
  isAdditive: boolean
  isFloats: boolean
  isCulling: boolean
  isDepth: boolean
  isHidden: boolean
  isAutoResolution: boolean
  hasCamera: boolean
  hasLight: boolean
  hasMatrix: boolean

  width?: number
  height?: number
  size?: number
}

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

  private _dummyCanvas?: HTMLCanvasElement

  constructor(kgl: Kgl, option: OptionProgram | {} = {}) {
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
      fragmentShader = document.getElementById(fragmentShaderId) &&
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
    } = option as OptionProgram

    const hasMatrix = hasCamera

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

    const isWhole = !(
      (option as OptionProgram).shape ||
      (option as OptionProgram).vertexShaderId ||
      (option as OptionProgram).vertexShader
    )

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
          shapeData = getShapePlane({
            hasLight: this.hasLight,
            width: (option as OptionProgram).width,
            height: (option as OptionProgram).height,
            program: this,
          })
          break
        case 'cube':
          shapeData = getShapeCube({
            hasLight: this.hasLight,
            size: (option as OptionProgram).size,
            program: this,
          })
          break
        case 'cylinder':
          shapeData = getShapeCylinder({
            hasLight: this.hasLight,
            ...option,
            program: this,
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

    if (this.isInstanced) {
      const instancedArraysExt = this.gl.getExtension('ANGLE_instanced_arrays')
      if (instancedArraysExt == null) {
        alert('ANGLE_instanced_arrays not supported')
        return
      }
      this.instancedArraysExt = instancedArraysExt
      this.createAttribute(instancedAttributes, true)
    }

    this.createUniform(uniforms)
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
        set = (newValue: any) => {
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

  updateUniforms(uniforms: { [K: string]: any }) {
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
