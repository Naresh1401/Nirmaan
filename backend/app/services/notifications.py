"""Notification service for order updates, delivery tracking, etc."""

from enum import Enum
from dataclasses import dataclass


class NotificationType(str, Enum):
    ORDER_PLACED = "order_placed"
    ORDER_CONFIRMED = "order_confirmed"
    ORDER_SHIPPED = "order_shipped"
    ORDER_DELIVERED = "order_delivered"
    ORDER_CANCELLED = "order_cancelled"
    DELIVERY_ASSIGNED = "delivery_assigned"
    DELIVERY_PICKUP = "delivery_pickup"
    DELIVERY_COMPLETED = "delivery_completed"
    SUPPLIER_NEW_ORDER = "supplier_new_order"
    PAYMENT_RECEIVED = "payment_received"
    PAYMENT_SETTLED = "payment_settled"


@dataclass
class Notification:
    user_id: str
    type: NotificationType
    title: str
    message: str
    data: dict


# Notification templates
TEMPLATES = {
    NotificationType.ORDER_PLACED: {
        "title": "Order Placed Successfully!",
        "message": "Your order {order_number} has been placed. Total: ₹{total_amount}",
    },
    NotificationType.ORDER_CONFIRMED: {
        "title": "Order Confirmed",
        "message": "Your order {order_number} has been confirmed by the supplier.",
    },
    NotificationType.ORDER_SHIPPED: {
        "title": "Order Shipped",
        "message": "Your order {order_number} is on the way! Track it live.",
    },
    NotificationType.ORDER_DELIVERED: {
        "title": "Order Delivered",
        "message": "Your order {order_number} has been delivered. Rate your experience!",
    },
    NotificationType.SUPPLIER_NEW_ORDER: {
        "title": "New Order Received!",
        "message": "New order {order_number} worth ₹{total_amount}. Accept within 15 minutes.",
    },
    NotificationType.DELIVERY_ASSIGNED: {
        "title": "New Delivery Assignment",
        "message": "Pickup from {supplier_name}. Deliver to {delivery_address}.",
    },
    NotificationType.PAYMENT_SETTLED: {
        "title": "Payment Settled",
        "message": "₹{amount} has been credited to your account for order {order_number}.",
    },
}


async def send_notification(notification: Notification) -> bool:
    """
    Send a notification through available channels.

    Currently logs in-app. In production, extend with:
    - Push notifications (Firebase Cloud Messaging)
    - SMS (Twilio)
    - WebSocket events for real-time updates
    """
    import logging

    logger = logging.getLogger(__name__)
    logger.info(
        "Notification [%s] → user %s: %s",
        notification.type.value,
        notification.user_id,
        notification.title,
    )
    return True


def build_notification(
    user_id: str,
    notification_type: NotificationType,
    **kwargs,
) -> Notification:
    """Build a notification from a template."""
    template = TEMPLATES.get(notification_type, {})
    title = template.get("title", "Nirmaan Update")
    message = template.get("message", "").format(**kwargs)

    return Notification(
        user_id=user_id,
        type=notification_type,
        title=title,
        message=message,
        data=kwargs,
    )
