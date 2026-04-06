import random
import string
from datetime import datetime, timedelta
from flask_mail import Mail, Message

mail = Mail()

# OTP store karne ke liye (production mein Redis use karo)
otp_store = {}


def generate_otp() -> str:
    return "".join(random.choices(string.digits, k=6))


def send_otp_email(email: str) -> bool:
    """Email pe OTP bhejo, True return karo agar success."""
    otp = generate_otp()
    expiry = datetime.utcnow() + timedelta(minutes=10)
    otp_store[email] = {"otp": otp, "expiry": expiry}

    try:
        msg = Message(
            subject="Your OTP - AI Resume Analyzer",
            recipients=[email],
            body=f"""Hello!

Your OTP for AI Resume Skill Gap Analyzer is:

{otp}

This OTP is valid for 10 minutes.

If you did not request this, please ignore this email.

— AI Resume Team"""
        )
        mail.send(msg)
        return True
    except Exception as e:
        print(f"Email send error: {e}")
        return False


def verify_otp(email: str, otp: str) -> bool:
    """OTP verify karo — sahi hai aur expire nahi hua?"""
    record = otp_store.get(email)
    if not record:
        return False
    if datetime.utcnow() > record["expiry"]:
        otp_store.pop(email, None)
        return False
    if record["otp"] != otp:
        return False
    otp_store.pop(email, None)
    return True
