# Predix / Orbit Forecast

Free-first quantitative market research dashboard using public market data and optional hosted TimesFM inference.

> Research software only. Forecasts are uncertain and are not financial advice.

## Free-first architecture

```text
Public market sources
  ├─ CoinGecko / Binance / Coinbase / Kraken (crypto)
  ├─ Yahoo Finance / Stooq (stocks, ETFs, indices, FX, commodities)
  └─ FRED (macro series)
          ↓
Frequency validation and normalization
          ↓
OHLCV, returns, volume, volatility and flow features
          ↓
TimesFM via user-provided TSFM.ai key
          ↓
Volatility-aware forecast bands and walk-forward evaluation
          ↓
Interactive candlestick chart and forecast ledger
```

## Current implementation

- Next.js 16.3.5 dashboard
- Mobile-responsive interface
- Session-only TSFM.ai API-key entry
- Real market-data proxy with provider fallback
- Asset/horizon-isolated cache keys
- TimesFM request validation and provider error reporting
- Intraday adapter for public Yahoo chart data where available
- Crypto symbol normalization
- Interactive `lightweight-charts` candlestick/volume chart with pan, wheel zoom, pinch zoom, crosshair and forecast overlay
- Production build script

## Planned quantitative feature layer

The free-first feature engine is designed to add:

### Price and trend

- Log and simple returns
- SMA and EMA
- Momentum and drift
- Breakout and mean-reversion signals
- Drawdown and recovery metrics

### Volatility

- Realized volatility
- EWMA volatility
- ATR
- Parkinson volatility
- Garman-Klass volatility
- Rogers-Satchell volatility
- HAR-RV components
- GARCH-family comparison
- Jump and regime detection

### Volume and market flow

- Relative volume
- Volume z-score
- VWAP
- On-balance volume
- Accumulation/distribution
- Trade count and average trade size
- Bid/ask spread
- Order-book imbalance where public exchange data permits

### Derivatives and Greeks

Only when public options data exists for the asset:

- Implied volatility
- Delta, gamma, theta, vega and rho
- Put/call volume and open-interest ratios
- IV skew and term structure
- Estimated gamma exposure
- Funding, open interest and liquidation features for public crypto derivatives feeds

Unavailable features must be marked unavailable rather than filled with fabricated values.

## Forecast rules

- A 5m/15m forecast requires 5m or finer input data.
- Hourly data must not be relabeled as a 5m forecast.
- A forecast is valid only when returned timestamps and frequency match the requested horizon.
- P10/P50/P90 must come from model quantiles or a documented volatility distribution—not arbitrary fixed percentages.
- If the provider fails, the app must show the last successful data as stale and must not label it live.
- Forecast cache keys include asset, horizon, frequency and model version.

## Baselines and evaluation

Every model-backed forecast should be evaluated against:

- Last-value/random-walk baseline
- Drift baseline
- Moving average/EMA baseline
- EWMA return baseline
- Volatility-adjusted baseline
- Optional GARCH/HAR-RV models

Use rolling-origin, out-of-sample evaluation. Track MAE, RMSE, directional accuracy, interval coverage, calibration, bias, and performance by asset, horizon and volatility regime.

## Development

```bash
npm install
npm run dev
npm run build
```

The application uses `/api/market` for normalized market data and optional TSFM inference. The user API key is sent in memory through the `x-tsfm-api-key` header and is not persisted.

## Data-provider reality

Free public providers may be delayed, rate-limited, incomplete, or unofficial. The dashboard should display source, timestamp, frequency and freshness for every forecast. Professional HFT claims require licensed exchange-grade tick and order-book data and are outside the free-first scope.

## Implementation status (V2)

### Completed foundations

- `src/features.js`: returns, realized/EWMA volatility, VWAP, ATR, volume z-score
- `src/marketSchema.js`: horizon/frequency definitions and validation helpers
- `src/backtest.js`: rolling origins, forecast metrics, interval coverage
- `src/forecastLedger.js`: forecast creation, settlement and summary metrics
- API market-quality response: features, observation counts and freshness metadata
- Asset/horizon-isolated market cache
- TimesFM response validation and provider error propagation
- Lightweight candlestick/volume chart with pan, zoom and crosshair support

### Remaining integration work

- Persist forecast ledger records in a database or durable KV store
- Schedule settlement after each target timestamp
- Connect backtest helpers to the UI
- Add provider WebSocket ingestion and candle aggregation
- Add real options-chain/Greeks adapters where public data exists
- Add volatility and feature panels to the chart
- Verify supported TSFM.ai covariate semantics before using features as model inputs
- Add integration tests for every asset class and horizon

Features shown in the dashboard are currently feature measurements and audit context. They must not be described as TimesFM covariates unless the provider confirms that the selected model consumes them as covariates.

- `src/greeks.js`: validated Black-Scholes European-option Greek calculations for future public options-chain adapters. Greeks are returned as unavailable when required inputs are missing; they are not inferred from spot prices alone.

- `src/forecastFeatures.js`: assembles an auditable forecast feature payload from normalized bars, including realized/EWMA volatility, SMA20, volume z-score, VWAP, ATR, latest return and observation count.

- `src/providerStatus.js`: standardized provider authentication, billing, validation, rate-limit, outage and freshness states for the UI and forecast ledger.

- `src/calibration.js`: walk-forward interval calibration helpers. Calibration must be learned only from completed historical forecasts, never from future outcomes during live inference.

## Context and options foundations

- `src/freeMarketContext.js`: free public Yahoo context adapters for SPY, QQQ, DIA, IWM, GLD, USO, DXY proxy, VIX and Treasury-yield proxy, plus cross-market returns.
- `src/optionsSurface.js`: public Deribit BTC/ETH options-chain adapter and open-interest-weighted IV surface summary. Options features are unavailable for assets/providers without a valid public chain.

These modules are foundations for the next forecast-orchestration step. They do not claim that context or IV is already consumed by TimesFM; that requires provider-supported covariate semantics and out-of-sample validation.
