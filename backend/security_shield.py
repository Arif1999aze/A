"""
🛡️ AzPay Təhlükəsizlik Qalxanı (Security Shield)
═══════════════════════════════════════════════════════════════

Bu modul saytı aşağıdakı təhlükələrdən qoruyur:
- Brute Force hücumları (çoxlu giriş cəhdləri)
- DDoS hücumları (çoxlu sorğular)
- SQL Injection cəhdləri
- XSS (Cross-Site Scripting) cəhdləri
- Şübhəli IP-lərdən girişlər
- Məxfi məlumatların sızması

Bütün təhlükəsizlik hadisələri ətraflı loqlanır.
"""

import hashlib
import json
import os
import re
from datetime import datetime, timezone, timedelta
from typing import Dict, Optional, List
from collections import defaultdict
import secrets

# ═══════════════════════════════════════════════════════════════
# KONFİQURASİYA
# ═══════════════════════════════════════════════════════════════

# Türkiyə timezone (UTC+3)
TURKEY_TZ = timezone(timedelta(hours=3))

# Rate limiting konfiqurasiyası
MAX_LOGIN_ATTEMPTS = 5  # Maksimum giriş cəhdi
LOGIN_BLOCK_DURATION = 30 * 60  # 30 dəqiqə blok (saniyə)
MAX_REQUESTS_PER_MINUTE = 60  # Dəqiqədə maksimum sorğu
SUSPICIOUS_PATTERNS_THRESHOLD = 3  # Şübhəli pattern sayı

# Təhlükəsizlik log faylı
SECURITY_SHIELD_LOG = "/app/backend/security_shield.log"
BLOCKED_IPS_FILE = "/app/backend/blocked_ips.json"

# Şübhəli patternlər (SQL Injection, XSS və s.)
SUSPICIOUS_PATTERNS = [
    r"(\%27)|(\')|(\-\-)|(\%23)|(#)",  # SQL Injection
    r"((\%3C)|<)((\%2F)|\/)*[a-z0-9\%]+((\%3E)|>)",  # XSS
    r"((\%3C)|<)((\%69)|i|(\%49))((\%6D)|m|(\%4D))((\%67)|g|(\%47))",  # IMG XSS
    r"((\%3C)|<)[^\n]+((\%3E)|>)",  # HTML Injection
    r"(\%00)",  # Null byte injection
    r"(\.\.\/)",  # Path traversal
    r"(union|select|insert|update|delete|drop|truncate|exec)",  # SQL keywords
    r"(<script|javascript:|onerror|onload)",  # JavaScript injection
    r"(cmd=|exec=|system\(|eval\()",  # Command injection
]

# ═══════════════════════════════════════════════════════════════
# YADDAŞDA SAXLANAN TƏHLÜKƏSİZLİK VERİLƏRİ
# ═══════════════════════════════════════════════════════════════

# IP-lərə görə giriş cəhdləri
login_attempts: Dict[str, List[datetime]] = defaultdict(list)

# IP-lərə görə sorğu sayı
request_counts: Dict[str, List[datetime]] = defaultdict(list)

# Blok edilmiş IP-lər
blocked_ips: Dict[str, datetime] = {}

# Şübhəli fəaliyyətlər
suspicious_activities: Dict[str, int] = defaultdict(int)

# ═══════════════════════════════════════════════════════════════
# YARDIMÇI FUNKSİYALAR
# ═══════════════════════════════════════════════════════════════

def get_turkey_time() -> datetime:
    """Türkiyə vaxtını qaytarır"""
    return datetime.now(TURKEY_TZ)

def format_turkey_time(dt: datetime = None) -> str:
    """Tarixi Türkiyə formatında qaytarır"""
    if dt is None:
        dt = get_turkey_time()
    return dt.strftime("%d.%m.%Y %H:%M:%S")

def hash_sensitive_data(data: str) -> str:
    """Həssas məlumatları hash-ləyir (gizlədir)"""
    return hashlib.sha256(data.encode()).hexdigest()[:16] + "***"

def mask_ip(ip: str) -> str:
    """IP ünvanını qismən gizlədir"""
    parts = ip.split('.')
    if len(parts) == 4:
        return f"{parts[0]}.{parts[1]}.***.***"
    return ip[:8] + "***"

def generate_security_token() -> str:
    """Təsadüfi təhlükəsizlik tokeni yaradır"""
    return secrets.token_hex(32)

# ═══════════════════════════════════════════════════════════════
# TƏHLÜKƏSİZLİK LOQLANMASİ
# ═══════════════════════════════════════════════════════════════

