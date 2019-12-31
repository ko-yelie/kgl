import Kgl from '../../src/index.js'

new Kgl({
  programs: {
    main: {
      fragmentShaderId: 'fs',
      uniforms: {
        time: 0
      },
    }
  },
  tick (gl, time) {
    gl.programs.main.draw({
      time
    })
  },
})
