import Kgl from '../src/index.js'

const gl = new Kgl({
  programs: {
    main: {
      fragmentShaderId: 'fs',
      uniforms: {
        time: 0
      },
    }
  },
  tick (time) {
    gl.programs.main.draw({
      time
    })
  },
})
