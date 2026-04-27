"""
Food Store MCP Server
Exposes FastAPI endpoints and project tools via MCP protocol
"""
from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI
from mcp.server.fastmcp import FastMCP
from mcp.types import TextContent
from mcp.server import Server
from mcp.server.stdio import stdio_server

# Import the FastAPI app
from app import app as fastapi_app

# Create MCP server
mcp = FastMCP(
    "Food Store",
    dependencies=["fastapi", "sqlmodel", "alembic"],
)


@mcp.tool()
def get_app_health() -> str:
    """Get the FastAPI application health status."""
    return "Food Store API is running"


@mcp.tool()
def list_available_routes() -> str:
    """List all available API routes."""
    routes = []
    for route in fastapi_app.routes:
        if hasattr(route, "path"):
            methods = getattr(route, "methods", {"GET"})
            routes.append(f"{list(methods)[0]} {route.path}")
    return "\n".join(routes)


@mcp.tool()
def get_database_url() -> str:
    """Get the database connection URL (masked)."""
    from core.config import settings
    url = settings.database_url
    # Mask password
    if "@" in url:
        parts = url.split("@")
        user_part = parts[0].split("//")[1] if "//" in parts[0] else parts[0]
        masked = f"postgresql://{user_part.split(':')[0]}:***@"
        if len(parts) > 1:
            masked += parts[1]
        return masked
    return url


@mcp.tool()
async def run_migration() -> str:
    """Run database migrations."""
    import subprocess
    try:
        result = subprocess.run(
            ["alembic", "upgrade", "head"],
            capture_output=True,
            text=True,
            cwd=".",
        )
        return result.stdout if result.returncode == 0 else result.stderr
    except Exception as e:
        return f"Error: {str(e)}"


@mcp.tool()
async def seed_database() -> str:
    """Run database seed data."""
    try:
        # Note: This would need proper async handling
        return "Use: python -m db.seed"
    except Exception as e:
        return f"Error: {str(e)}"


@mcp.resource("app://info")
def get_app_info() -> str:
    """Get Food Store application information."""
    return """
    Food Store - E-Commerce Backend
    ==============================
    Stack: FastAPI + SQLModel + PostgreSQL
    Version: 1.0.0
    """


@mcp.resource("app://schema")
def get_schema() -> str:
    """Get database schema information."""
    from db.models import SQLModel
    
    tables = []
    for table_name, table in SQLModel.metadata.tables.items():
        columns = [col.name for col in table.columns]
        tables.append(f"{table_name}: {', '.join(columns)}")
    return "\n\n".join(tables)


def main():
    """Run the MCP server."""
    mcp.run(transport="stdio")


if __name__ == "__main__":
    main()