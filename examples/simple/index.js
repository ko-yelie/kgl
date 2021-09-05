import Kgl from '../../src/index.js'

new Kgl({
  programs: {
    main: {
      fragmentShaderId: 'fs',
      uniforms: {
        uTime: 0,
      },
    },
  },
  tick: (kgl, time) => {
    kgl.programs.main.uniforms.uTime = time
    kgl.drawAll()
  },
  isAutoResize: true,
  isAutoStart: true,
})
