const { default: api } = require('axios')

let db = []
const updateDbData = async () => {
  try {
    const respCoinGecko = await api.get(
      'https://api.coingecko.com/api/v3/coins/kaspa'
    )

    respCoinGecko.data.tickers.map((ticker) => {
      const index = db.findIndex((el) => el.market == ticker.market.name)

      if (index === -1) {
        db.push({
          base: ticker.base,
          target: ticker.target,
          market: ticker.market.name,
          volume: ticker.volume,
          lastPrice: ticker.last,
          tradeURL: ticker.trade_url,
        })
      } else {
        db[index] = {
          base: ticker.base,
          target: ticker.target,
          market: ticker.market.name,
          volume: ticker.volume,
          lastPrice: ticker.last,
          tradeURL: ticker.trade_url,
        }
      }
    })
  } catch (e) {
    console.log(e.response ? e.response.statusText : e)
  }
}

const showStats = async () => {
  await updateDbData()
  return db
}

module.exports = showStats
