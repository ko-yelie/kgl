import Kgl from '../../src/index.js'

/**
 * utils
 */
function loadImage(srcs, isCrossOrigin) {
  if (!(typeof srcs === 'object' && srcs.constructor.name === 'Array')) {
    srcs = [srcs]
  }
  let promises = []
  srcs.forEach((src) => {
    const img = document.createElement('img')
    promises.push(
      new Promise((resolve) => {
        img.addEventListener('load', () => {
          resolve(img)
        })
      })
    )
    if (isCrossOrigin) img.crossOrigin = 'anonymous'
    img.src = src
  })
  return Promise.all(promises)
}

function mix(x, y, a) {
  return x * (1 - a) + y * a
}

// https://gist.github.com/gre/1650294
function easeInOutQuint(t) {
  return t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t
}

/**
 * main
 */
;(async function main() {
  const image =
    'https://images.unsplash.com/photo-1551467013-ebce6eacb3ed?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=800&fit=max&ixid=eyJhcHBfaWQiOjE0NTg5fQ' // https://unsplash.com/photos/2-yebrH4SKM
  const speed = 1.5
  const strength = 12
  const maxRadius = window.innerWidth < 768 ? 0.4 : 0.8
  const minRadius = 0.1

  const [img] = await loadImage(image, true)

  new Kgl({
    programs: {
      mask: {
        fragmentShaderId: 'mask',
        uniforms: {
          image: img,
          imageResolution: [img.width, img.height],
        },
      },
    },
    effects: ['godray'],
    framebuffers: ['mask', 'cache', 'output'],
    tick: (kgl, time) => {
      const cTime = Math.sin(time * speed) * 0.5 + 0.5
      const halfTime = -Math.abs(cTime * 2 - 1) + 1

      kgl.bindFramebuffer('mask')
      kgl.programs['mask'].draw()

      kgl.effects['godray'].draw(
        'mask',
        'cache',
        'output',
        strength,
        [mix(kgl.canvas.width, 0, cTime), kgl.canvas.height * 0.5],
        mix(maxRadius, minRadius, halfTime),
        true
      )
    },
  })
})()
