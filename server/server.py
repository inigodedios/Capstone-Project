from flask import Flask, jsonify, request
import requests
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

portfolios = {
    "user1": {"AAPL": 10, "GOOGL": 5, "MSFT": 3}
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
        return jsonify({"error": "User not found"}), 404

    portfolio_with_values = {}
    total_value = 0

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
            value = quantity * price
            rounded_value = round(value, 2)
            total_value += rounded_value
            portfolio_with_values[symbol] = {
                "quantity": quantity,
                "value": rounded_value 
            }
        else:
            return jsonify({"error": f"Failed to retrieve stock information for {symbol}"}), response.status_code

    rounded_total_value = round(total_value, 2)

    return jsonify({
        "total_value": rounded_total_value,
        "symbols": portfolio_with_values
    })

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
        time_series = data.get("Time Series (Daily)", {})
        last_five_days = sorted(time_series.keys(), reverse=True)[:5]
        stock_info = []
        for day in last_five_days:
            daily_data = time_series[day]
            stock_info.append([
                day,
                {
                "1. open": round(float(daily_data["1. open"]), 2),
                "2. high": round(float(daily_data["2. high"]), 2),
                "3. low": round(float(daily_data["3. low"]), 2),
                "4. close": round(float(daily_data["4. close"]), 2),
                "5. volume": int(daily_data["5. volume"])
                }
            ])

        return jsonify(stock_info)
    else:
        return jsonify({"error": "Failed to retrieve stock information"}), response.status_code

if __name__ == '__main__':
    app.run(debug=True)
