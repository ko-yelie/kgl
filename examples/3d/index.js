import Kgl from '../../src/index.js'

// const width = window.innerWidth
const width = window.innerHeight
const height = window.innerHeight
const widthHalf = width / 2
const heightHalf = height / 2

new Kgl({
  programs: {
    main: {
      vertexShaderId: 'vs',
      fragmentShaderId: 'fs',
      attributes: {
        position: {
          value: [
            -widthHalf, heightHalf, 0,
            -widthHalf, -heightHalf, 0,
            widthHalf, heightHalf, 0,
            widthHalf, -heightHalf, 0,
          ],
          size: 3,
        },
        uv: {
          value: [
            0, 1,
            0, 0,
            1, 1,
            1, 0,
          ],
          size: 2,
        },
      },
      uniforms: {
        resolution: [width, height],
        time: 0,
      },
    }
  },
  onResize (kgl) {
    // const width = window.innerWidth
    const width = window.innerHeight
    const height = window.innerHeight
    const widthHalf = width / 2
    const heightHalf = height / 2
    kgl.programs.main.uniforms.resolution = [width, height]
    kgl.programs.main.updateAttribute('position', [
      -widthHalf, heightHalf, 0,
      -widthHalf, -heightHalf, 0,
      widthHalf, heightHalf, 0,
      widthHalf, -heightHalf, 0,
    ])
  },
  tick: (kgl, time) => {
    // kgl.cameraPosition[2] = (Math.sin(time) * 0.5 + 0.5) * 1000
    // kgl.updateCamera()
    kgl.programs.main.draw({
      time
    })
  },
})
