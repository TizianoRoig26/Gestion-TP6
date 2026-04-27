"""
Core Exceptions Module
"""
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import ValidationError


class FoodStoreException(Exception):
    """Base exception for Food Store."""
    def __init__(self, message: str = "An error occurred", status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class NotFoundException(FoodStoreException):
    """Resource not found."""
    def __init__(self, message: str = "Resource not found"):
        super().__init__(message, 404)


class UnauthorizedException(FoodStoreException):
    """Unauthorized access."""
    def __init__(self, message: str = "Not authenticated"):
        super().__init__(message, 401)


class ForbiddenException(FoodStoreException):
    """Forbidden access."""
    def __init__(self, message: str = "Not authorized"):
        super().__init__(message, 403)


class ConflictException(FoodStoreException):
    """Resource conflict."""
    def __init__(self, message: str = "Resource already exists"):
        super().__init__(message, 409)


class ValidationException(FoodStoreException):
    """Validation error."""
    def __init__(self, message: str = "Validation error"):
        super().__init__(message, 422)


def register_exception_handlers(app: FastAPI):
    """Register exception handlers."""

    @app.exception_handler(FoodStoreException)
    async def food_store_exception_handler(request: Request, exc: FoodStoreException):
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "detail": exc.message,
                "type": "about:blank",
                "title": exc.__class__.__name__,
            },
        )

    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "detail": exc.detail,
                "type": "about:blank",
                "title": exc.__class__.__name__,
            },
        )

    @app.exception_handler(ValidationError)
    async def pydantic_validation_exception_handler(request: Request, exc: ValidationError):
        return JSONResponse(
            status_code=422,
            content={
                "detail": exc.errors(),
                "type": "about:blank",
                "title": "Validation Error",
            },
        )

    @app.exception_handler(Exception)
    async def general_exception_handler(request: Request, exc: Exception):
        # In production, log the error instead of exposing details
        return JSONResponse(
            status_code=500,
            content={
                "detail": "Internal server error",
                "type": "about:blank",
                "title": "Internal Server Error",
            },
        )