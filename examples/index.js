const CLASS_NAME_INITIAL = 'kgl'
const PAGE_INITIAL = 'simple'
const CLASS_NAME_CURRENT = '-current'

const elExample = document.getElementById('example')
const elCode = document.getElementById('code')
let urlIndex
let classNameCurrent
let pageCurrent
let elLinkCurrent

const mapLink = [...document.querySelectorAll('nav a')].map((el) => {
  const { pathname } = new URL(el.href)
  const [className, page] = pathname
    .replace(/^\/?(.+?)\/index\.html/, '$1')
    .split('/')

  el.addEventListener('click', (e) => {
    e.preventDefault()

    urlIndex.searchParams.set('class', className)
    urlIndex.searchParams.set('page', page)
    history.pushState(null, '', urlIndex)

    detectExample()
  })

  return {
    el,
    className,
    page,
  }
})

detectExample()

window.addEventListener('popstate', detectExample)

function detectExample() {
  urlIndex = new URL(location.href)
  const className = urlIndex.searchParams.get('class') || CLASS_NAME_INITIAL
  const page = urlIndex.searchParams.get('page') || PAGE_INITIAL

  if (className === classNameCurrent && page === pageCurrent) return

  const directory = `${className}/${page}`
  const pathname = `${directory}/index.html`
  elExample.contentWindow.location.replace(pathname)
  elCode.href = `https://github.com/ko-yelie/kgl/blob/main/examples/${directory}`

  classNameCurrent = className
  pageCurrent = page

  detectLink()
}

function detectLink() {
  mapLink.some(({ el, className, page }) => {
    if (!(className === classNameCurrent && page === pageCurrent)) return false

    if (elLinkCurrent) {
      elLinkCurrent.classList.remove(CLASS_NAME_CURRENT)
    }

    el.classList.add(CLASS_NAME_CURRENT)
    elLinkCurrent = el

    return true
  })
}