def log_security_event(
    event_type: str,
    ip_address: str,
    severity: str,  # LOW, MEDIUM, HIGH, CRITICAL
    description: str,
    details: dict = None,
    user_agent: str = None
):
    """
    Təhlükəsizlik hadisəsini ətraflı loqlayır
    
    Severity (Təhlükə Səviyyəsi):
    - LOW: Adi məlumat (giriş cəhdi və s.)
    - MEDIUM: Diqqət tələb edən (çoxlu giriş cəhdi)
    - HIGH: Təhlükəli (brute force, şübhəli pattern)
    - CRITICAL: Kritik (hücum aşkarlandı, blok edildi)
    """
    
    event = {
        "timestamp": format_turkey_time(),
        "event_type": event_type,
        "severity": severity,
        "ip_address": ip_address,
        "ip_masked": mask_ip(ip_address),
        "description": description,
        "details": details or {},
        "user_agent": user_agent,
        "threat_analysis": analyze_threat(event_type, ip_address, details)
    }
    
    # Severity rəngləri
    severity_emoji = {
        "LOW": "🟢",
        "MEDIUM": "🟡", 
        "HIGH": "🟠",
        "CRITICAL": "🔴"
    }
    
    event["severity_icon"] = severity_emoji.get(severity, "⚪")
    
    try:
        with open(SECURITY_SHIELD_LOG, "a", encoding="utf-8") as f:
            f.write(json.dumps(event, ensure_ascii=False) + "\n")
    except Exception as e:
        print(f"Security log error: {e}")

def analyze_threat(event_type: str, ip: str, details: dict = None) -> dict:
    """Təhlükənin ətraflı analizini aparır"""
    
    analysis = {
        "threat_level": "UNKNOWN",
        "recommendation": "",
        "explanation_az": "",
        "explanation_en": ""
    }
    
    if event_type == "BRUTE_FORCE_DETECTED":
        analysis["threat_level"] = "HIGH"
        analysis["recommendation"] = "IP blok edildi"
        analysis["explanation_az"] = "Bu IP ünvanından çoxlu uğursuz giriş cəhdi aşkarlandı. Bu, brute force hücumu ola bilər - haker şifrəni tapmaq üçün müxtəlif kombinasiyaları sınayır."
        analysis["explanation_en"] = "Multiple failed login attempts detected from this IP. This could be a brute force attack - attacker trying different password combinations."
        
    elif event_type == "SUSPICIOUS_PATTERN_DETECTED":
        analysis["threat_level"] = "HIGH"
        analysis["recommendation"] = "Sorğu blok edildi"
        analysis["explanation_az"] = "Sorğuda şübhəli kod pattern-i aşkarlandı. Bu, SQL Injection və ya XSS hücumu cəhdi ola bilər - haker sistemə zərərli kod yerləşdirməyə çalışır."
        analysis["explanation_en"] = "Suspicious code pattern detected in request. This could be SQL Injection or XSS attack attempt."
        
    elif event_type == "RATE_LIMIT_EXCEEDED":
        analysis["threat_level"] = "MEDIUM"
        analysis["recommendation"] = "Sorğular məhdudlaşdırıldı"
        analysis["explanation_az"] = "Bu IP-dən çox sayda sorğu göndərilir. Bu, DDoS hücumu və ya bot fəaliyyəti ola bilər."
        analysis["explanation_en"] = "Too many requests from this IP. Could be DDoS attack or bot activity."
        
    elif event_type == "BLOCKED_IP_ACCESS":
        analysis["threat_level"] = "CRITICAL"
        analysis["recommendation"] = "Giriş rədd edildi"
        analysis["explanation_az"] = "Əvvəlcədən blok edilmiş IP ünvanından giriş cəhdi. Bu IP təhlükəli hesab olunur."
        analysis["explanation_en"] = "Access attempt from previously blocked IP address."
        
    elif event_type == "LOGIN_FAILED":
        attempts = len(login_attempts.get(ip, []))
        analysis["threat_level"] = "LOW" if attempts < 3 else "MEDIUM"
        analysis["recommendation"] = f"Cəhd #{attempts}"
        analysis["explanation_az"] = f"Yanlış şifrə ilə giriş cəhdi. {MAX_LOGIN_ATTEMPTS - attempts} cəhd qaldı."
        analysis["explanation_en"] = f"Failed login attempt. {MAX_LOGIN_ATTEMPTS - attempts} attempts remaining."
        
    return analysis

# ═══════════════════════════════════════════════════════════════
# TƏHLÜKƏSİZLİK YOXLAMALARI
# ═══════════════════════════════════════════════════════════════

