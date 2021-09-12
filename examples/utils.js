export function loadImage(srcs, isCrossOrigin) {
  if (!(typeof srcs === 'object' && srcs.constructor.name === 'Array')) {
    srcs = [srcs]
  }
  const promises = []
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

export function mix(x, y, a) {
  return x * (1 - a) + y * a
}
