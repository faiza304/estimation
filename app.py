import os
import json
import locale
import ssl
from datetime import datetime
from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
from json import JSONEncoder
from pymongo import MongoClient
from bson.objectid import ObjectId
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Custom JSON encoder to handle MongoDB ObjectId and datetime objects
class CustomJSONEncoder(JSONEncoder):
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        if isinstance(obj, datetime):
            return obj.isoformat()
        return super(CustomJSONEncoder, self).default(obj)

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'construction-estimator-secret-key')
app.json_encoder = CustomJSONEncoder

# Set locale for currency formatting
try:
    locale.setlocale(locale.LC_ALL, 'en_IN.UTF-8')
except:
    try:
        locale.setlocale(locale.LC_ALL, 'en_US.UTF-8')
    except:
        pass  # Fall back to default locale if neither is available

# Custom Jinja2 filter for number formatting
@app.template_filter('number_format')
def number_format_filter(value):
    try:
        return format(float(value), ',.2f')
    except (ValueError, TypeError):
        return value

# MongoDB Atlas connection
MONGO_URI = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/construction_estimator')

# Configure MongoDB client with SSL settings for development
if 'mongodb+srv://' in MONGO_URI or '.mongodb.net' in MONGO_URI:
    # For MongoDB Atlas connections, disable SSL certificate verification in development
    client = MongoClient(
        MONGO_URI,
        tlsAllowInvalidCertificates=True,  # Disable certificate verification
        connectTimeoutMS=30000,
        socketTimeoutMS=30000,
        serverSelectionTimeoutMS=30000
    )
else:
    # For local MongoDB connections
    client = MongoClient(MONGO_URI)

# Get database and collection
db = client.get_database('construction_estimator')
estimates_collection = db.estimates

# Material prices and supplier information
prices = {
    "Cement": {
        "UltraTech": {"price": 325, "phone": "+91-800-325-0001"},
        "JK Cement": {"price": 310, "phone": "+91-800-310-0004"},
        "Birla": {"price": 320, "phone": "+91-800-320-0005"},
        "Shree": {"price": 300, "phone": "+91-800-300-0006"},
        "Ambuja": {"price": 315, "phone": "+91-800-315-0007"}
    },
    "Bricks": {
        "Red Bricks": {"price": 5.5, "phone": "+91-800-550-0002"},
        "Fly Ash Bricks": {"price": 6, "phone": "+91-800-600-0004"},
        "Clay Bricks": {"price": 5.8, "phone": "+91-800-580-0005"},
        "Eco Bricks": {"price": 6.2, "phone": "+91-800-620-0006"},
        "Solid Blocks": {"price": 6.5, "phone": "+91-800-650-0007"}
    },
    "Steel": {
        "Tata": {"price": 43000, "phone": "+91-800-430-0001"},
        "JSW": {"price": 41500, "phone": "+91-800-415-0002"},
        "SAIL": {"price": 40500, "phone": "+91-800-405-0003"},
        "Jindal": {"price": 41000, "phone": "+91-800-410-0004"},
        "Essar": {"price": 42000, "phone": "+91-800-420-0005"}
    },
    "Sand": {
        "River Sand": {"price": 1650, "phone": "+91-800-165-0001"},
        "M-Sand": {"price": 1550, "phone": "+91-800-155-0002"},
        "White Sand": {"price": 1700, "phone": "+91-800-170-0003"},
        "Brick Sand": {"price": 1500, "phone": "+91-800-150-0004"},
        "Plaster Sand": {"price": 1580, "phone": "+91-800-158-0005"}
    },
    "Paint": {
        "Asian Paints": {"price": 250, "phone": "+91-800-250-0001"},
        "Berger": {"price": 220, "phone": "+91-800-220-0002"},
        "Nerolac": {"price": 240, "phone": "+91-800-240-0003"},
        "Dulux": {"price": 260, "phone": "+91-800-260-0004"},
        "Kansai Nerolac": {"price": 230, "phone": "+91-800-230-0005"}
    }
}

