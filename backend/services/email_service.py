import random
import string
from datetime import datetime, timedelta
from flask_mail import Mail, Message
from flask import current_app

mail = Mail()


def generate_otp() -> str:
    return "".join(random.choices(string.digits, k=6))


def send_otp_email(email: str) -> bool:
    """Email pe OTP bhejo aur database mein save karo.

    Returns:
        dict: {
            "success": bool,
            "delivered": bool,
            "otp": str | None
        }
    """
    from database import db
    from models.user import OTPRecord

    email = (email or "").strip().lower()
    otp = generate_otp()
    expiry = datetime.utcnow() + timedelta(minutes=10)

    OTPRecord.query.filter_by(email=email).delete()

    record = OTPRecord(email=email, otp=otp, expiry=expiry)
    db.session.add(record)
    db.session.commit()

    mail_username = current_app.config.get("MAIL_USERNAME")
    mail_password = current_app.config.get("MAIL_PASSWORD")

    # Sender name — professional dikhega
    sender = ("CVisionay - AI Career Studio", mail_username or "no-reply@localhost")

    allow_otp_in_response = bool(current_app.config.get("ALLOW_OTP_IN_RESPONSE", False))

    if not mail_username or not mail_password:
        if current_app.debug or allow_otp_in_response:
            print(f"[DEV OTP] {email}: {otp}")
            return {"success": True, "delivered": False, "otp": otp}
        OTPRecord.query.filter_by(email=email).delete()
        db.session.commit()
        return {"success": False, "delivered": False, "otp": None}

    try:
        msg = Message(
            subject="Your OTP - CVisionay AI Career Studio",
            sender=sender,
            recipients=[email],
            body=f"""Hello!

Your OTP for CVisionay is:

  {otp}

This OTP is valid for 10 minutes.

If you did not request this, please ignore this email.

— CVisionay AI Career Studio Team"""
        )
        mail.send(msg)
        return {"success": True, "delivered": True, "otp": None}
    except Exception as e:
        print(f"Email send error: {e}")
        if current_app.debug or allow_otp_in_response:
            print(f"[DEV OTP] {email}: {otp}")
            return {"success": True, "delivered": False, "otp": otp}
        OTPRecord.query.filter_by(email=email).delete()
        db.session.commit()
        return {"success": False, "delivered": False, "otp": None}


def verify_otp(email: str, otp: str) -> bool:
    """Database se OTP verify karo."""
    from database import db
    from models.user import OTPRecord

    record = OTPRecord.query.filter_by(email=email).order_by(OTPRecord.created_at.desc()).first()

    if not record:
        return False

    if datetime.utcnow() > record.expiry:
        OTPRecord.query.filter_by(email=email).delete()
        db.session.commit()
        return False

    if record.otp != otp:
        return False

    OTPRecord.query.filter_by(email=email).delete()
    db.session.commit()
    return True
