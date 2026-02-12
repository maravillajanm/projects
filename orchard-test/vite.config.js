import { defineConfig } from 'vite'
import handlebars from 'vite-plugin-handlebars'
import fs from 'fs'

const data = JSON.parse(
  fs.readFileSync('./src/data/page.json', 'utf-8')
)

export default defineConfig({
  plugins: [
    handlebars({
      context: data,
      partialDirectory: './src/templates'
    })
  ],

  build: {
    outDir: 'dist'
  }
})