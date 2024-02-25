from flask import Flask, jsonify, request
import requests
from flask_cors import CORS
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)

portfolios = {
    "user1": ["AAPL", "GOOGL", "MSFT"]
}

ALPHA_VANTAGE_API_KEY = 'AQ20KT9AHNJVT0UM'
ALPHA_VANTAGE_BASE_URL = "https://www.alphavantage.co/query"

@app.route('/')
def home():
    return "Welcome to DebuggingDollars - Your Stock Tracking Application"

@app.route('/portfolio/<user_id>', methods=['GET'])
def get_portfolio(user_id):
    portfolio = portfolios.get(user_id)
    if portfolio is None:
        return jsonify({"error": "User not found or portfolio is empty"}), 404
    return jsonify({"portfolio": portfolio})

@app.route('/stockinfo/<symbol>', methods=['GET'])
def get_stock_info(symbol):
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
        # Extraer y transformar los datos para obtener solo la información de los últimos 5 días hábiles.
        time_series = data.get("Time Series (Daily)", {})
        last_five_days = sorted(time_series.keys(), reverse=True)[:5]
        stock_info = [
            {
                "date": day,
                "open": time_series[day]["1. open"],
                "high": time_series[day]["2. high"],
                "low": time_series[day]["3. low"],
                "close": time_series[day]["4. close"],
                "volume": time_series[day]["5. volume"]
            } for day in last_five_days
        ]
        return jsonify(stock_info)
    else:
        return jsonify({"error": "Failed to retrieve stock information"}), response.status_code

if __name__ == '__main__':
    app.run(debug=True)
