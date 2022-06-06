export function onLoadImage(el) {
  return new Promise((resolve) => {
    if (el.complete) {
      resolve(el)
    } else {
      el.addEventListener('load', () => {
        resolve(el)
      })
    }
  })
}

const cacheLoadImage = {}

export function loadImage(src, isCrossOrigin) {
  const isArray = typeof src === 'object' && src.constructor.name === 'Array'
  const promises = []
  ;(isArray ? src : [src]).forEach((srcString) => {
    const cache = cacheLoadImage[srcString]
    if (cache) {
      promises.push(Promise.resolve(cache))
      return
    }
    const img = document.createElement('img')
    if (isCrossOrigin) img.crossOrigin = 'anonymous'
    img.src = srcString
    const promiseLoad = onLoadImage(img)
    promiseLoad.then(() => {
      cacheLoadImage[srcString] = img
    })
    promises.push(promiseLoad)
  })
  return isArray ? Promise.all(promises) : promises[0]
}

export function mix(x, y, a) {
  return x * (1 - a) + y * a
}
