// Replace with your actual API keys
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

    // Show the loading spinner
    loadingSpinnerElement.style.display = 'block';
    
    if (data.status === 'ok') {
      const stockData = data.values.slice(0, 50); // Get the latest 50 data points

      // Extract timestamps and closing prices
      const timestamps = stockData.map(item => item.datetime);
      const closePrices = stockData.map(item => parseFloat(item.close));

      // Get predictions from a simple model (here you can improve with machine learning)
      const predictedPrice = predictStockPrice(closePrices);
      predictionResultElement.textContent = `Predicted Price: $${predictedPrice.toFixed(2)}`;

      // Perform sentiment analysis on news or social media
      await performSentimentAnalysis(stockSymbol);

      // Hide the loading spinner
      loadingSpinnerElement.style.display = 'none';

      // Draw the stock price chart
      drawChart(timestamps, closePrices);
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
  return lastPrice * (1 + Math.random() * 0.02 - 0.01); // Random prediction within ±1%
}

// Function to draw the stock price chart
function drawChart(timestamps, closePrices) {
  new Chart(chartContainerElement, {
    type: 'line',
    data: {
      labels: timestamps,
      datasets: [{
        label: 'Stock Price (USD)',
        data: closePrices,
        borderColor: '#00ffcc',
        backgroundColor: 'rgba(0, 255, 204, 0.2)',
        borderWidth: 2,
        fill: true
      }]
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
}

// Function to perform sentiment analysis (basic example)
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

// Initialize with a default stock symbol (optional)
fetchStockData('AAPL');
