"""Small local TimesFM inference service used by Orbit."""
from fastapi import FastAPI
from pydantic import BaseModel
import numpy as np
import timesfm

app = FastAPI()
_model = None

def model():
    global _model
    if _model is None:
        _model = timesfm.TimesFM_2p5_200M_torch.from_pretrained("google/timesfm-2.5-200m-pytorch")
        _model.compile(timesfm.ForecastConfig(max_context=2048, max_horizon=1024, normalize_inputs=True, use_continuous_quantile_head=True, force_flip_invariance=True, infer_is_positive=True, fix_quantile_crossing=True))
    return _model

class Request(BaseModel):
    values: list[float]
    horizon: int

@app.post('/forecast')
def forecast(req: Request):
    values = np.asarray(req.values, dtype=np.float32)
    point, quantiles = model().forecast(horizon=req.horizon, inputs=[values])
    return {'engine':'TimesFM 2.5 200M', 'point':point[0].tolist(), 'quantiles':quantiles[0].tolist()}
