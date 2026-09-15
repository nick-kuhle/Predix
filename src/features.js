// Pure, dependency-free quantitative features for the free-first pipeline.
export const logReturns = values => values.slice(1).map((v,i)=>Math.log(v/values[i]));
export const realizedVolatility = (values, annualization=1) => { const r=logReturns(values); if(!r.length)return null; const m=r.reduce((a,b)=>a+b,0)/r.length; return Math.sqrt(r.reduce((a,b)=>a+(b-m)**2,0)/Math.max(1,r.length-1))*Math.sqrt(annualization); };
export const ewmaVolatility = (values,lambda=.94) => { const r=logReturns(values); if(!r.length)return null; let variance=r[0]**2; for(const x of r.slice(1))variance=lambda*variance+(1-lambda)*x*x; return Math.sqrt(variance); };
export const simpleMovingAverage = (values,window=20) => values.slice(-window).reduce((a,b)=>a+b,0)/Math.min(window,values.length);
export const volumeZScore = (volumes,window=20) => {const x=volumes.slice(-window),m=x.reduce((a,b)=>a+b,0)/x.length,s=Math.sqrt(x.reduce((a,b)=>a+(b-m)**2,0)/Math.max(1,x.length-1));return s?(x.at(-1)-m)/s:0};
export const vwap = (bars,window=20) => {const x=bars.slice(-window);const den=x.reduce((a,b)=>a+(b.volume||0),0);return den?x.reduce((a,b)=>a+((b.high+b.low+b.close)/3)*(b.volume||0),0)/den:null};
export const atr = (bars,window=14) => {const x=bars.slice(-(window+1));const tr=x.slice(1).map((b,i)=>Math.max(b.high-b.low,Math.abs(b.high-x[i].close),Math.abs(b.low-x[i].close)));return tr.length?tr.reduce((a,b)=>a+b,0)/tr.length:null};
