// Using Twelve Data API for real-time stock data
const apiKey = 'afb90b6c5aad41e7ab69676870f1b49e';
const stockSymbol = 'AAPL';  // You can change the symbol to any stock you'd like

// Function to fetch stock data from Twelve Data API
async function fetchStockData() {
  const url = `https://api.twelvedata.com/time_series?symbol=${stockSymbol}&interval=1h&apikey=${apiKey}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.status === 'ok') {
      return data.values;
    } else {
      throw new Error('Failed to fetch stock data');
    }
  } catch (error) {
    console.error('Error fetching stock data:', error);
    document.getElementById('prediction-result').textContent = 'Failed to load stock data.';
    return [];
  }
}

// Machine Learning Model Simulation (Basic Example)
function generatePrediction(stockData) {
  if (stockData.length === 0) {
    return 'Prediction failed due to lack of data.';
  }
  const latestPrice = parseFloat(stockData[0].close);
  const randomFactor = Math.random() * 2 - 1;  // Random factor to simulate variability
  const predictedPrice = latestPrice + randomFactor * latestPrice * 0.05;  // Simulated prediction with +-5% change
  return `Predicted next price: $${predictedPrice.toFixed(2)}`;
}

// Fetch stock data and display prediction
async function displayPrediction() {
  document.getElementById('loading-spinner').style.display = 'block';
  const stockData = await fetchStockData();
  document.getElementById('loading-spinner').style.display = 'none';

  const prediction = generatePrediction(stockData);
  document.getElementById('prediction-result').textContent = prediction;
}

// Chart.js for Technical Analysis (Moving Averages)
function generateChart(stockData) {
  const labels = stockData.map(item => item.datetime);
  const closingPrices = stockData.map(item => parseFloat(item.close));

  const ctx = document.getElementById('chart-container').getContext('2d');
  const chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Stock Price',
        data: closingPrices,
        borderColor: '#00ffcc',
        fill: false,
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true
        }
      },
      scales: {
        x: {
          ticks: {
            autoSkip: true,
            maxTicksLimit: 10
          }
        },
        y: {
          beginAtZero: false
        }
      }
    }
  });
}

// Initialize the page by displaying stock data and predictions
window.onload = async function() {
  await displayPrediction();
  const stockData = await fetchStockData();
  if (stockData.length > 0) {
    generateChart(stockData);
  }
};
