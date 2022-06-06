const express = require('express')
const puppeteer = require('puppeteer')
const app = express()
const port = 3000


const createPdf = async (url, sessionId) => {

  console.log(`Generating pdf for url: ${url}`)

  const browser = await puppeteer.launch()

  const page = await browser.newPage()

  await page.setViewport({ width: 1280, height: 1024 })

  await Promise.all([
    page.goto(url, { waitUntil: "networkidle0" })
  ])

  const pdf = await page.pdf({
    format: "A4",
    landscape: true,
    margin: { top: "10mm", right: "5mm", bottom: "10mm", left: "5mm" },
    printBackground: true
  })

  await browser.close()

  return pdf
}

app.get('/test', function(req, res) {
    res.sendFile('test.html', {root: __dirname })
});

app.get('/', (req, res) => {

  if (req.query.url == null) {
    res.status(400).send("Invalid param")
    return
  }

  let url = req.query.url

  createPdf(
    url,
    req.query.sessionId
  ).then(file => {
    res
      .type("pdf")
      .set("Content-Disposition", 'attachment; filename="document.pdf"')
      .send(file)
  }).catch(e => {
    console.log(e)
    res.status(500).send("Unable to generate the PDF.");
  })
})

app.listen(port, () => {})

