const stockApiKey = "afb90b6c5aad41e7ab69676870f1b49e";  // Twelve Data API Key
const sentimentApiKey = "pub_8280275c74a335134cf2d747c21a0cef9923f"; // Sentim API Key

document.getElementById("fetchBtn").addEventListener("click", () => {
  const ticker = document.getElementById("ticker").value.toUpperCase();
  if (!ticker) return alert("Please enter a stock symbol.");

  const outputElement = document.getElementById("output");
  const loadingElement = document.getElementById("loading");
  loadingElement.style.display = "block"; // Show loading spinner

  outputElement.innerHTML = `<p>Fetching data for <strong>${ticker}</strong>...</p>`;

  const url = `https://api.twelvedata.com/time_series?symbol=${ticker}&interval=1min&apikey=${stockApiKey}&outputsize=50`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      loadingElement.style.display = "none"; // Hide loading spinner
      if (data.status === "error") {
        outputElement.innerHTML = `<p>Error: ${data.message}</p>`;
        return;
      }

      const closes = data.values.map(v => parseFloat(v.close));
      const labels = data.values.map(v => v.datetime).reverse();

      outputElement.innerHTML = `
        <h3>${ticker}</h3>
        <p><strong>Last Updated:</strong> ${data.values[0].datetime}</p>
        <p><em>Running prediction...</em></p>
      `;

      // Use a promise to ensure the "Running prediction..." message disappears
      predictNextPrice(closes).then(predicted => {
        outputElement.innerHTML = `
          <h3>${ticker}</h3>
          <p><strong>Last Updated:</strong> ${data.values[0].datetime}</p>
          <p><strong>Predicted Next Price:</strong> $${predicted}</p>
        `;

        // Calculate Indicators
        const sma5 = calculateSMA(closes, 5);
        const ema20 = calculateEMA(closes, 20);
        const rsi14 = calculateRSI(closes, 14);

        outputElement.innerHTML += `
          <p><strong>5-period SMA:</strong> ${sma5}</p>
          <p><strong>20-period EMA:</strong> ${ema20}</p>
          <p><strong>14-period RSI:</strong> ${rsi14}</p>
        `;

        // Plot the chart
        drawChart(ticker, labels, closes, predicted, sma5, ema20, rsi14);
      });

      fetchNewsAndSentiment(ticker);
    })
    .catch(err => {
      loadingElement.style.display = "none"; // Hide loading spinner on error
      console.error(err);
      outputElement.innerHTML = `<p>Failed to fetch data.</p>`;
    });
});

// Predict next price (basic average prediction)
function predictNextPrice(closes) {
  return new Promise((resolve) => {
    const last5Prices = closes.slice(-5);
    const predicted = (last5Prices.reduce((a, b) => a + b, 0) / last5Prices.length).toFixed(2);
    resolve(predicted);
  });
}

// Calculate Simple Moving Average (SMA)
function calculateSMA(data, period) {
  const sum = data.slice(-period).reduce((acc, val) => acc + val, 0);
  return (sum / period).toFixed(2);
}

// Calculate Exponential Moving Average (EMA)
function calculateEMA(data, period) {
  let multiplier = 2 / (period + 1);
  let ema = data.slice(0, period).reduce((acc, val) => acc + val, 0) / period;

  for (let i = period; i < data.length; i++) {
    ema = (data[i] - ema) * multiplier + ema;
  }
  return ema.toFixed(2);
}

// Calculate Relative Strength Index (RSI)
function calculateRSI(data, period) {
  let gains = 0, losses = 0;
  
  for (let i = 1; i < period; i++) {
    const diff = data[i] - data[i - 1];
    if (diff > 0) gains += diff;
    else losses -= diff;
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;
  let rs = avgGain / avgLoss;

  return (100 - (100 / (1 + rs))).toFixed(2);
}

// Draw the stock chart using Chart.js
function drawChart(ticker, labels, closes, predicted, sma5, ema20, rsi14) {
  const ctx = document.getElementById('stockChart').getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels.reverse(),
      datasets: [{
        label: `${ticker} Price`,
        data: closes.reverse(),
        borderColor: '#007bff',
        fill: false
      }, {
        label: `Predicted Next Price`,
        data: Array(labels.length).fill(predicted),
        borderColor: '#ff5733',
        borderDash: [5, 5],
        fill: false
      }, {
        label: `5-period SMA`,
        data: Array(labels.length).fill(sma5),
        borderColor: '#28a745',
        borderDash: [5, 5],
        fill: false
      }, {
        label: `20-period EMA`,
        data: Array(labels.length).fill(ema20),
        borderColor: '#ffc107',
        borderDash: [5, 5],
        fill: false
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { 
          beginAtZero: false
        }
      }
    }
  });
}

// Fetch news and sentiment analysis
function fetchNewsAndSentiment(ticker) {
  const url = `https://newsapi.org/v2/everything?q=${ticker}&apiKey=YOUR_NEWS_API_KEY`;
  fetch(url)
    .then(response => response.json())
    .then(data => {
      const headlines = data.articles.map(article => article.title).join(" ");
      analyzeSentiment(headlines);
    })
    .catch(err => console.error("Sentiment analysis failed", err));
}

function analyzeSentiment(text) {
  const url = `https://api.senitmentapi.com/api/v1/sentiment?apiKey=${sentimentApiKey}&text=${text}`;
  fetch(url)
    .then(response => response.json())
    .then(data => {
      const sentiment = data.sentiment;
      console.log("Sentiment: ", sentiment);
      document.getElementById('output').innerHTML += `<p><strong>Sentiment: ${sentiment}</strong></p>`;
    })
    .catch(err => console.error("Sentiment analysis failed", err));
}
