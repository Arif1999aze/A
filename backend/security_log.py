"""
Admin Security Logging System
Tracks all admin panel activities with IP, device info, and actions
"""

from datetime import datetime, timezone
import json
import os
from typing import Optional
import requests

LOG_FILE = "/app/backend/security_access.log"

def get_ip_geolocation(ip_address: str) -> dict:
    """Get geolocation info for IP address"""
    # Skip for internal IPs
    if ip_address.startswith('10.') or ip_address.startswith('192.168.') or ip_address.startswith('172.'):
        return {
            "country": "Internal",
            "country_code": "XX",
            "city": "Private Network",
            "region": "",
            "flag": "🔒"
        }
    
    try:
        # Use ip-api.com (free, no key needed)
        response = requests.get(f"http://ip-api.com/json/{ip_address}?fields=status,country,countryCode,city,regionName", timeout=3)
        if response.status_code == 200:
            data = response.json()
            if data.get('status') == 'success':
                country_code = data.get('countryCode', 'XX')
                # Convert country code to flag emoji
                flag = ''.join(chr(127397 + ord(char)) for char in country_code.upper())
                return {
                    "country": data.get('country', 'Unknown'),
                    "country_code": country_code,
                    "city": data.get('city', 'Unknown'),
                    "region": data.get('regionName', ''),
                    "flag": flag
                }
    except Exception as e:
        print(f"Geolocation error: {e}")
    
    return {
        "country": "Unknown",
        "country_code": "XX",
        "city": "Unknown",
        "region": "",
        "flag": "🌍"
    }

def log_admin_activity(
    ip_address: str,
    action: str,
    user_agent: Optional[str] = None,
    details: Optional[dict] = None
):
    """
    Log admin activity with full details
    
    Args:
        ip_address: Client IP address (real external IP)
        action: Action type (LOGIN, UPDATE_SETTINGS, VIEW_LOGS, etc.)
        user_agent: Browser user agent string (contains device/browser info)
        details: Additional details (what fields changed, etc.)
    """
    # Parse device info from user agent
    device_info = parse_device_info(user_agent) if user_agent else {}
    
    # Get IP geolocation
    geo_info = get_ip_geolocation(ip_address)
    
    log_entry = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "ip_address": ip_address,
        "geo": geo_info,
        "action": action,
        "device": device_info.get("device", "Unknown"),
        "browser": device_info.get("browser", "Unknown"),
        "os": device_info.get("os", "Unknown"),
        "user_agent": user_agent,
        "details": details or {}
    }
    
    try:
        # Create file if not exists
        if not os.path.exists(LOG_FILE):
            with open(LOG_FILE, "w") as f:
                pass
        
        with open(LOG_FILE, "a") as f:
            f.write(json.dumps(log_entry, ensure_ascii=False) + "\n")
    except Exception as e:
        print(f"Security log failed: {e}")

def parse_device_info(user_agent: str) -> dict:
    """Parse user agent to extract device, browser, and OS info"""
    ua = user_agent.lower()
    
    # Detect device
    if "mobile" in ua or "android" in ua or "iphone" in ua:
        if "iphone" in ua:
            device = "iPhone"
        elif "ipad" in ua:
            device = "iPad"
        elif "android" in ua:
            device = "Android"
        else:
            device = "Mobile"
    else:
        device = "Desktop"
    
    # Detect OS
    if "windows" in ua:
        os_name = "Windows"
    elif "mac os" in ua or "macos" in ua:
        os_name = "MacOS"
    elif "linux" in ua:
        os_name = "Linux"
    elif "android" in ua:
        os_name = "Android"
    elif "ios" in ua or "iphone" in ua or "ipad" in ua:
        os_name = "iOS"
    else:
        os_name = "Unknown"
    
    # Detect browser
    if "chrome" in ua and "edg" not in ua:
        browser = "Chrome"
    elif "safari" in ua and "chrome" not in ua:
        browser = "Safari"
    elif "firefox" in ua:
        browser = "Firefox"
    elif "edg" in ua:
        browser = "Edge"
    elif "opera" in ua or "opr" in ua:
        browser = "Opera"
    else:
        browser = "Unknown"
    
    return {
        "device": device,
        "browser": browser,
        "os": os_name
    }

def get_security_logs(limit: int = 100):
    """Get recent security logs"""
    if not os.path.exists(LOG_FILE):
        return []
    
    logs = []
    try:
        with open(LOG_FILE, "r", encoding="utf-8") as f:
            lines = f.readlines()
            for line in lines[-limit:]:
                try:
                    logs.append(json.loads(line.strip()))
                except:
                    continue
    except Exception as e:
        print(f"Failed to read security log: {e}")
    
    # Reverse to show newest first
    return list(reversed(logs))

def get_logs_by_ip(ip_address: str):
    """Get all logs from specific IP"""
    all_logs = get_security_logs(limit=1000)
    return [log for log in all_logs if log.get("ip_address") == ip_address]

def get_unique_ips():
    """Get list of unique IPs that accessed admin"""
    all_logs = get_security_logs(limit=1000)
    ips = set()
    for log in all_logs:
        ips.add(log.get("ip_address", "unknown"))
    return list(ips)
