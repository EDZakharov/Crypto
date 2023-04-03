const imports = require('./imp_consumer')
const getKaspaData = require('./kaspadata')

imports.bot.start((ctx) => {
  ctx.reply('Привет, для просмотра доступных команд напиши /help', imports.menu)
  imports.api.subscribeDeal((data) => {
    const parse_data = JSON.parse(data)
    const bot_message = parse_data?.message
    if (bot_message?.type === 'Deal') {
      ctx.reply(
        `\u{1F4B0} BOT: ${bot_message.bot_name}\nID сделки: ${
          bot_message.id
        }\nПара: ${bot_message.pair}\n\u{1F4B2}\u{1F4B2} Профит: ${
          bot_message.usd_final_profit
        } USD\nТекущий статус: ${
          bot_message.localized_status === 'Активна'
            ? '\u{2705} Активна'
            : '\u{274C} Закрыта'
        }\nСоздана: ${bot_message.created_at?.split('T')[0]} // ${
          bot_message.created_at?.split('T')[1].split('.')[0]
        }\nЗакрыта: ${bot_message.closed_at?.split('T')[0]} // ${
          bot_message.closed_at?.split('T')[1].split('.')[0]
        }\nЦена покупки: ${bot_message.bought_average_price.substr(0, 6)} ${
          bot_message.from_currency
        }\nКуплено: ${bot_message.bought_amount} ${
          bot_message.to_currency
        }\nПотрачено: ${bot_message.bought_volume} ${
          bot_message.from_currency
        }\nИСТОРИЯ ОПЕРАЦИЙ:\n ${bot_message.bot_events.map(
          (el) =>
            `\n\n\u{2705} ${el.message} \n\u{231A} Дата: ${
              el.created_at.split('T')[0]
            } // ${el.created_at.split('T')[1].split('.')[0]}`
        )}`,
        menu
      )
    }
  })
})

imports.bot.hears('Статистика', async (ctx) => {
  const statistic = await imports.getBotStats()
  ctx.reply(
    `\n💰💰💰 Профит в USD: \n${
      statistic.profits_in_usd.overall_usd_profit.toFixed(0) <= 0
        ? '\u{274C}'
        : '\u{2705}'
    } За все время -> ${statistic.profits_in_usd.overall_usd_profit.toFixed(
      4
    )} USDT\n${
      statistic.profits_in_usd.today_usd_profit.toFixed(0) <= 0
        ? '\u{274C}'
        : '\u{2705}'
    } За сегодня -> ${statistic.profits_in_usd.today_usd_profit.toFixed(
      4
    )} USDT\n${
      statistic.profits_in_usd.active_deals_usd_profit.toFixed(0) <= 0
        ? '\u{274C}'
        : '\u{2705}'
    } Профит в активных сделках -> ${statistic.profits_in_usd.active_deals_usd_profit.toFixed(
      4
    )} USDT\n✅ Средств в активных сделках -> ${statistic.profits_in_usd.funds_locked_in_active_deals.toFixed(
      4
    )} USDT\n`
  )
})

imports.bot.help((ctx) => {
  ctx.reply(
    `✅ Доступные команды: \n⒈ /start - перезапустить бота.\n⒉ /help- доступные команды.\n⒊ Для просмотра курса kaspa напиши в чат "Курс" или нажми кнопку.\n⒋ В бота встроен chatGPT 3,5 и готов ответить почти на любой твой вопрос.\n⒌ В бота втроен также midjourney для отрисовки картинок.\nДоступные команды midjourney:\n/pr {текст} - писать текст на Русском без скобок.\n/pe {text} - write text in English without brackets. \n 🔥 Результат запроса появится в виде картинки в чате.`
  )
})

imports.bot.hears('Курс', async (ctx) => {
  const botMessage = `${(await imports.showStats()).map((el) => {
    return `\n\n📊 ${el.market}\n⚡ ${el.lastPrice.toFixed(6)} ${el.target}\n${
      el.tradeURL
    }`
  })}`
  ctx.reply('Подгружаю данные...')
  const kaspaData = await getKaspaData()
  ctx.reply('Данные получены')
  setTimeout(() => {
    ctx.reply(
      `💰💰💰 Статистика каспа:\n________________________\nXэшрейт сети: ${kaspaData?.maxHashrate} T\nСложность сети: ${kaspaData?.diff} T\nНаграда за блок: ${kaspaData?.blockreward} KAS\nВысота блоков: ${kaspaData?.blockCount}\nВсего монет: ${kaspaData?.maxSupply}\nЦиркулирует монет: ${kaspaData?.circulatingSupply}\nДата следующего халвинга: ${kaspaData?.nextHalvingDate[0]}\nНаграда за блок после халвинга: ${kaspaData?.nextHalvingAmount} KAS\n________________________\nКурс на биржах: ${botMessage} \n ________________________`
    )
  }, 1000)
})

imports.bot.on('message', async (ctx) => {
  if (ctx.message.text.includes('/pe')) {
    const replText = ctx.message.text.replace('/pe', '')
    imports.getImage(replText).then((res) => ctx.replyWithPhoto(...res))
    return
  }
  if (ctx.message.text.includes('/pr')) {
    const replText = ctx.message.text.replace('/pr', '')
    //two ii bro ^_^
    const translateTXT = await imports.generateText(
      'translate to en' + replText
    )
    imports.getImage(translateTXT).then((res) => ctx.replyWithPhoto(...res))
  } else {
    await imports.generateText(ctx.message.text).then((data) => ctx.reply(data))
  }
})

imports.bot.launch()
