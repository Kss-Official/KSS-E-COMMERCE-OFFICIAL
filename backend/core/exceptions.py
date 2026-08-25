from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

def custom_exception_handler(exc, context):
    # Call REST framework's default exception handler first to get the standard error response.
    response = exception_handler(exc, context)

    if response is not None:
        message = "Validation or request error"
        errors = response.data

        if isinstance(response.data, dict):
            if "detail" in response.data:
                message = str(response.data["detail"])
                errors = {"detail": message}
            else:
                first_key = next(iter(response.data))
                first_val = response.data[first_key]
                if isinstance(first_val, list) and len(first_val) > 0:
                    message = f"{first_key}: {first_val[0]}"
                elif isinstance(first_val, str):
                    message = f"{first_key}: {first_val}"
        elif isinstance(response.data, list) and len(response.data) > 0:
            message = str(response.data[0])

        response.data = {
            "status": "error",
            "message": message,
            "errors": errors,
            "data": {}
        }
    else:
        # Unhandled server exceptions
        response = Response(
            {
                "status": "error",
                "message": str(exc) or "Internal Server Error",
                "errors": {"server_error": str(exc)},
                "data": {}
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    return response
