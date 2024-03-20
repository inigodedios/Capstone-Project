import hashlib
from flask import Flask, jsonify, request
import requests
from flask_cors import CORS
from sqlalchemy.pool import NullPool
import oracledb
from models import db, User
from flask import Flask, session
from flask_session import Session

# Initialize the Flask application
app = Flask(__name__)
CORS(app, supports_credentials=True)

app.config['SECRET_KEY'] = 'una_clave_secreta_muy_segura'
app.config['SESSION_TYPE'] = 'filesystem'  # Puedes usar 'redis', 'memcached', 'mongodb', o 'sqlalchemy' también.
app.config['SESSION_COOKIE_SAMESITE'] = 'None'
app.config['SESSION_COOKIE_SECURE'] = True
#Session(app)

# Configuration settings for the application and database connection.
un = 'ADMIN'
pw = 'tescYb-rojjaq-rismy6'
dsn = """
(description=
    (retry_count=20)
    (retry_delay=3)
    (address=(protocol=tcps)(port=1522)(host=adb.eu-madrid-1.oraclecloud.com))
    (connect_data=(service_name=ga981702cb90572_dbcaps_low.adb.oraclecloud.com))
    (security=(ssl_server_dn_match=yes))
)
"""
pool = oracledb.create_pool(user=un, password=pw, dsn=dsn)
app.config['SQLALCHEMY_DATABASE_URI'] = 'oracle+oracledb://'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_POOL_RECYCLE'] = 299  
app.config['SQLALCHEMY_POOL_TIMEOUT'] = 30
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    'creator': pool.acquire,
    'poolclass': NullPool
}
app.config['SQLALCHEMY_ECHO'] = True

# Initialize SQLAlchemy with the Flask app
db.init_app(app)

# Initialize database models within application context.
with app.app_context():
    db.create_all()

# Configuration for Alpha Vantage API access.
ALPHA_VANTAGE_API_KEY = 'AQ20KT9AHNJVT0UM'
ALPHA_VANTAGE_BASE_URL = "https://www.alphavantage.co/query"


@app.route('/login', methods=['POST'])
def login():
    print(0)
    data = request.get_json()
    print(0.5)
    username = data.get('username')
    password = data.get("password")
    print(1)
    user = User.query.filter_by(USERNAME=username, PASSWORD=password).first()
    print(user)
    if user:
        session['user_id'] = user.USERID  # Establece el usuario en la sesión
        response = {'message': 'Login successful'}
        return jsonify(response), 200
    else:
        response = {'message': 'Username or Password incorrect'}
        return jsonify(response), 401


@app.route('/logout', methods=['GET'])
def logout():
    session.pop('user_id', None)  # Elimina el usuario de la sesión
    return jsonify({'message': 'Logout.'}), 200


def fetch_current_stock_price(symbol):
    """
    Fetches the current stock price for a given symbol using the Alpha Vantage API.
    
    Parameters:
    symbol (str): The stock symbol to fetch the price for.
    
    Returns:
    float: The current price of the stock, or None if not found.
    """
    params = {
        "function": "GLOBAL_QUOTE",
        "symbol": symbol,
        "apikey": ALPHA_VANTAGE_API_KEY
    }
    response = requests.get(ALPHA_VANTAGE_BASE_URL, params=params)
    if response.status_code == 200 and "Global Quote" in response.json() and "05. price" in response.json()["Global Quote"]:
        return float(response.json()["Global Quote"]["05. price"])
    else:
        return None

@app.route('/')
def home():
    """
    Serves the home/welcome route, returning a welcoming string.
    
    Returns:
    str: A welcoming message indicating the service's purpose.
    """
    return "Welcome to DebuggingDollars - Your Stock Tracking Application"

