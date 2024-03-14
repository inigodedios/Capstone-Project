from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Sequence
from sqlalchemy.schema import Identity

db = SQLAlchemy()

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'USERS'
    USERID = db.Column(db.Integer, primary_key=True)
    USERNAME = db.Column(db.String(255), nullable=False)
    PASSWORD = db.Column(db.String(255), nullable=False)
    # Relación con UserStock (esto asume que cada User puede tener muchas UserStocks)
    stocks = db.relationship('UserStock', backref='user', lazy=True)

class UserStock(db.Model):
    __tablename__ = 'USER_STOCKS'
    USERID = db.Column(db.Integer, db.ForeignKey('USERS.USERID'), primary_key=True)
    STOCKSYMBOL = db.Column(db.String(255), primary_key=True)
    QUANTITY = db.Column(db.Integer, nullable=False)

def add_stock(user_id, stock_symbol, quantity):
    user_stock = UserStock.query.filter_by(user_id=user_id, stock_symbol=stock_symbol).first()
    if user_stock:
        # Stock already exists, so we update the quantity.
        user_stock.quantity += quantity
    else:
        # Stock does not exist, so we add a new record.
        user_stock = UserStock(user_id=user_id, stock_symbol=stock_symbol, quantity=quantity)
        db.session.add(user_stock)
    db.session.commit()

def update_stock(user_id, stock_symbol, quantity):
    user_stock = UserStock.query.filter_by(user_id=user_id, stock_symbol=stock_symbol).first()
    if user_stock:
        user_stock.quantity = quantity
        db.session.commit()
    else:
        print("Stock does not exist for the user.")

def remove_stock(user_id, stock_symbol):
    UserStock.query.filter_by(user_id=user_id, stock_symbol=stock_symbol).delete()
    db.session.commit()
