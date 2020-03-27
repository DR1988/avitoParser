// const fetch = require('node-fetch')
import fetch from 'node-fetch'
import { parse } from 'node-html-parser'
import { JSDOM } from 'jsdom'
import * as fs from 'fs'

fetch('https://www.avito.ru/moskva/kvartiry/sdam/2-komnatnye-ASgBAQICAUSSA8gQAUDMCBSQWQ?s=104', {

}).then((d: Response) => d.text())
  .then((t: string) => {
    fs.writeFileSync('./parsed.txt', t)
    const { window } = new JSDOM(t)
    const body = window.document.getElementsByTagName('body')
    fs.writeFileSync('./body.html', body[0].outerHTML)
    const description = window.document.querySelectorAll('div.description')
    // const pricesFilter = [].slice.call(description).filter(d => d.querySelector('span.snippet-price'))
    const pricesFilter = Array.from(description).filter(d => {
      if (d.querySelector('span.snippet-price').innerHTML.includes('месяц')) return d
    })
    console.log('pricesFilter', pricesFilter)
    const flatArray = pricesFilter.map(pf => {
      const link = pf.innerHTML.replace(/\n/g, '')
        .match(/<a\s*class="snippet-link".+?<\/a>/gm)
        .map(s => `${s}\n`)
        .map(s => {
          const href = /href=".+"/gm.exec(s)
          const hrefContent = /".+"/gm.exec(href[0])
          const removedAQuotes = hrefContent[0].replace('"', '')
          return `https://avito.ru${removedAQuotes}`
        })
        .join('\n')
        .split(/,/gm)

      return {
        link: link[0],
        площадь: link[1],
        этаж: link[2],
        price: pf.querySelector('span.snippet-price').innerHTML.replace(/\n/g, '')
      }
    })
    console.log('flatArray', flatArray)
    fs.writeFileSync('./parsed.txt', JSON.stringify(flatArray, null, 2))


  })
