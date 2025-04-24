// API keys
const TWELVE_DATA_KEY = 'afb90b6c5aad41e7ab69676870f1b49e';
const NEWSDATA_KEY    = 'pub_8280275c74a335134cf2d747c21a0cef9923f';

// DOM refs
const symIn   = document.getElementById('stock-symbol');
const btn     = document.getElementById('submit-symbol');
const outPred = document.getElementById('prediction-result');
const outSent = document.getElementById('sentiment-analysis');
const spin    = document.getElementById('loading-spinner');
const priceCtx= document.getElementById('priceChart').getContext('2d');
const rsiCtx  = document.getElementById('rsiChart').getContext('2d');
let priceChart, rsiChart;

// Event
btn.addEventListener('click', () => {
  const sym = symIn.value.trim().toUpperCase();
  if (!sym) return alert('Please enter a symbol.');
  fetchAll(sym);
});

// Main
async function fetchAll(sym) {
  spin.style.display = 'block';
  outPred.innerHTML = outSent.innerHTML = '';
  destroyCharts();

  // Fetch
  const res = await fetch(
    `https://api.twelvedata.com/time_series?symbol=${sym}&interval=1h&outputsize=100&apikey=${TWELVE_DATA_KEY}`
  );
  const js  = await res.json();
  if (js.status === 'error') {
    spin.style.display='none';
    return outPred.textContent = `Error: ${js.message}`;
  }
  const vals = js.values.reverse();
  const times= vals.map(v=>v.datetime);
  const prices=vals.map(v=>+v.close);

  // Last update & prediction
  const lastTime = times.pop(), lastP=prices.pop();
  const pred = predict(prices);
  outPred.innerHTML = `
    <p><strong>Last Updated:</strong> ${lastTime}</p>
    <p><strong>Predicted Next Price:</strong> $${pred.toFixed(2)}</p>
  `;

  // Indicators
  const sma5 = calcSMA(prices,5),
        ema20= calcEMA(prices,20),
        rsi14= calcRSI(prices,14);
  outPred.innerHTML += `
    <p><strong>5-Period SMA:</strong> $${sma5.toFixed(2)}<br>(Simple Moving Average of last 5 closes)</p>
    <p><strong>20-Period EMA:</strong> $${ema20.toFixed(2)}<br>(Exp. Moving Average; recent closes weigh more)</p>
    <p><strong>14-Day RSI:</strong> ${rsi14.toFixed(2)}<br>(>70 overbought; <30 oversold)</p>
  `;

  // Sentiment
  fetchSentiment(sym);

  // Charts
  drawPriceChart(times,prices,sma5,ema20,pred);
  drawRSIChart(times,rsi14);

  spin.style.display='none';
}

// Helpers
function predict(arr) {
  const slice=arr.slice(-5), w=[.1,.15,.2,.25,.3];
  const sw=w.reduce((a,b)=>a+b,0);
  return slice.reduce((s,p,i)=>s+p*w[i],0)/sw;
}
function calcSMA(a,n){ return a.slice(-n).reduce((s,v)=>s+v,0)/n; }
function calcEMA(a,n){
  const k=2/(n+1); let e=a[0];
  for(let i=1;i<a.length;i++) e = a[i]*k + e*(1-k);
  return e;
}
function calcRSI(a,n){
  let g=0,l=0;
  for(let i=1;i<=n;i++){
    const d=a[i]-a[i-1];
    d>0?g+=d:l-=d;
  }
  const ag=g/n, al=l/n, rs=ag/al;
  return 100-(100/(1+rs));
}

// Charts
function destroyCharts(){
  priceChart&&priceChart.destroy();
  rsiChart&&rsiChart.destroy();
}
function drawPriceChart(lbl,dt,sma,ema,p){
  priceChart=new Chart(priceCtx,{ type:'line', data:{
    labels:lbl, datasets:[
      {label:'Price', data:dt, borderColor:'#00ffcc', fill:false},
      {label:'SMA5', data:Array(dt.length).fill(sma), borderColor:'#ffcc00', fill:false},
      {label:'EMA20', data:Array(dt.length).fill(ema), borderColor:'#ff6600', fill:false},
      {label:'Predicted', data:[...Array(dt.length-1).fill(null),p],
       borderColor:'#dd33aa', borderDash:[5,5], fill:false}
    ]
  }, options:{
    responsive:true, maintainAspectRatio:false
  }});
}
function drawRSIChart(lbl,v){
  rsiChart=new Chart(rsiCtx,{ type:'line', data:{
    labels:lbl, datasets:[
      {label:'RSI14', data:Array(lbl.length).fill(v), borderColor:'#33aaff', fill:false}
    ]
  }, options:{
    responsive:true, maintainAspectRatio:false,
    scales:{ y:{ min:0, max:100 } }
  }});
}

// Sentiment
async function fetchSentiment(sym){
  try{
    const r=await fetch(`https://newsdata.io/api/1/news?apikey=${NEWSDATA_KEY}&q=${sym}&language=en`);
    const j=await r.json();
    const titles=j.results?.slice(0,3).map(x=>x.title)||[];
    outSent.innerHTML='<h4>Recent Headlines:</h4><ul>'
      +titles.map(t=>`<li>${t}</li>`).join('')
      +'</ul>';
  } catch{
    outSent.textContent='Sentiment analysis failed';
  }
}
// Theme toggle + logo swap
const themeToggleBtn = document.getElementById('theme-toggle');
const logoImg        = document.getElementById('logo-img');
const bodyEl         = document.body;

// On load, apply saved theme and set logo
if (localStorage.getItem('theme') === 'light') {
  bodyEl.classList.add('light');
  logoImg.src = '../assets/images/logo-light.png';
}

// On click, toggle theme class AND swap logo src
themeToggleBtn.addEventListener('click', () => {
  const isLight = bodyEl.classList.toggle('light');

  if (isLight) {
    localStorage.setItem('theme', 'light');
    logoImg.src = '../assets/images/logo-light.png';
  } else {
    localStorage.removeItem('theme');
    logoImg.src = '../assets/images/logo-dark.png';
  }
});
