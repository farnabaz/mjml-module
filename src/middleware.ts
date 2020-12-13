
import { getTemplatesList } from './helpers'

export default async function (req, res, next) {
  const url = req.url || '/'
  const urlArgs = url.substr(1).split('/')
  const template = decodeURIComponent(urlArgs.shift() || '')

  if (template === '__templates_list') {
    const templates = await getTemplatesList()
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(templates))
    return
  }

  next()
}
