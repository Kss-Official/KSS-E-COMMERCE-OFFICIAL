from rest_framework.response import Response
from rest_framework import status

class APIResponse:
    @staticmethod
    def success(data=None, message="Success", status_code=status.HTTP_200_OK, extra=None):
        payload = {
            "status": "success",
            "message": message,
            "data": data if data is not None else {}
        }
        if extra and isinstance(extra, dict):
            payload.update(extra)
        return Response(payload, status=status_code)

    @staticmethod
    def error(message="An error occurred", errors=None, status_code=status.HTTP_400_BAD_REQUEST, data=None):
        payload = {
            "status": "error",
            "message": message,
            "errors": errors if errors is not None else {},
            "data": data if data is not None else {}
        }
        return Response(payload, status=status_code)
