"""
Admin Access Logging System
Logs all admin panel access attempts with IP, timestamp, and action
"""

from datetime import datetime, timezone
from typing import Optional
import json
import os

LOG_FILE = "/app/backend/admin_access.log"

def log_admin_access(
    ip_address: str,
    action: str,
    success: bool,
    user_agent: Optional[str] = None,
    details: Optional[dict] = None
):
    """
    Log admin access attempt
    
    Args:
        ip_address: Client IP address
        action: Action performed (LOGIN, UPDATE_SETTINGS, etc.)
        success: Whether action was successful
        user_agent: Browser user agent
        details: Additional details about the action
    """
    log_entry = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "ip_address": ip_address,
        "action": action,
        "success": success,
        "user_agent": user_agent,
        "details": details or {}
    }
    
    try:
        with open(LOG_FILE, "a") as f:
            f.write(json.dumps(log_entry) + "\n")
    except Exception as e:
        print(f"Failed to write admin log: {e}")

def get_recent_access_logs(limit: int = 100):
    """Get recent admin access logs"""
    if not os.path.exists(LOG_FILE):
        return []
    
    logs = []
    try:
        with open(LOG_FILE, "r") as f:
            lines = f.readlines()
            for line in lines[-limit:]:
                try:
                    logs.append(json.loads(line.strip()))
                except:
                    continue
    except Exception as e:
        print(f"Failed to read admin log: {e}")
    
    return logs

def get_access_by_ip(ip_address: str):
    """Get all access attempts from specific IP"""
    all_logs = get_recent_access_logs(limit=1000)
    return [log for log in all_logs if log.get("ip_address") == ip_address]
