import Kgl from '../../src/index.js'

// const width = window.innerWidth
const width = window.innerHeight
const widthHalf = width / 2
const height = window.innerHeight
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
  onResize (gl) {
    gl.programs.main.use()
    const width = window.innerHeight
    const height = window.innerHeight
    gl.programs.main.uniforms.resolution = [width, height]
  },
  tick (gl, time) {
    // gl.cameraPosition[2] = (Math.sin(time) * 0.5 + 0.5) * 1000
    // gl.updateCamera()
    gl.programs.main.draw({
      time
    })
  },
})
