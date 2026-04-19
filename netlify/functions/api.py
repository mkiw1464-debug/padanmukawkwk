import os
import jwt
import datetime
import random
import smtplib
from flask import Flask, request, jsonify
from flask_cors import CORS
from email.mime.text import MIMEText
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configuration dari Netlify Environment Variables
SECRET_KEY = os.getenv("SECRET_KEY", "ARIFI_SECRET_2026")
EMAIL_ADDRESS = os.getenv("EMAIL_ADDRESS")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")

# Simpanan sementara (Akan reset setiap kali function sleep)
otp_storage = {}

# ---------------- UTILITIES ---------------- #
def generate_otp():
    return str(random.randint(100000, 999999))

# ---------------- EMAIL SERVICE ---------------- #
def send_otp_email(email):
    if not EMAIL_ADDRESS or not EMAIL_PASSWORD:
        return False, "Email credentials not configured."

    otp = generate_otp()
    otp_storage[email] = otp

    try:
        msg = MIMEText(f"Your ASD Security OTP is: {otp}\n\nDeveloper: ARIFI")
        msg["Subject"] = "ASD Security Toolkit OTP"
        msg["From"] = EMAIL_ADDRESS
        msg["To"] = email

        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
        server.send_message(msg)
        server.quit()
        return True, otp
    except Exception as e:
        return False, str(e)

# ---------------- API ENDPOINTS ---------------- #

@app.route('/.netlify/functions/api/bind', methods=['POST'])
def bind():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not email:
        return jsonify({"status": "error", "msg": "Email required"}), 400

    success, result = send_otp_email(email)
    if success:
        return jsonify({
            "status": "success", 
            "msg": f"OTP sent to {email}. (Dev: ARIFI)"
        }), 200
    else:
        return jsonify({"status": "error", "msg": result}), 500

@app.route('/.netlify/functions/api/login', methods=['POST'])
def login():
    data = request.json
    # Di sini biasanya kita check database
    # Untuk demo Netlify, kita buat return success
    return jsonify({
        "status": "success", 
        "msg": "Login successful (Demo Mode). Welcome ARIFI.",
        "user": "ARIFI_ADMIN"
    }), 200

@app.route('/.netlify/functions/api/token', methods=['POST'])
def generate_token():
    data = request.json
    email = data.get('email', 'user@arifi.com')
    
    payload = {
        "email": email,
        "iat": datetime.datetime.utcnow(),
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1),
        "dev": "ARIFI"
    }
    
    token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
    return jsonify({
        "status": "success", 
        "token": token,
        "msg": "Token generated successfully."
    }), 200

@app.route('/.netlify/functions/api/jwt-info', methods=['POST'])
def jwt_info():
    data = request.json
    token = data.get('token')
    try:
        decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return jsonify({"status": "success", "data": decoded}), 200
    except Exception as e:
        return jsonify({"status": "error", "msg": f"Invalid Token: {str(e)}"}), 400

@app.route('/.netlify/functions/api/temp-mail', methods=['POST'])
def temp_mail():
    name = ''.join(random.choices("abcdefghijklmnopqrstuvwxyz1234567890", k=8))
    return jsonify({
        "status": "success", 
        "email": f"{name}@tempmail.com",
        "msg": "Temporary email generated."
    }), 200

# ---------------- NETLIFY HANDLER ---------------- #
def handler(event, context):
    from serverless_wsgi import handle_request
    return handle_request(app, event, context)
