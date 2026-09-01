import time
import logging
from django.db import connection

logger = logging.getLogger('performance')

class QueryTimingMiddleware:
    """
    Middleware that measures total HTTP request duration and database query counts.
    Logs warnings for slow requests (>200ms) or excessive SQL queries (>15 queries).
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start_time = time.time()
        start_queries = len(connection.queries)

        response = self.get_response(request)

        duration = time.time() - start_time
        num_queries = len(connection.queries) - start_queries

        # Attach execution stats to response headers for DevTools inspection
        response['X-Response-Time-Ms'] = f"{duration * 1000:.2f}"
        response['X-DB-Query-Count'] = str(num_queries)

        if duration > 0.200 or num_queries > 15:
            print(f"[PERF WARNING] {request.method} {request.path} took {duration*1000:.1f}ms with {num_queries} SQL queries!")

        return response
