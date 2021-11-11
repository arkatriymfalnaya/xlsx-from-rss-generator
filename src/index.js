const ExcelJS = require('exceljs')
const Parser = require('rss-parser')
const posthtml = require('posthtml')
const rp = require('request-promise')
const moment = require('moment')
const ProgressBar = require('progress')
const yargs = require("yargs")

const parser = new Parser()

let convertFeedToPosts = feed => [...feed.items.map(item => item.link)]

let generatePostsTextFromFeed = async (feed, amount) => {
  let res = []

  let posts = []
  let feedLink = feed.link

  if (amount > 10) {
    process.stdout.write(`wow, so much posts? taking care of it...\n`)
    let pages = Math.round(amount / 10)
    let pagesLoadingBar = new ProgressBar('[:bar] :current/:total processed\n', {
      incomplete: ' ',
      complete: '#',
      total: pages
    })

    posts.push(...convertFeedToPosts(feed))

    process.stdout.write(`loading needed pages...\n`)
    for (let i = 2; i <= pages; i++) {
      await rp(encodeURI(`${feedLink}?feed=rss&paged=${i}`))
        .then(async rssPage => {
          let parsedRSSFeed = await parser.parseString(rssPage)
          let isLastPage = i === pages

          if (isLastPage) {
            let modItems = parsedRSSFeed.items.filter((_, index) => index < amount % 10)

            posts.push(...convertFeedToPosts({ items: modItems }))
          } else {
            posts.push(...convertFeedToPosts(parsedRSSFeed))
          }

          pagesLoadingBar.tick()
        })
        .catch(err => {
            console.error('huh, rss pagination failed', err.code)
        })
    }
  } else {
    process.stdout.write(`not a lot of posts, gonna be quick!\n`)
    posts.push(...convertFeedToPosts({
      items: feed.items.slice(0, amount)
    }))
  }

  process.stdout.write(`time to generate some text for our table!\n`)
  let postsHandlingBar = new ProgressBar('[:bar] :current/:total posts handled\n', {
    incomplete: ' ',
    complete: '#',
    total: posts.length
  })

  for (let i = 0; i < posts.length; i++) {
    let postLink = posts[i]
    let title, description

    await rp(postLink)
      .then(html => {
        process.stdout.write(`wuush, working on it...\n`)
        posthtml().use(tree => {
          tree.match({ tag: 'title' }, node => {
            title = node.content[0]
          })
          tree.match({ attrs: { name: 'description' }, tag: 'meta' }, node => {
            description = node.attrs.content
          })
        }).process(html)

        postsHandlingBar.tick()
      })
      .catch(err => {
          console.error('huh, post parsing failed', err)
      })

    res.push({
      title,
      description,
      link: postLink
    })
  }

  return res
}

let entry = async (rssFeed, amount = 5, outputFileName = 'result') => {
  process.stdout.write(`parsing your rss feed...\n`)
  let feed = await parser.parseURL(rssFeed)

  process.stdout.write(`creating excel workbook...\n`)
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet(outputFileName)
  worksheet.columns = [
    { header: 'text', key: 'col_text' },
    { header: 'url', key: 'col_url' },
    { header: 'images', key: 'col_images' },
    { header: 'time', key: 'col_time' }
  ]

  process.stdout.write(`generating posts from rss feed...\n`)
  let generatedRows = await generatePostsTextFromFeed(feed, amount)
  let generatedRowsBar = new ProgressBar('[:bar] :current/:total table rows generated\n', {
    incomplete: ' ',
    complete: '#',
    total: generatedRows.length
  })

  process.stdout.write(`making some rows for your sheet...\n`)
  for (let i = 0; i < generatedRows.length; i++) {
    let { title, description, link } = generatedRows[i]
    let columnText = `${title}\n\n${description}\n\n${link}`

    worksheet.addRow({
      col_text: columnText,
      col_url: link,
      col_images: '',
      col_time: moment().add(i, 'days').format('DD/MM/YYYY hh:mm').toString()
    })

    generatedRowsBar.tick()
  }

  process.stdout.write(`creating your ${outputFileName} file...\n`)
  await workbook.xlsx.writeFile(`${outputFileName}.xlsx`)
    .then(() => {
      process.stdout.write(`${outputFileName} created allright!\n`)
    })
    .catch((err) => {
      process.stdout.write('huh, creating error: ', err)
    })
  
  process.stdout.write(`all done, love!\n`)
}

const options = yargs
  .usage(`Usage: -f <rss uri>`)
  .option('f', { alias: 'feed', describe: 'RSS feed uri', type: 'string', demandOption: true })
  .option('a', { alias: 'amount', describe: 'Needed RSS feed posts amount', type: 'string' })
  .option('n', { alias: 'outputFileName', describe: 'XLS output file name', type: 'string' })
  .argv

process.stdout.write(`great options, bruh, let's start already!\n`)

entry(options.feed, options.amount, options.outputFileName)
