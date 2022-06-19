import Program from './program'
import { normalize } from './minMatrix'
import { Vec3 } from './vector'

export type AttributeValue = number[]

export type Attributes = {
  [K: string]: {
    value: AttributeValue
    size?: number
    isIndices?: boolean
  }
}

export type Shape = {
  attributes: Attributes
  resolution: [number, number]
}

export const vertexShaderShape = {
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

export const attributeNone = {
  aPosition: {
    value: [-1, 1, -1, -1, 1, 1, 1, -1],
    size: 2,
  },
}

export type OptionShapePlane = {
  width?: number
  height?: number
  hasLight?: boolean
}

export function getShapePlane(
  program: Program,
  option: OptionShapePlane = {}
): Shape {
  const { width = 1, height = 1, hasLight = false } = option

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

export type OptionShapeCube = {
  size?: number
  hasLight?: boolean
}

export function getShapeCube(
  program: Program,
  option: OptionShapeCube = {}
): Shape {
  const { size = 1, hasLight = false } = option

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

export type OptionShapeCylinder = {
  radius?: number
  radiusTop?: number
  radiusBottom?: number
  height?: number
  radialSegments?: number
  heightSegments?: number
  openEnded?: boolean
  thetaStart?: number
  thetaLength?: number
  hasLight?: boolean
}

export function getShapeCylinder(
  program: Program,
  option: OptionShapeCylinder = {}
): Shape {
  const {
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
  } = option

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
          const normal: Vec3 = new Vec3([sinTheta, slope, cosTheta])
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
