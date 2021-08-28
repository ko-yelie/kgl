import Kgl from '../../src/index.js'

new Kgl({
  programs: {
    main: {
      fragmentShaderId: 'fs',
      uniforms: {
        time: 0,
      },
    },
  },
  tick: (kgl, time) => {
    kgl.programs.main.draw({
      time,
    })
  },
})