# Helper function to get best supplier for each material
def get_best_suppliers(materials):
    best_suppliers = []
    suggested = {}
    
    for item in materials:
        material = item['material']
        if material not in suggested:
            best_company, details = min(prices[material].items(), key=lambda x: x[1]['price'])
            best_suppliers.append({
                'material': material,
                'company': best_company,
                'price': details['price'],
                'phone': details['phone']
            })
            suggested[material] = True
    
    return best_suppliers

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/save-estimate', methods=['POST'])
def save_estimate():
    try:
        # Get form data
        name = request.form.get('name')
        email = request.form.get('email')
        phone = request.form.get('phone')
        date = request.form.get('date')
        budget = float(request.form.get('budget'))
        items_json = request.form.get('items')
        
        if not items_json:
            flash('Please add at least one material item', 'error')
            return redirect(url_for('index'))
        
        items = json.loads(items_json)
        
        # Calculate totals
        subtotal = sum(item['total'] for item in items)
        delivery = sum((item['quantity'] / 1000) * 200 if item['unit'] == 'pieces' 
                      else (item['quantity'] / 10) * 200 for item in items)
        total = subtotal + delivery
        within_budget = total <= budget
        
        # Create estimate document
        estimate = {
            'customer_info': {
                'name': name,
                'email': email,
                'phone': phone,
                'date': date,
                'budget': budget
            },
            'items': items,
            'totals': {
                'subtotal': subtotal,
                'delivery': delivery,
                'total': total,
                'within_budget': within_budget
            },
            'created_at': datetime.now()
        }
        
        try:
            # Try to save to MongoDB
            result = estimates_collection.insert_one(estimate)
            estimate_id = str(result.inserted_id)
            flash('Estimate saved successfully!')
        except Exception as mongo_error:
            # If MongoDB fails, save to local file as fallback
            print(f"MongoDB error: {str(mongo_error)}")
            
            # Create a unique ID for the estimate
            import uuid
            estimate_id = str(uuid.uuid4())
            estimate['_id'] = estimate_id
            
            # Ensure the data directory exists
            data_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data')
            os.makedirs(data_dir, exist_ok=True)
            
            # Save to a local JSON file
            file_path = os.path.join(data_dir, f'estimate_{estimate_id}.json')
            with open(file_path, 'w') as f:
                # Convert datetime to string for JSON serialization
                estimate_copy = estimate.copy()
                estimate_copy['created_at'] = estimate_copy['created_at'].isoformat()
                json.dump(estimate_copy, f, indent=2)
            
            flash('Estimate saved locally (MongoDB connection failed)')
        
        return redirect(url_for('view_estimate', estimate_id=estimate_id))
    
    except Exception as e:
        flash(f'Error saving estimate: {str(e)}', 'error')
        return redirect(url_for('index'))

@app.route('/estimates')
def view_estimates():
    estimates = []
    
    # Try to get estimates from MongoDB
    try:
        mongo_estimates = list(estimates_collection.find().sort('created_at', -1))
        
        # Convert ObjectId to string for each estimate
        for estimate in mongo_estimates:
            estimate['_id'] = str(estimate['_id'])
            estimates.append(estimate)
    except Exception as mongo_error:
        print(f"MongoDB error in view_estimates: {str(mongo_error)}")
    
    # Also check for local files
    try:
        data_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data')
        if os.path.exists(data_dir):
            for filename in os.listdir(data_dir):
                if filename.startswith('estimate_') and filename.endswith('.json'):
                    file_path = os.path.join(data_dir, filename)
                    with open(file_path, 'r') as f:
                        local_estimate = json.load(f)
                        
                        # Check if this estimate is already in the list (from MongoDB)
                        estimate_id = local_estimate.get('_id')
                        if not any(e.get('_id') == estimate_id for e in estimates):
                            estimates.append(local_estimate)
    except Exception as file_error:
        print(f"Error reading local estimates: {str(file_error)}")
    
    # Sort all estimates by created_at date
    estimates.sort(key=lambda x: x.get('created_at', ''), reverse=True)
    
    return render_template('estimates.html', estimates=estimates)

@app.route('/estimate/<estimate_id>')
def view_estimate(estimate_id):
    try:
        # First try to get from MongoDB
        try:
            # Check if the ID is a valid ObjectId
            if len(estimate_id) == 24 and all(c in '0123456789abcdef' for c in estimate_id.lower()):
                estimate = estimates_collection.find_one({'_id': ObjectId(estimate_id)})
            else:
                # If not a valid ObjectId, it might be a UUID from local storage
                estimate = None
        except Exception as mongo_error:
            print(f"MongoDB error in view_estimate: {str(mongo_error)}")
            estimate = None
        
        # If not found in MongoDB, try to load from local file
        if not estimate:
            # Check local storage
            data_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data')
            file_path = os.path.join(data_dir, f'estimate_{estimate_id}.json')
            
            if os.path.exists(file_path):
                with open(file_path, 'r') as f:
                    estimate = json.load(f)
                    # Convert string date back to datetime if needed for processing
                    if isinstance(estimate.get('created_at'), str):
                        try:
                            estimate['created_at'] = datetime.fromisoformat(estimate['created_at'])
                        except:
                            # If conversion fails, keep as string
                            pass
            else:
                flash('Estimate not found', 'error')
                return redirect(url_for('view_estimates'))
        
        # Add best supplier suggestions if within budget
        if estimate['totals']['within_budget']:
            estimate['best_suppliers'] = get_best_suppliers(estimate['items'])
        
        # Ensure _id is a string
        if '_id' not in estimate or not isinstance(estimate['_id'], str):
            estimate['_id'] = str(estimate.get('_id', estimate_id))
        
        return render_template('estimate_detail.html', estimate=estimate)
    
    except Exception as e:
        flash(f'Error retrieving estimate: {str(e)}', 'error')
        return redirect(url_for('view_estimates'))

@app.route('/api/materials')
def get_materials():
    return jsonify(list(prices.keys()))

@app.route('/api/companies/<material>')
def get_companies(material):
    if material in prices:
        return jsonify(list(prices[material].keys()))
    return jsonify([])

if __name__ == '__main__':
    app.run(debug=True)