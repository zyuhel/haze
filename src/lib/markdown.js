import marked from 'marked'
import DOMPurify from 'dompurify'

marked.setOptions({
  // sanitize: true,
  gfm: true,
  breaks: true
})

const renderer = new marked.Renderer()

renderer.image = function (href, title, text) {
  return ''
}

renderer.link = function (href, title, text) {
  const linkPattern = /^(eth|bch|bitcoin|https?|s?ftp|magnet|tor|onion|tg):(.*)$/i
  const emailPattern = /^(mailto):[^@]+@[^@]+\.[^@]+$/i

  if (linkPattern.test(href)) {
    return `<a onClick="window.open('${href}', '_blank', 'resizable,scrollbars,status,noopener'); return false;">${href}</a>`
  } else if (emailPattern.test(href)) {
    return `<a href="${href}">${text}</a>`
  }

  return text
}

renderer.heading = function (text) {
  return `<p>${text}</p>`
}

/**
 * Renders markdown-formatted input to HTML
 * @param {string} text text to render
 * @returns {string} resulting HTML
 */
export function renderMarkdown (text = '') {
  // return marked(text, { renderer })
  // return DOMPurify.sanitize(marked(text, { renderer }))
  return marked(DOMPurify.sanitize(text), { renderer })
}

export function removeFormats (text = '') {
  // get first line
  const line = /^([^\n]*)\n?/.exec(text)[1]

  const node = document.createElement('div')
  node.innerHTML = marked(DOMPurify.sanitize(line), { renderer })

  return node.textContent || node.innerText || ''
}
