const fastify = require('fastify')({ logger: true })
const cheerio = require('cheerio')
const axios = require('axios')
const pLimit = require('p-limit').default

// 註冊 CORS
fastify.register(require('@fastify/cors'), {
  origin: true
})

// 清理文字內容
function cleanText(text) {
  return text
    .replace(/\s+/g, ' ')  // 將多個空白字元替換為單個空格
    .replace(/\n+/g, ' ')  // 將換行替換為空格
    .trim()
}

// 爬蟲函數
async function crawlUrl(url) {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7'
      }
    })
    const $ = cheerio.load(response.data)

    // 移除不需要的元素
    $('script, style, iframe, noscript, nav, footer, header, aside, .ad, .ads, .advertisement, .banner, .comment, .comments, .social-share, .share-buttons').remove()

    // 提取網頁標題
    const title = cleanText($('title').text())
    const metaDescription = cleanText($('meta[name="description"]').attr('content') || '')
    const ogDescription = cleanText($('meta[property="og:description"]').attr('content') || '')

    // 提取主要內容
    let mainContent = ''

    // 1. 嘗試找到主要內容區域
    const mainSelectors = [
      'article',
      'main',
      '.main-content',
      '.content',
      '#content',
      '.post-content',
      '.article-content',
      '.entry-content'
    ]

    let mainElement = null
    for (const selector of mainSelectors) {
      const element = $(selector)
      if (element.length > 0) {
        mainElement = element
        break
      }
    }

    // 2. 如果找不到主要內容區域，使用 body
    if (!mainElement) {
      mainElement = $('body')
    }

    // 3. 提取段落文字
    const paragraphs = mainElement.find('p')
      .map((i, el) => cleanText($(el).text()))
      .get()
      .filter(text => text.length > 20) // 過濾掉太短的段落

    // 4. 提取列表內容
    const lists = mainElement.find('ul li, ol li')
      .map((i, el) => cleanText($(el).text()))
      .get()
      .filter(text => text.length > 10)

    // 5. 組合內容
    mainContent = [
      title,
      metaDescription || ogDescription,
      ...paragraphs,
      ...lists
    ].filter(text => text.length > 0).join('\n\n')

    // 6. 如果內容太少，嘗試提取其他可能的內容
    if (mainContent.length < 200) {
      const additionalContent = mainElement
        .find('div, section')
        .map((i, el) => cleanText($(el).text()))
        .get()
        .filter(text => text.length > 50)
        .join('\n\n')

      if (additionalContent) {
        mainContent += '\n\n' + additionalContent
      }
    }

    return {
      url,
      content: mainContent,
      status: 'success'
    }
  } catch (error) {
    return {
      url,
      status: 'error',
      error: error.message
    }
  }
}

// API 路由
fastify.post('/crawl', async (request, reply) => {
  const { urls } = request.body

  if (!Array.isArray(urls) || urls.length === 0) {
    return reply.code(400).send({ error: '請提供有效的 URL 陣列' })
  }

  // 限制並發請求數量為 5
  const limit = pLimit(5)

  // 並發處理所有 URL
  const promises = urls.map(url => limit(() => crawlUrl(url)))
  const results = await Promise.all(promises)

  return { results }
})

// 啟動服務器
const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