def is_ip_blocked(ip: str) -> tuple:
    """IP-nin blok edilib-edilmədiyini yoxlayır"""
    
    # Blok edilmiş IP-ləri yüklə
    load_blocked_ips()
    
    if ip in blocked_ips:
        block_time = blocked_ips[ip]
        if isinstance(block_time, str):
            block_time = datetime.fromisoformat(block_time)
        
        # Blok müddəti bitibmi?
        if get_turkey_time() < block_time + timedelta(seconds=LOGIN_BLOCK_DURATION):
            remaining = (block_time + timedelta(seconds=LOGIN_BLOCK_DURATION) - get_turkey_time()).seconds // 60
            return True, f"IP blok edilib. {remaining} dəqiqə qaldı."
        else:
            # Blok müddəti bitdi
            del blocked_ips[ip]
            save_blocked_ips()
    
    return False, ""

def check_login_attempt(ip: str, success: bool, user_agent: str = None) -> tuple:
    """
    Giriş cəhdini yoxlayır və brute force-u aşkarlayır
    
    Returns:
        (allowed: bool, message: str)
    """
    
    # Əvvəlcə IP blok edilib-edilmədiyini yoxla
    is_blocked, block_msg = is_ip_blocked(ip)
    if is_blocked:
        log_security_event(
            "BLOCKED_IP_ACCESS",
            ip,
            "CRITICAL",
            "Blok edilmiş IP-dən giriş cəhdi",
            {"reason": "IP previously blocked"},
            user_agent
        )
        return False, block_msg
    
    now = get_turkey_time()
    
    # Köhnə cəhdləri təmizlə (1 saat əvvəlkiləri)
    login_attempts[ip] = [
        t for t in login_attempts[ip] 
        if now - t < timedelta(hours=1)
    ]
    
    if success:
        # Uğurlu giriş - cəhdləri sıfırla
        login_attempts[ip] = []
        log_security_event(
            "LOGIN_SUCCESS",
            ip,
            "LOW",
            "Uğurlu giriş",
            {"message": "Admin panelə uğurlu giriş"},
            user_agent
        )
        return True, "OK"
    
    # Uğursuz giriş
    login_attempts[ip].append(now)
    attempt_count = len(login_attempts[ip])
    
    log_security_event(
        "LOGIN_FAILED",
        ip,
        "MEDIUM" if attempt_count >= 3 else "LOW",
        f"Uğursuz giriş cəhdi #{attempt_count}",
        {
            "attempt_number": attempt_count,
            "max_attempts": MAX_LOGIN_ATTEMPTS,
            "remaining": MAX_LOGIN_ATTEMPTS - attempt_count
        },
        user_agent
    )
    
    # Brute force aşkarla
    if attempt_count >= MAX_LOGIN_ATTEMPTS:
        block_ip(ip, "Brute force - çoxlu uğursuz giriş cəhdi", user_agent)
        return False, f"⚠️ Təhlükəsizlik: Çoxlu uğursuz cəhd. IP {LOGIN_BLOCK_DURATION // 60} dəqiqə blok edildi."
    
    return True, f"Yanlış şifrə. {MAX_LOGIN_ATTEMPTS - attempt_count} cəhd qaldı."

def check_rate_limit(ip: str, user_agent: str = None) -> tuple:
    """Sorğu sayı limitini yoxlayır (DDoS qoruması)"""
    
    now = get_turkey_time()
    
    # Son 1 dəqiqədəki sorğuları saxla
    request_counts[ip] = [
        t for t in request_counts[ip]
        if now - t < timedelta(minutes=1)
    ]
    
    request_counts[ip].append(now)
    count = len(request_counts[ip])
    
    if count > MAX_REQUESTS_PER_MINUTE:
        log_security_event(
            "RATE_LIMIT_EXCEEDED",
            ip,
            "HIGH",
            f"Sorğu limiti aşıldı: {count}/{MAX_REQUESTS_PER_MINUTE}",
            {"request_count": count, "limit": MAX_REQUESTS_PER_MINUTE},
            user_agent
        )
        
        suspicious_activities[ip] += 1
        if suspicious_activities[ip] >= SUSPICIOUS_PATTERNS_THRESHOLD:
            block_ip(ip, "DDoS şübhəsi - həddindən artıq sorğu", user_agent)
        
        return False, "Həddindən artıq sorğu. Bir az gözləyin."
    
    return True, "OK"

