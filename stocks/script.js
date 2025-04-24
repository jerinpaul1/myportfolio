const apiKey = 'afb90b6c5aad41e7ab69676870f1b49e';  // Twelve Data API Key
const sentimentApiKey = 'pub_8280275c74a335134cf2d747c21a0cef9923f';  // Sentiment Analysis API Key

const predictionResultElement = document.getElementById('prediction-result');
const sentimentElement = document.getElementById('sentiment-analysis');
const loadingSpinnerElement = document.getElementById('loading-spinner');
const chartContainerElement = document.getElementById('chart-container');
const stockSymbolInput = document.getElementById('stock-symbol');
const submitButton = document.getElementById('submit-symbol');

// Function to fetch real-time stock data
async function fetchStockData(stockSymbol) {
  try {
    const response = await fetch(`https://api.twelvedata.com/time_series?symbol=${stockSymbol}&interval=1h&apikey=${apiKey}`);
    const data = await response.json();

    loadingSpinnerElement.style.display = 'block';  // Show loading spinner

    if (data.status === 'ok' && data.values) {
      const stockData = data.values.slice(0, 50); // Get the latest 50 data points
      const timestamps = stockData.map(item => item.datetime);
      const closePrices = stockData.map(item => parseFloat(item.close));

      // Update the timestamp
      const lastUpdateTime = stockData[0].datetime;
      predictionResultElement.innerHTML = `Last Updated: ${lastUpdateTime}`;

      // Basic prediction logic (can be replaced with ML model)
      const predictedPrice = predictStockPrice(closePrices);
      predictionResultElement.innerHTML += `<br>Predicted Next Price: $${predictedPrice.toFixed(2)}`;

      // Calculate SMA (5-period)
      const sma5 = calculateSMA(closePrices, 5);
      predictionResultElement.innerHTML += `<br>5-Period SMA: $${sma5.toFixed(2)} (Simple Moving Average)`;

      // Calculate EMA (20-period)
      const ema20 = calculateEMA(closePrices, 20);
      predictionResultElement.innerHTML += `<br>20-Period EMA: $${ema20.toFixed(2)} (Exponential Moving Average)`;

      // Calculate RSI (14-day)
      const rsi14 = calculateRSI(closePrices, 14);
      predictionResultElement.innerHTML += `<br>14-Day RSI: ${rsi14.toFixed(2)} (Relative Strength Index)`;

      // Perform sentiment analysis
      await performSentimentAnalysis(stockSymbol);

      // Draw the stock price chart
      drawChart(timestamps, closePrices, sma5, ema20, rsi14);

      loadingSpinnerElement.style.display = 'none'; // Hide loading spinner
    } else {
      predictionResultElement.textContent = 'Failed to fetch stock data.';
      loadingSpinnerElement.style.display = 'none';
    }
  } catch (error) {
    predictionResultElement.textContent = 'Error fetching data.';
    loadingSpinnerElement.style.display = 'none';
    console.error('Error fetching stock data:', error);
  }
}

// Function to predict the stock price (basic example)
function predictStockPrice(prices) {
  const lastPrice = prices[prices.length - 1];
  return lastPrice * (1 + Math.random() * 0.02 - 0.01);  // Random prediction within ±1%
}

// Function to calculate Simple Moving Average (SMA)
function calculateSMA(prices, period) {
  const sum = prices.slice(0, period).reduce((acc, price) => acc + price, 0);
  return sum / period;
}

// Function to calculate Exponential Moving Average (EMA)
function calculateEMA(prices, period) {
  const k = 2 / (period + 1);
  let ema = prices[0]; // Start with the first price
  for (let i = 1; i < prices.length; i++) {
    ema = prices[i] * k + ema * (1 - k);
  }
  return ema;
}

// Function to calculate Relative Strength Index (RSI)
function calculateRSI(prices, period) {
  let gains = 0;
  let losses = 0;

  for (let i = 1; i < period; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) gains += change;
    else losses -= change;
  }

  const avgGain = gains / period;
  const avgLoss = losses / period;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

// Function to draw the stock price chart with indicators
function drawChart(timestamps, closePrices, sma5, ema20, rsi14) {
  new Chart(chartContainerElement, {
    type: 'line',
    data: {
      labels: timestamps,
      datasets: [
        {
          label: 'Stock Price (USD)',
          data: closePrices,
          borderColor: '#00ffcc',
          backgroundColor: 'rgba(0, 255, 204, 0.2)',
          borderWidth: 2,
          fill: true
        },
        {
          label: '5-Period SMA',
          data: Array(closePrices.length).fill(sma5),
          borderColor: '#ffcc00',
          backgroundColor: 'rgba(255, 204, 0, 0.2)',
          borderWidth: 1,
          fill: true
        },
        {
          label: '20-Period EMA',
          data: Array(closePrices.length).fill(ema20),
          borderColor: '#ff6600',
          backgroundColor: 'rgba(255, 102, 0, 0.2)',
          borderWidth: 1,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        x: {
          ticks: {
            maxRotation: 90,
            minRotation: 45
          }
        },
        y: {
          beginAtZero: false
        }
      }
    }
  });

  // Also display the RSI chart (optional)
  // You can add another chart or indicator for RSI below if needed.
}

// Function to perform sentiment analysis
async function performSentimentAnalysis(stockSymbol) {
  try {
    const response = await fetch(`https://api.sentimentanalysis.com/news?symbol=${stockSymbol}&apikey=${sentimentApiKey}`);
    const data = await response.json();

    if (data.status === 'ok') {
      const sentiment = data.sentiment;
      sentimentElement.textContent = `Sentiment Analysis: ${sentiment}`;
    } else {
      sentimentElement.textContent = 'Sentiment analysis failed.';
    }
  } catch (error) {
    sentimentElement.textContent = 'Error performing sentiment analysis.';
    console.error('Error with sentiment analysis:', error);
  }
}

// Event listener for input and button
submitButton.addEventListener('click', function() {
  const stockSymbol = stockSymbolInput.value.toUpperCase();
  if (stockSymbol) {
    fetchStockData(stockSymbol);
  } else {
    alert('Please enter a stock symbol.');
  }
});
