const HTML2CANVAS_SCRIPT_SRC = '/js/html2canvas.min.js'

let loadPromise = null

export const loadHtml2Canvas = () => {
  if (!import.meta.client) {
    return Promise.reject(new Error('html2canvas is only available in the browser'))
  }

  if (window.html2canvas) {
    return Promise.resolve(window.html2canvas)
  }

  if (!loadPromise) {
    loadPromise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector(`script[src="${HTML2CANVAS_SCRIPT_SRC}"]`)

      if (existingScript) {
        if (window.html2canvas) {
          resolve(window.html2canvas)
          return
        }

        existingScript.addEventListener('load', () => {
          if (window.html2canvas) {
            resolve(window.html2canvas)
            return
          }

          reject(new Error('html2canvas failed to initialize'))
        })
        existingScript.addEventListener('error', () => {
          reject(new Error('html2canvas script failed to load'))
        })
        return
      }

      const script = document.createElement('script')
      script.src = HTML2CANVAS_SCRIPT_SRC
      script.async = true
      script.onload = () => {
        if (window.html2canvas) {
          resolve(window.html2canvas)
          return
        }

        reject(new Error('html2canvas failed to initialize'))
      }
      script.onerror = () => {
        reject(new Error('html2canvas script failed to load'))
      }
      document.head.appendChild(script)
    })
  }

  return loadPromise
}
