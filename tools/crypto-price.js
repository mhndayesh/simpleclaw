
import axios from 'axios';

const COINGECKO_API = 'https://api.coingecko.com/api/v3';

/**
 * Fetch current price for any cryptocurrency
 * @param {string} coinId - CoinGecko coin ID (e.g., 'bitcoin', 'ethereum')
 * @param {string} currency - Target currency (default: 'usd')
 * @returns {Promise<Object>} Price data
 */
export async function getCryptoPrice(coinId = 'bitcoin', currency = 'usd') {
  try {
    const response = await axios.get(`${COINGECKO_API}/simple/price`, {
      params: {
        ids: coinId,
        vs_currencies: currency,
        include_24hr_change: true,
        include_last_updated_at: true
      },
      timeout: 10000
    });

    const data = response.data[coinId];
    if (!data) {
      throw new Error(`Coin "${coinId}" not found`);
    }

    return {
      coin: coinId,
      currency: currency.toLowerCase(),
      price: data[currency.toLowerCase()],
      change24h: data[`${currency.toLowerCase()}_24h_change`],
      lastUpdated: new Date(data.last_updated_at * 1000).toISOString()
    };
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout - API may be rate limited');
    }
    throw new Error(`Failed to fetch price: ${error.message}`);
  }
}

/**
 * Get Bitcoin price (convenience function)
 * @param {string} currency - Target currency
 */
export function getBitcoinPrice(currency = 'usd') {
  return getCryptoPrice('bitcoin', currency);
}

/**
 * Search for coin IDs by name
 * @param {string} query - Search term
 */
export async function searchCoin(query) {
  try {
    const response = await axios.get(`${COINGECKO_API}/search`, {
      params: { query },
      timeout: 10000
    });
    return response.data.coins.slice(0, 5).map(c => ({
      id: c.id,
      name: c.name,
      symbol: c.symbol
    }));
  } catch (error) {
    throw new Error(`Search failed: ${error.message}`);
  }
}

// CLI usage
if (process.argv[1] === new URL(import.meta.url).pathname) {
  const args = process.argv.slice(2);
  const coin = args[0] || 'bitcoin';
  const currency = args[1] || 'usd';

  console.log(`Fetching ${coin.toUpperCase()} price in ${currency.toUpperCase()}...`);
  
  getCryptoPrice(coin, currency)
    .then(data => {
      console.log('\n💰 Crypto Price Data');
      console.log('====================');
      console.log(`Coin:      ${data.coin}`);
      console.log(`Price:     $${data.price.toLocaleString()}`);
      console.log(`24h Change: ${data.change24h?.toFixed(2) || 'N/A'}%`);
      console.log(`Updated:   ${data.lastUpdated}`);
    })
    .catch(err => {
      console.error('❌ Error:', err.message);
      process.exit(1);
    });
}
