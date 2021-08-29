import Kgl from '../../src/index.js'

const kgl = new Kgl({
  programs: {
    main: {
      shape: 'plane',
      width: window.innerHeight,
      height: window.innerHeight,
      fragmentShaderId: 'fs',
      uniforms: {
        time: 0,
      },
    },
  },
  onResize(kgl) {
    kgl.programs.main.width = window.innerHeight
    kgl.programs.main.height = window.innerHeight
  },
})

function tick(time) {
  time *= 0.001

  // kgl.cameraPosition[1] = Math.sin(time) * 500
  // kgl.cameraRotation[1] = Math.sin(time)
  // kgl.updateCamera()

  const scale = 1 - ((Math.sin(time * 2) + 1) / 2) * 0.5
  kgl.programs.main.scale(scale, scale, 1)
  kgl.programs.main.rotateY(Math.sin(time * 1) * 1)
  kgl.programs.main.updateUniforms({
    time,
  })

  kgl.drawAll()

  requestAnimationFrame(tick)
}
requestAnimationFrame(tick)
