from app.api.routes_analyze import router as analyze_router
from app.api.routes_data import router as data_router
from app.api.routes_history import router as history_router
from app.api.routes_baseline import router as baseline_router
from app.api.routes_routing import router as routing_router
from app.api.routes_iot import router as iot_router

__all__ = ["analyze_router", "data_router", "history_router", "baseline_router", "routing_router", "iot_router"]