def check_suspicious_patterns(data: str, ip: str, user_agent: str = None) -> tuple:
    """
    Şübhəli pattern-ləri yoxlayır (SQL Injection, XSS və s.)
    """
    
    if not data:
        return True, "OK"
    
    data_lower = data.lower()
    
    for pattern in SUSPICIOUS_PATTERNS:
        if re.search(pattern, data_lower, re.IGNORECASE):
            log_security_event(
                "SUSPICIOUS_PATTERN_DETECTED",
                ip,
                "HIGH",
                "Şübhəli kod pattern-i aşkarlandı",
                {
                    "pattern_type": "SQL/XSS Injection attempt",
                    "blocked_data": hash_sensitive_data(data[:100])
                },
                user_agent
            )
            
            suspicious_activities[ip] += 2
            if suspicious_activities[ip] >= SUSPICIOUS_PATTERNS_THRESHOLD:
                block_ip(ip, "Hücum cəhdi - şübhəli kod pattern-i", user_agent)
            
            return False, "Şübhəli sorğu blok edildi."
    
    return True, "OK"

def block_ip(ip: str, reason: str, user_agent: str = None):
    """IP ünvanını blok edir"""
    
    blocked_ips[ip] = get_turkey_time().isoformat()
    save_blocked_ips()
    
    log_security_event(
        "IP_BLOCKED",
        ip,
        "CRITICAL",
        f"IP blok edildi: {reason}",
        {
            "reason": reason,
            "block_duration_minutes": LOGIN_BLOCK_DURATION // 60,
            "unblock_time": format_turkey_time(get_turkey_time() + timedelta(seconds=LOGIN_BLOCK_DURATION))
        },
        user_agent
    )

def unblock_ip(ip: str):
    """IP ünvanını blokdan çıxarır"""
    if ip in blocked_ips:
        del blocked_ips[ip]
        save_blocked_ips()

# ═══════════════════════════════════════════════════════════════
# BLOK EDİLMİŞ IP-LƏRİ SAXLAMA
# ═══════════════════════════════════════════════════════════════

def load_blocked_ips():
    """Blok edilmiş IP-ləri fayldan yükləyir"""
    global blocked_ips
    try:
        if os.path.exists(BLOCKED_IPS_FILE):
            with open(BLOCKED_IPS_FILE, "r") as f:
                blocked_ips = json.load(f)
    except:
        blocked_ips = {}

def save_blocked_ips():
    """Blok edilmiş IP-ləri fayla yazır"""
    try:
        with open(BLOCKED_IPS_FILE, "w") as f:
            json.dump(blocked_ips, f)
    except:
        pass

# ═══════════════════════════════════════════════════════════════
# TƏHLÜKƏSİZLİK HESABATI
# ═══════════════════════════════════════════════════════════════

def get_security_report(limit: int = 100) -> dict:
    """Təhlükəsizlik hesabatını qaytarır"""
    
    logs = []
    try:
        if os.path.exists(SECURITY_SHIELD_LOG):
            with open(SECURITY_SHIELD_LOG, "r", encoding="utf-8") as f:
                lines = f.readlines()
                for line in lines[-limit:]:
                    try:
                        logs.append(json.loads(line.strip()))
                    except:
                        continue
    except:
        pass
    
    # Statistikalar
    stats = {
        "total_events": len(logs),
        "critical_events": len([l for l in logs if l.get("severity") == "CRITICAL"]),
        "high_events": len([l for l in logs if l.get("severity") == "HIGH"]),
        "medium_events": len([l for l in logs if l.get("severity") == "MEDIUM"]),
        "blocked_ips_count": len(blocked_ips),
        "blocked_ips": list(blocked_ips.keys())
    }
    
    return {
        "logs": list(reversed(logs)),
        "stats": stats,
        "generated_at": format_turkey_time()
    }

# ═══════════════════════════════════════════════════════════════
# TƏHLÜKƏSİZLİK BAŞLIQLAR
# ═══════════════════════════════════════════════════════════════

SECURITY_HEADERS = {
    # Server məlumatlarını gizlə
    "Server": "Secure",
    "X-Powered-By": "",
    
    # XSS qoruması
    "X-XSS-Protection": "1; mode=block",
    "X-Content-Type-Options": "nosniff",
    
    # Clickjacking qoruması
    "X-Frame-Options": "DENY",
    
    # HTTPS zorlaması
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    
    # Content Security Policy
    "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:; font-src 'self' https:; connect-src 'self' https:;",
    
    # Referrer policy
    "Referrer-Policy": "strict-origin-when-cross-origin",
    
    # Permissions policy
    "Permissions-Policy": "geolocation=(), microphone=(), camera=()"
}

def get_security_headers() -> dict:
    """Təhlükəsizlik başlıqlarını qaytarır"""
    return SECURITY_HEADERS.copy()

# İlk yükləmədə blok edilmiş IP-ləri yüklə
load_blocked_ips()
