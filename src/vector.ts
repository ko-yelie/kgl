export class Vec2 {
  constructor(initialValues?: [number, number]) {
    return initialValues ? new Float32Array(initialValues) : new Float32Array(2)
  }
}

export class Vec3 {
  constructor(initialValues?: [number, number, number]) {
    return initialValues ? new Float32Array(initialValues) : new Float32Array(3)
  }
}

export class Vec4 {
  constructor(initialValues?: [number, number, number, number]) {
    return initialValues ? new Float32Array(initialValues) : new Float32Array(4)
  }
}

export class Matrix {
  constructor(
    initialValues?: [
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number
    ]
  ) {
    return initialValues
      ? new Float32Array(initialValues)
      : new Float32Array(16)
  }
}
