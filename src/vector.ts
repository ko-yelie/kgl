export class Vec2 extends Float32Array {
  constructor(initialValues?: [number, number]) {
    initialValues ? super(initialValues) : super(2)
  }
}

export class Vec3 extends Float32Array {
  constructor(initialValues?: [number, number, number]) {
    initialValues ? super(initialValues) : super(3)
  }
}

export class Vec4 extends Float32Array {
  constructor(initialValues?: [number, number, number, number]) {
    initialValues ? super(initialValues) : super(4)
  }
}

export class Matrix extends Float32Array {
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
    initialValues ? super(initialValues) : super(16)
  }
}
