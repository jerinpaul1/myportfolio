// ====== CONFIG KEYS ======
const TWELVE_DATA_KEY = 'afb90b6c5aad41e7ab69676870f1b49e';
const NEWSDATA_KEY    = 'pub_8280275c74a335134cf2d747c21a0cef9923f';

// ====== DOM ELEMENTS ======
const symbolIn   = document.getElementById('stock-symbol');
const btn        = document.getElementById('submit-symbol');
const outPred    = document.getElementById('prediction-result');
const outSent    = document.getElementById('sentiment-analysis');
const spinner    = document.getElementById('loading-spinner');
const priceCtx   = document.getElementById('priceChart').getContext('2d');
const rsiCtx     = document.getElementById('rsiChart').getContext('2d');
let priceChart, rsiChart;

// ====== EVENT ======
btn.addEventListener('click', () => {
  const sym = symbolIn.value.trim().toUpperCase();
  if (!sym) return alert('Please enter a stock symbol.');
  fetchAll(sym);
});

// ====== MAIN FUNCTION ======
async function fetchAll(sym) {
  spinner.style.display = 'block';
  outPred.innerHTML = outSent.innerHTML = '';
  destroyCharts();

  // 1) Fetch stock data
  const res = await fetch(
    `https://api.twelvedata.com/time_series?symbol=${sym}&interval=1h&outputsize=100&apikey=${TWELVE_DATA_KEY}`
  );
  const json = await res.json();
  if (json.status === 'error') {
    spinner.style.display = 'none';
    return outPred.textContent = `Error: ${json.message}`;
  }
  const vals = json.values.reverse(); // oldest → newest

  // 2) Prepare arrays
  const times  = vals.map(v => v.datetime);
  const prices = vals.map(v => +v.close);

  // 3) Display last-updated & prediction
  const lastTime  = times[times.length - 1];
  const lastPrice = prices[prices.length - 1];
  const predicted = predictNext(prices);
  outPred.innerHTML = `
    <p><strong>Last Updated:</strong> ${lastTime}</p>
    <p><strong>Predicted Next Price:</strong> $${predicted.toFixed(2)}</p>
  `;

  // 4) Indicators
  const sma5  = calcSMA(prices, 5);
  const ema20 = calcEMA(prices, 20);
  const rsi14 = calcRSI(prices, 14);
  outPred.innerHTML += `
    <p><strong>5-Period SMA:</strong> $${sma5.toFixed(2)}<br>
      (Simple Moving Average of last 5 closes)</p>
    <p><strong>20-Period EMA:</strong> $${ema20.toFixed(2)}<br>
      (Exponentially-weighted avg; recent closes weigh more)</p>
    <p><strong>14-Day RSI:</strong> ${rsi14.toFixed(2)}<br>
      (Momentum oscillator: >70 overbought; <30 oversold)</p>
  `;

  // 5) Sentiment
  fetchSentiment(sym);

  // 6) Charts
  drawPriceChart(times, prices, sma5, ema20, predicted);
  drawRSIChart(times, rsi14);

  spinner.style.display = 'none';
}

// ====== HELPERS ======
function predictNext(arr) {
  const slice = arr.slice(-5);
  const w = [0.1, 0.15, 0.2, 0.25, 0.3];
  const sw = w.reduce((a, b) => a + b, 0);
  return slice.reduce((s, p, i) => s + p * w[i], 0) / sw;
}
function calcSMA(arr, n) {
  return arr.slice(-n).reduce((a, b) => a + b, 0) / n;
}
function calcEMA(arr, n) {
  const k = 2 / (n + 1);
  let ema = arr[0];
  for (let i = 1; i < arr.length; i++) {
    ema = arr[i] * k + ema * (1 - k);
  }
  return ema;
}
function calcRSI(arr, n) {
  let gains = 0, losses = 0;
  for (let i = 1; i <= n; i++) {
    const d = arr[i] - arr[i - 1];
    if (d > 0) gains += d;
    else losses -= d;
  }
  const avgG = gains / n, avgL = losses / n, rs = avgG / avgL;
  return 100 - (100 / (1 + rs));
}

// ====== CHARTS ======
function destroyCharts() {
  if (priceChart) priceChart.destroy();
  if (rsiChart)   rsiChart.destroy();
}
function drawPriceChart(labels, data, sma, ema, pred) {
  priceChart = new Chart(priceCtx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: 'Price', data, borderColor: '#00ffcc', fill: false, tension: 0.2 },
        { label: 'SMA5',  data: Array(data.length).fill(sma),  borderColor: '#ffcc00', fill: false },
        { label: 'EMA20', data: Array(data.length).fill(ema),  borderColor: '#ff6600', fill: false },
        { label: 'Predicted', data: [ ...Array(data.length-1).fill(null), pred ],
          borderColor: '#dd33aa', borderDash: [5,5], fill: false }
      ]
    }
  });
}
function drawRSIChart(labels, rsiVal) {
  const rsiArr = Array(labels.length).fill(rsiVal);
  rsiChart = new Chart(rsiCtx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: 'RSI14', data: rsiArr, borderColor: '#33aaff', fill: false }
      ]
    },
    options: {
      scales: { y: { min: 0, max: 100 } }
    }
  });
}

// ====== SENTIMENT ======
async function fetchSentiment(sym) {
  try {
    const res = await fetch(
      `https://newsdata.io/api/1/news?apikey=${NEWSDATA_KEY}&q=${sym}&language=en`
    );
    const js = await res.json();
    const titles = js.results?.slice(0,3).map(r => r.title) || [];
    outSent.innerHTML = '<h4>Recent Headlines:</h4><ul>'
      + titles.map(t => `<li>${t}</li>`).join('')
      + '</ul>';
  } catch {
    outSent.textContent = 'Sentiment analysis failed';
  }
}
