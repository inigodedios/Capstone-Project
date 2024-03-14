from flask import Flask, jsonify, request
import requests
from flask_cors import CORS
from sqlalchemy.pool import NullPool
import oracledb
from sqlalchemy import create_engine, text
from models import db, User, UserStock

app = Flask(__name__)
CORS(app) # Enable Cross-Origin Resource Sharing for the Flask app
app.config['SECRET_KEY'] = 'una_clave_secreta_muy_segura'

un = 'ADMIN'
pw = 'tescYb-rojjaq-rismy6'
dsn ="(description= (retry_count=20)(retry_delay=3)(address=(protocol=tcps)(port=1522)(host=adb.eu-madrid-1.oraclecloud.com))(connect_data=(service_name=ga981702cb90572_dbcaps_high.adb.oraclecloud.com))(security=(ssl_server_dn_match=yes)))"
pool = oracledb.create_pool(user=un, password=pw,
                            dsn=dsn)
app.config['SQLALCHEMY_DATABASE_URI'] = 'oracle+oracledb://'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    'creator': pool.acquire,
    'poolclass': NullPool
}
app.config['SQLALCHEMY_ECHO'] = True
db.init_app(app)
with app.app_context():
    db.create_all()

def user_database():
    return {
        "user1": {"AAPL": 10, "GOOGL": 5, "AMZN": 3},
    }

ALPHA_VANTAGE_API_KEY = 'AQ20KT9AHNJVT0UM'
ALPHA_VANTAGE_BASE_URL = "https://www.alphavantage.co/query"

@app.route('/')
def home():
    """Serve the home/welcome route.
    
    Returns a welcoming string to the user, indicating the service's purpose.
    """
    return "Welcome to DebuggingDollars - Your Stock Tracking Application"


@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(USERNAME=username, PASSWORD=password).first()
    
    return jsonify({"message": "Login successful"}), 200

@app.route('/logout', methods=['GET'])
def logout():
    return jsonify({"message": "Logout successful"}), 200

def user_database():
    return {
        "user1": {"AAPL": 10, "GOOGL": 5, "AMZN": 3},
    }

@app.route('/<user_id>', methods=['GET'])
def get_portfolio(user_id):
    """Fetches and returns the portfolio for a specified user ID.
    
    Retrieves the user's portfolio from a mock database and calculates the current total value
    by fetching real-time stock prices from the Alpha Vantage API. If the user is not found,
    returns an error message with a 404 status code.

    Args:
        user_id: The ID of the user whose portfolio is being requested.
    
    Returns:
        A JSON object with the total portfolio value and the value of individual stocks.
    """
    portfolios = user_database()  # Retrieve mock user database
    portfolio = portfolios.get(user_id)
    if portfolio is None:
        return jsonify({"error": "User not found"}), 404

    portfolio_with_values = {}
    total_value = 0  # Initialize total value of the portfolio

    # Iterate through each stock in the user's portfolio to fetch its current price
    for symbol, quantity in portfolio.items():
        params = {
            "function": "GLOBAL_QUOTE",
            "symbol": symbol,
            "apikey": ALPHA_VANTAGE_API_KEY
        }
        response = requests.get(ALPHA_VANTAGE_BASE_URL, params=params)
        if response.status_code == 200:
            data = response.json()
            price = float(data["Global Quote"]["05. price"])
            value = quantity * price # Calculate the value of holdings in that stock
            rounded_value = round(value, 2) # Round to 2 decimal places for currency formatting
            total_value += rounded_value
            portfolio_with_values[symbol] = {
                "quantity": quantity,
                "value": rounded_value
            }
        else:
            return jsonify({"error": f"Failed to retrieve stock information for {symbol}"}), response.status_code

    rounded_total_value = round(total_value, 2) # Round to 2 decimal places for currency formatting
    return jsonify({
        "total_value": rounded_total_value,
        "symbols": portfolio_with_values
    })

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
    

@app.route('/modify_portfolio/<user_id>', methods=['POST'])
def modify_portfolio(user_id):
    data = request.json
    action = data.get('action')
    symbol = data.get('symbol').upper()
    quantity = int(data.get('quantity'))

    if action not in ['add', 'remove']:
        return jsonify({"error": "Invalid action specified"}), 400
    
    try:
        conn = oracledb.connect(user=un, password=pw, dsn=dsn)
        cursor = conn.cursor()

        # Check if the stock already exists for the user
        cursor.execute("""
            SELECT QUANTITY 
            FROM USER_STOCKS 
            WHERE USERID = :user_id AND STOCKSYMBOL = :symbol
        """, user_id=user_id, symbol=symbol)
        row = cursor.fetchone()

        if action == 'add':
            if row:
                new_quantity = row[0] + quantity
                cursor.execute("""
                    UPDATE USER_STOCKS 
                    SET QUANTITY = :quantity 
                    WHERE USERID = :user_id AND STOCKSYMBOL = :symbol
                """, quantity=new_quantity, user_id=user_id, symbol=symbol)
            else:
                cursor.execute("""
                    INSERT INTO USER_STOCKS (USERID, STOCKSYMBOL, QUANTITY) 
                    VALUES (:user_id, :symbol, :quantity)
                """, user_id=user_id, symbol=symbol, quantity=quantity)

        elif action == 'remove':
            if row and row[0] > quantity:
                new_quantity = row[0] - quantity
                cursor.execute("""
                    UPDATE USER_STOCKS 
                    SET QUANTITY = :quantity 
                    WHERE USERID = :user_id AND STOCKSYMBOL = :symbol
                """, quantity=new_quantity, user_id=user_id, symbol=symbol)
            elif row:
                cursor.execute("""
                    DELETE FROM USER_STOCKS 
                    WHERE USERID = :user_id AND STOCKSYMBOL = :symbol
                """, user_id=user_id, symbol=symbol)

        # Commit the changes
        conn.commit()

        # Now fetch the updated portfolio to return to the frontend
        cursor.execute("""
            SELECT STOCKSYMBOL, QUANTITY 
            FROM USER_STOCKS 
            WHERE USERID = :user_id
        """, user_id=user_id)
        portfolio = cursor.fetchall()
        
        # Initialize total value of the portfolio
        total_value = 0
        portfolio_with_values = {}

        # Fetch the current stock prices and calculate total value
        for symbol, quantity in portfolio:
            params = {
                "function": "GLOBAL_QUOTE",
                "symbol": symbol,
                "apikey": ALPHA_VANTAGE_API_KEY
            }
            response = requests.get(ALPHA_VANTAGE_BASE_URL, params=params)
            if response.status_code == 200:
                data = response.json()
                price = float(data["Global Quote"]["05. price"])
                value = quantity * price
                rounded_value = round(value, 2)
                total_value += rounded_value
                portfolio_with_values[symbol] = {
                    "quantity": quantity,
                    "value": rounded_value
                }
            else:
                conn.close()
                return jsonify({"error": f"Failed to retrieve stock information for {symbol}"}), response.status_code
        
        # Round total value to 2 decimal places
        rounded_total_value = round(total_value, 2)

        # Close the connection
        conn.close()

        return jsonify({
            "total_value": rounded_total_value,
            "symbols": portfolio_with_values
        }), 200

    except oracledb.Error as e:
        # Rollback in case of error
        if conn:
            conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()

if __name__ == '__main__':
    app.run(debug=True)  # Enable debug mode for development
