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
dsn ="(description= (retry_count=20)(retry_delay=3)(address=(protocol=tcps)(port=1522)(host=adb.eu-madrid-1.oraclecloud.com))(connect_data=(service_name=ga981702cb90572_dbcaps_low.adb.oraclecloud.com))(security=(ssl_server_dn_match=yes)))"
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


def user_database():
    return {
        "user1": {"AAPL": 10, "GOOGL": 5, "AMZN": 3},
    }


def fetch_current_stock_price(symbol):
    """Fetches the current stock price for a given symbol from the Alpha Vantage API."""
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

@app.route('/overview', methods=['GET'])
def get_portfolio():
    user_id = 1  # Reemplazar con lógica de identificación del usuario según sea necesario

    response_data = []  # Inicia con una lista vacía
    total_value = 0  # Para calcular el valor total de la cartera

    try:
        conn = pool.acquire()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT STOCKSYMBOL, QUANTITY
            FROM USER_STOCKS
            WHERE USERID = :1
        """, [user_id])
        
        rows = cursor.fetchall()  # Asegúrate de obtener todos los resultados
        for row in rows:
            symbol, quantity = row
            params = {
                "function": "GLOBAL_QUOTE",
                "symbol": symbol,
                "apikey": ALPHA_VANTAGE_API_KEY
            }
            response = requests.get(ALPHA_VANTAGE_BASE_URL, params=params)
            data = response.json()
            if "Global Quote" in data and "05. price" in data["Global Quote"]:
                price = float(data["Global Quote"]["05. price"])
                value = quantity * price
                total_value += value
                response_data.append({symbol: {"quantity": quantity, "value": round(value, 2)}})
            else:
                # Manejo de errores si la respuesta de la API no es la esperada
                raise ValueError(f"Failed to retrieve data for {symbol}")

        # Agregar el valor total al principio de la lista de datos de respuesta
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
    user_id = 1  # Assuming user_id is static for demonstration
    data = request.json
    symbol = data.get('stock_symbol', '').upper()
    quantity = int(data.get('quantity', 0))
    operation = data.get('operation', '').upper()

    if operation not in ['ADD', 'REMOVE']:
        return jsonify({"error": "Invalid action specified"}), 400

    try:
        conn = pool.acquire()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT QUANTITY 
            FROM USER_STOCKS 
            WHERE USERID = :1 AND STOCKSYMBOL = :2
        """, [user_id, symbol])
        row = cursor.fetchone()

        if operation == 'ADD':
            if row:
                new_quantity = row[0] + quantity
                cursor.execute("""
                    UPDATE USER_STOCKS 
                    SET QUANTITY = :1 
                    WHERE USERID = :2 AND STOCKSYMBOL = :3
                """, [new_quantity, user_id, symbol])
            else:
                cursor.execute("""
                    INSERT INTO USER_STOCKS (USERID, STOCKSYMBOL, QUANTITY) 
                    VALUES (:1, :2, :3)
                """, [user_id, symbol, quantity])

        elif operation == 'REMOVE':
            if row and row[0] >= quantity:
                new_quantity = row[0] - quantity
                if new_quantity > 0:
                    cursor.execute("""
                        UPDATE USER_STOCKS 
                        SET QUANTITY = :1 
                        WHERE USERID = :2 AND STOCKSYMBOL = :3
                    """, [new_quantity, user_id, symbol])
                else:
                    cursor.execute("""
                        DELETE FROM USER_STOCKS 
                        WHERE USERID = :1 AND STOCKSYMBOL = :2
                    """, [user_id, symbol])
            else:
                return jsonify({"error": "Not enough stock to remove or stock not found in portfolio"}), 400

        conn.commit()

        # Fetch and return the updated portfolio overview
        cursor.execute("""
            SELECT STOCKSYMBOL, QUANTITY
            FROM USER_STOCKS
            WHERE USERID = :1
        """, [user_id])
        updated_portfolio = cursor.fetchall()

        # Calculate total value and prepare response data
        total_value = 0
        response_data = [{"total_value": 0}]
        for symbol, quantity in updated_portfolio:
            params = {
                "function": "GLOBAL_QUOTE",
                "symbol": symbol,
                "apikey": ALPHA_VANTAGE_API_KEY
            }
            response = requests.get(ALPHA_VANTAGE_BASE_URL, params=params)
            data = response.json()
            price = float(data["Global Quote"]["05. price"])
            value = quantity * price
            rounded_value = round(value, 2)
            total_value += rounded_value
            response_data.append({symbol: {"quantity": quantity, "value": rounded_value}})

        response_data[0]["total_value"] = round(total_value, 2)

        return jsonify(response_data)
    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            pool.release(conn)


if __name__ == '__main__':
    app.run(debug=True)  # Enable debug mode for development