@app.route('/overview', methods=['GET'])
def get_portfolio():
    """
    Retrieves the complete portfolio for a specific user.

    For demonstration purposes, the user_id is statically set to 1. In a real application,
    this would be dynamically determined based on the authenticated user's ID.

    Returns a JSON response containing the total value of the user's portfolio
    and detailed information about each stock within it.
    """
    if 'user_id' not in session:
        
        return jsonify({'message': 'User not authenticated'}), 401

    user_id = session['user_id']

    response_data = []  
    total_value = 0 

    try:
        conn = pool.acquire()  # Acquire database connection from the connection pool
        cursor = conn.cursor()  # Create a new cursor
        
        # Execute SQL query to fetch user's stocks and their quantities
        cursor.execute("""
            SELECT STOCKSYMBOL, QUANTITY
            FROM USER_STOCKS
            WHERE USERID = :1
        """, [user_id])
        
        rows = cursor.fetchall()  # Fetch all rows from the query result
        # Iterate through each row to calculate stock values and aggregate data
        for row in rows:
            symbol, quantity = row  
            params = {
                "function": "GLOBAL_QUOTE",
                "symbol": symbol,
                "apikey": ALPHA_VANTAGE_API_KEY
            }
            response = requests.get(ALPHA_VANTAGE_BASE_URL, params=params)
            data = response.json()

            # If stock price data is available, calculate and append to response_data
            if "Global Quote" in data and "05. price" in data["Global Quote"]:
                price = float(data["Global Quote"]["05. price"])
                value = quantity * price
                total_value += value  # Add to total portfolio value
                response_data.append({symbol: {"quantity": quantity, "value": round(value, 2)}})
            else:
                raise ValueError(f"Failed to retrieve data for {symbol}")

        # Prepend total portfolio value to the response data
        response_data.insert(0, {"total_value": round(total_value, 2)})
        return jsonify(response_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            pool.release(conn)

@app.route('/stockinfo/<symbol>', methods=['GET'])
def get_stock_info(symbol):
    """Fetches and returns stock information for a given symbol.
    
    Retrieves the last five days of daily stock data for the specified symbol
    from the Alpha Vantage API, returning it in a structured JSON format.

    Args:
        symbol: The stock symbol for which information is requested.
    
    Returns:
        A JSON array with stock data for the last five trading days.
    """
    params = {
        "function": "TIME_SERIES_DAILY",
        "symbol": symbol,
        "apikey": ALPHA_VANTAGE_API_KEY,
        "outputsize": "compact",
        "datatype": "json"
    }
    response = requests.get(ALPHA_VANTAGE_BASE_URL, params=params)
    if response.status_code == 200:
        data = response.json()
        time_series = data.get("Time Series (Daily)", {})
        last_five_days = sorted(time_series.keys(), reverse=True)[:5]
        stock_info = []
        for day in last_five_days:
            daily_data = time_series[day]
            stock_info.append([
                day,  # Include date
                {
                "1. open": round(float(daily_data["1. open"]), 2),
                "2. high": round(float(daily_data["2. high"]), 2),
                "3. low": round(float(daily_data["3. low"]), 2),
                "4. close": round(float(daily_data["4. close"]), 2),
                "5. volume": int(daily_data["5. volume"])  # Convert volume to integer
                }
            ])
        return jsonify(stock_info)
    else:
        return jsonify({"error": "Failed to retrieve stock information"}), response.status_code
    

@app.route('/modifyPortfolio/', methods=['POST'])
def modify_portfolio():
    """
    Handles the modification of a user's stock portfolio, enabling the addition or removal
    of stock quantities through a RESTful API request. This function assumes a static user ID
    for demonstration purposes and would need to be adapted for a production environment to 
    dynamically authenticate and identify the user making the request.

    Parameters included in the request:
    - stock_symbol: The ticker symbol of the stock to be modified (e.g., 'AAPL').
    - quantity: The number of shares to be added or removed.
    - operation: A string indicating the modification operation, either 'ADD' or 'REMOVE'.

    Returns:
    - A JSON response indicating the success or failure of the operation along with
      an updated overview of the user's stock portfolio.

    Raises:
    - JSON response with error message if any part of the process fails, including invalid 
      stock symbols, invalid operations, or database access issues.
    """
    # Static user_id for demonstration; will be replaced with dynamic user authentication in production
    if 'user_id' not in session:
        return jsonify({'message': 'User not authenticated'}), 401

    user_id = session['user_id']
    data = request.json  # Extract data from the request body
    symbol = data.get('stock_symbol', '').upper()  # Normalize stock symbol to uppercase
    quantity = int(data.get('quantity', 0))  # Convert quantity to integer
    operation = data.get('operation', '').upper()  # Normalize operation to uppercase

    # Validate the operation
    if operation not in ['ADD', 'REMOVE']:
        return jsonify({"error": "Invalid action specified"}), 400
    
    # Fetch current stock price using helper function
    current_price = fetch_current_stock_price(symbol)
    if current_price is None:
        return jsonify({"error": "Invalid stock symbol"}), 400

    try:
        conn = pool.acquire()
        cursor = conn.cursor()

       # Check if the stock exists in the user's portfolio
        cursor.execute("""
            SELECT QUANTITY FROM USER_STOCKS WHERE USERID = :1 AND STOCKSYMBOL = :2
        """, [user_id, symbol])
        row = cursor.fetchone()

        if operation == 'REMOVE':
            if not row: # Stock not found in portfolio
                return jsonify({"error": "Stock not found in portfolio"}), 400
            if row[0] < quantity: # Requested quantity exceeds what's available
                return jsonify({"error": "Requested quantity exceeds stocks in portfolio"}), 400
        
        # Fetch the current stock quantity for the given user and stock symbol.
        cursor.execute("""
            SELECT QUANTITY 
            FROM USER_STOCKS 
            WHERE USERID = :1 AND STOCKSYMBOL = :2
        """, [user_id, symbol])
        row = cursor.fetchone()

        # Depending on whether the operation is to 'ADD' or 'REMOVE', update the database accordingly.
        if operation == 'ADD':
            # If the stock already exists in the user's portfolio, update the quantity.
            if row:
                new_quantity = row[0] + quantity
                # Update the stock quantity for the specified user and stock symbol.
                cursor.execute("""
                    UPDATE USER_STOCKS 
                    SET QUANTITY = :1 
                    WHERE USERID = :2 AND STOCKSYMBOL = :3
                """, [new_quantity, user_id, symbol])
            else:
                # If the stock does not exist, insert a new record into the portfolio.
                cursor.execute("""
                    INSERT INTO USER_STOCKS (USERID, STOCKSYMBOL, QUANTITY) 
                    VALUES (:1, :2, :3)
                """, [user_id, symbol, quantity])

        elif operation == 'REMOVE':
            # Ensure the stock exists and has enough quantity to remove.
            if row and row[0] >= quantity:
                new_quantity = row[0] - quantity
                if new_quantity > 0:
                    # If stocks remain after removal, update the quantity.
                    cursor.execute("""
                        UPDATE USER_STOCKS 
                        SET QUANTITY = :1 
                        WHERE USERID = :2 AND STOCKSYMBOL = :3
                    """, [new_quantity, user_id, symbol])
                else:
                    # If no stocks remain, remove the stock from the portfolio.
                    cursor.execute("""
                        DELETE FROM USER_STOCKS 
                        WHERE USERID = :1 AND STOCKSYMBOL = :2
                    """, [user_id, symbol])
            else:
                # If the request exceeds the available stock quantity, return an error.
                return jsonify({"error": "Not enough stock to remove or stock not found in portfolio"}), 400
        conn.commit()
       
        # Retrieves the updated stock portfolio for the user from the database.
        cursor.execute("""
            SELECT STOCKSYMBOL, QUANTITY
            FROM USER_STOCKS
            WHERE USERID = :1
        """, [user_id])
        updated_portfolio = cursor.fetchall()

        total_value = 0
        response_data = [{"total_value": 0}]

        # Iterates over each stock in the updated portfolio to calculate its current market value.
        for symbol, quantity in updated_portfolio:
            params = {
                "function": "GLOBAL_QUOTE",
                "symbol": symbol,
                "apikey": ALPHA_VANTAGE_API_KEY
            }
            response = requests.get(ALPHA_VANTAGE_BASE_URL, params=params)
            data = response.json()
            # If the response is valid, calculates the total value of the user's holdings in that stock.
            if "Global Quote" in data and "05. price" in data["Global Quote"]:
                price = float(data["Global Quote"]["05. price"])
                value = quantity * price
                rounded_value = round(value, 2)
                total_value += rounded_value
                response_data.append({symbol: {"quantity": quantity, "value": rounded_value}})

                # Updates the total portfolio value in the response data
                response_data[0]["total_value"] = round(total_value, 2)

        return jsonify(response_data)
    # Handles exceptions, rolls back any changes if an error occurs, and returns an error message.
    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            pool.release(conn)


if __name__ == '__main__':
    app.run(debug=True, port=5001)  # Enable debug mode for development