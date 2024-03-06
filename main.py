from flask import Flask, jsonify, request
import requests
from flask_cors import CORS

app = Flask(__name__)
CORS(app) # Enable Cross-Origin Resource Sharing for the Flask app

# Holds mock user portfolio data for demonstration purposes.
# In a production environment, this would be dynamically retrieved from a database.
def user_database():
    return {
        "user1": {"AAPL": 10, "GOOGL": 5, "AMZN": 3},
    }

# Alpha Vantage API details
ALPHA_VANTAGE_API_KEY = 'AQ20KT9AHNJVT0UM'
ALPHA_VANTAGE_BASE_URL = "https://www.alphavantage.co/query"

@app.route('/')
def home():
    """Serve the home/welcome route.
    
    Returns a welcoming string to the user, indicating the service's purpose.
    """
    return "Welcome to DebuggingDollars - Your Stock Tracking Application"

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

if __name__ == '__main__':
    app.run(debug=True)  # Enable debug mode for development
