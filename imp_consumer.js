const dotenv = require('dotenv').config()
const { Telegraf, Markup } = require('telegraf')
const { Configuration, OpenAIApi } = require('openai')
const showStats = require('./db')
const getKaspaData = require('./kaspadata')
const { API } = require('3commas-typescript')

const bot = new Telegraf(process.env.TELEGRAF_TOKEN)
const menu = Markup.keyboard([['Курс', 'Статистика']]).resize(true)
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_TOKEN,
})
const openai = new OpenAIApi(configuration)
const api = new API({
  key: process.env.PUBLIC_KEY,
  secrets: process.env.PRIVATE_KEY,
  timeout: 60000,
  forcedMode: 'real' | 'paper',
  errorHandler: (response, reject) => {
    const { error, error_description } = response
    reject(new Error(error_description ?? error))
  },
})

async function generateText(prompt) {
  try {
    const response = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt,
      max_tokens: 4000,
      n: 1,
      temperature: 0.6,
    })
    return response.data.choices[0].text
  } catch (error) {
    const splitErr = error.response.data.error.message.split(' ')
    const checkMaxLength = new Set(splitErr).has('maximum')
    if (checkMaxLength) {
      return 'Запрос слишком длинный! Допускается максимум 4000 символов!'
    } else {
      return error.response.data.error.message
    }
  }
}

async function getBotStats() {
  const stats = await api.getBotsStats()
  return await stats
}

module.exports = {
  dotenv,
  bot,
  menu,
  generateText,
  showStats,
  getKaspaData,
  getBotStats,
  api,
}
