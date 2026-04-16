from flask import Flask, request, jsonify, send_from_directory, Response
from pymongo import MongoClient
import os
import json
import razorpay
from bson.json_util import dumps
from bson.objectid import ObjectId
app = Flask(__name__, static_folder='.')

# Razorpay Initialisation
RAZORPAY_KEY_ID = os.environ.get("RAZORPAY_KEY_ID", "rzp_test_dummykey")
RAZORPAY_KEY_SECRET = os.environ.get("RAZORPAY_KEY_SECRET", "dummysecret")

if RAZORPAY_KEY_ID != "rzp_test_dummykey":
    razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
else:
    razorpay_client = None

# MongoDB connection (Cloud-ready)
MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017/")
client = MongoClient(MONGO_URI)
db = client["loomi_store"]
orders = db["orders"]

# Serve index.html
@app.route("/")
def home():
    return send_from_directory('.', 'index.html')

# Serve Admin Dashboard
@app.route("/admin")
def admin_page():
    return send_from_directory('.', 'admin.html')

# API to fetch orders
@app.route("/api/orders", methods=["GET"])
def get_orders():
    all_orders = list(orders.find())
    return Response(dumps(all_orders), mimetype="application/json")

# API to delete an order
@app.route("/api/orders/<order_id>", methods=["DELETE"])
def delete_order(order_id):
    try:
        result = orders.delete_one({"_id": ObjectId(order_id)})
        if result.deleted_count == 1:
            return jsonify({"status": "success", "message": "Order deleted"})
        else:
            return jsonify({"status": "error", "message": "Order not found"}), 404
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# Serve CSS, JS, images
@app.route('/<path:path>')
def static_files(path):
    return send_from_directory('.', path)

# Order API
@app.route("/place-order", methods=["POST"])
def place_order():
    data = request.get_json()
    print("DATA RECEIVED:", data)
    
    # Optional: Verify Razorpay signature if online payment
    if data.get("paymentMethod") == "online" and razorpay_client:
        payment_id = data.get("razorpay_payment_id")
        order_id = data.get("razorpay_order_id")
        signature = data.get("razorpay_signature")
        try:
            razorpay_client.utility.verify_payment_signature({
                'razorpay_order_id': order_id,
                'razorpay_payment_id': payment_id,
                'razorpay_signature': signature
            })
            data["paymentStatus"] = "Paid"
        except Exception as e:
            print("Signature verification failed:", e)
            return jsonify({"status": "error", "message": "Payment verification failed"}), 400
    elif data.get("paymentMethod") == "online":
        data["paymentStatus"] = "Paid (Test)"
    else:
        data["paymentStatus"] = "Pending (COD)"

    orders.insert_one(data)
    
    # Trigger email notification for production
    try:
        customer_name = data.get("firstName", "Unknown")
        sender_email = os.environ.get("SMTP_EMAIL")
        sender_password = os.environ.get("SMTP_PASSWORD")
        receiver_email = os.environ.get("STORE_OWNER_EMAIL", sender_email)
        
        if sender_email and sender_password:
            import smtplib
            from email.mime.text import MIMEText
            
            msg = MIMEText(f"A new order was just placed by {customer_name}!\n\nPlease check your admin dashboard for details.")
            msg['Subject'] = 'New Order - Loomi Store'
            msg['From'] = 'Loomi Notifications'
            msg['To'] = receiver_email
            
            with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
                server.login(sender_email, sender_password)
                server.send_message(msg)
            print("Email notification sent successfully.")
        else:
            # Fallback for local testing or unconfigured environments
            print(f"STORE NOTIFICATION: A new order was just placed by {customer_name}! (Configure SMTP env vars to receive emails)")
    except Exception as e:
        print("Failed to send email notification:", e)

    return jsonify({"status": "success"})

@app.route("/create-razorpay-order", methods=["POST"])
def create_razorpay_order():
    try:
        data = request.get_json()
        amount = int(data.get("amount", 0)) * 100 # Razorpay expects paise

        if razorpay_client:
            order_data = {
                "amount": amount,
                "currency": "INR",
                "receipt": "order_rcptid_11",
                "payment_capture": 1
            }
            order = razorpay_client.order.create(data=order_data)
            return jsonify({"status": "success", "order_id": order["id"], "key": RAZORPAY_KEY_ID})
        else:
            # Return dummy order ID for testing if keys are mock
            return jsonify({"status": "success", "order_id": "order_test123", "key": RAZORPAY_KEY_ID})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/test")
def test():
    print("TEST WORKING")
    return "OK"

if __name__ == "__main__":
    app.run(debug=True)
