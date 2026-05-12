"""
Pagos Repository - Data access layer for payments
"""
from typing import Optional
from sqlmodel import Session, select
from db.models import Pago, Pedido
from core.database import BaseRepository


class PagoRepository(BaseRepository[Pago]):
    """Repository for Pago operations."""

    def __init__(self, session: Session):
        super().__init__(Pago, session)

    def get_by_pedido_id(self, pedido_id: int) -> Optional[Pago]:
        """Get payment by pedido_id."""
        statement = select(Pago).where(Pago.pedido_id == pedido_id).order_by(Pago.creado_en.desc())
        return self.session.exec(statement).first()

    def get_by_mp_payment_id(self, mp_payment_id: int) -> Optional[Pago]:
        """Get payment by MercadoPago payment ID."""
        statement = select(Pago).where(Pago.mp_payment_id == mp_payment_id)
        return self.session.exec(statement).first()

    def get_by_idempotency_key(self, idempotency_key: str) -> Optional[Pago]:
        """Get payment by idempotency key."""
        statement = select(Pago).where(Pago.idempotency_key == idempotency_key)
        return self.session.exec(statement).first()

    def create_pago(self, pago: Pago) -> Pago:
        """Create a new payment record."""
        return self.create(pago)
