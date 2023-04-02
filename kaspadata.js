const { default: api } = require('axios')

const getKaspaData = async () => {
  try {
    const respKaspaNetwork = await api.get('https://api.kaspa.org/info/network')

    const respKaspaBlockReward = await api.get(
      'https://api.kaspa.org/info/blockreward?stringOnly=false'
    )
    const respKaspaHashrateMax = await api.get(
      'https://api.kaspa.org/info/hashrate/max'
    )
    const respKaspaHalving = await api.get('https://api.kaspa.org/info/halving')

    const respKaspaCoinSupply = await api.get(
      'https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?id=20396',
      {
        headers: {
          'X-CMC_PRO_API_KEY': process.env.X_CMC_PRO_API_KEY,
        },
      }
    )

    return {
      diff: ((respKaspaNetwork.data.difficulty / 1000000000000) * 2).toFixed(3),
      blockCount: respKaspaNetwork.data.blockCount,
      blockreward: respKaspaBlockReward.data.blockreward.toFixed(3),
      maxHashrate: respKaspaHashrateMax.data.hashrate.toFixed(3),
      circulatingSupply:
        respKaspaCoinSupply.data.data['20396'].circulating_supply.toFixed(0),
      maxSupply: respKaspaCoinSupply.data.data['20396'].max_supply,
      nextHalvingDate: respKaspaHalving.data.nextHalvingDate.split(' '),
      nextHalvingAmount: respKaspaHalving.data.nextHalvingAmount.toFixed(3),
    }
  } catch (e) {
    console.log(e)
  }
}

module.exports = getKaspaData
