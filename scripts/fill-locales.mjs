import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, '..')
const en = JSON.parse(fs.readFileSync(path.join(root, 'src/locales/en/translation.json'), 'utf8'))

function set(obj, path, value) {
  const keys = path.split('.')
  let cur = obj
  for (let i = 0; i < keys.length - 1; i++) {
    if (!cur[keys[i]]) cur[keys[i]] = {}
    cur = cur[keys[i]]
  }
  cur[keys[keys.length - 1]] = value
}

function clone(base) {
  return JSON.parse(JSON.stringify(base))
}

function apply(lang, flat) {
  const out = clone(en)
  for (const [k, v] of Object.entries(flat)) set(out, k, v)
  const dirs = [
    path.join(root, 'src/locales', lang),
    path.join(root, 'public/locales', lang),
  ]
  for (const dir of dirs) {
    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(path.join(dir, 'translation.json'), JSON.stringify(out, null, 2) + '\n')
    fs.writeFileSync(
      path.join(dir, 'common.json'),
      JSON.stringify(
        {
          welcome: out.common.welcome,
          logout: out.common.logout,
          settings: out.common.settings,
          language: out.common.language,
          currency: out.common.currency,
          save: out.common.save,
          cancel: out.common.cancel,
        },
        null,
        2,
      ) + '\n',
    )
  }
}

const files = fs.readdirSync(here).filter((f) => f.startsWith('locale-overrides') && f.endsWith('.json'))
const packs = {}
for (const file of files) {
  Object.assign(packs, JSON.parse(fs.readFileSync(path.join(here, file), 'utf8')))
}
for (const [lang, flat] of Object.entries(packs)) apply(lang, flat)
console.log('wrote', Object.keys(packs).join(', '))
