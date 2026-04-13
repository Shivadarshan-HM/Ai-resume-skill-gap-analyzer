import random
import string
import os
from datetime import datetime, timedelta
from flask_mail import Mail, Message

mail = Mail()


def generate_otp() -> str:
    return "".join(random.choices(string.digits, k=6))


def send_otp_email(email: str) -> bool:
    """Email pe OTP bhejo aur database mein save karo."""
    from database import db
    from models.user import OTPRecord

    otp = generate_otp()
    expiry = datetime.utcnow() + timedelta(minutes=10)

    # Purane OTP delete karo iss email ke liye
    OTPRecord.query.filter_by(email=email).delete()

    # Naya OTP database mein save karo
    record = OTPRecord(email=email, otp=otp, expiry=expiry)
    db.session.add(record)
    db.session.commit()

    sender = (
        os.getenv("MAIL_DEFAULT_SENDER")
        or os.getenv("MAIL_EMAIL")
        or os.getenv("MAIL_USERNAME")
        or "no-reply@localhost"
    )

    if not os.getenv("MAIL_USERNAME") or not os.getenv("MAIL_PASSWORD"):
        print(f"[DEV OTP] {email}: {otp}")
        return True

    try:
        msg = Message(
            subject="Your OTP - AI Resume Analyzer",
            sender=sender,
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
        print(f"[DEV OTP] {email}: {otp}")
        return True


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

    # Verify hone ke baad delete karo
    OTPRecord.query.filter_by(email=email).delete()
    db.session.commit()
    return True
