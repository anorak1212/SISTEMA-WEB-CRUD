from flask_cors import CORS
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
import uuid
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get(
    'DATABASE_URL',
    'postgresql://admin:secretpassword@localhost:5432/store_db'
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# ─────────────────────────────────────────────
#  MODELOS
# ─────────────────────────────────────────────

class Article(db.Model):
    __tablename__ = 'articles'

    id          = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name        = db.Column(db.String(100), nullable=False)
    price       = db.Column(db.Float, nullable=False)
    description = db.Column(db.String(255))
    stock       = db.Column(db.Integer, default=0)
    created_at  = db.Column(db.DateTime, default=datetime.utcnow)
    sales       = db.relationship('Sale', backref='article', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'price': self.price,
            'description': self.description,
            'stock': self.stock,
            'created_at': self.created_at.isoformat()
        }


class Client(db.Model):
    __tablename__ = 'clients'

    id           = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name         = db.Column(db.String(100), nullable=False)
    email        = db.Column(db.String(120), unique=True, nullable=False)
    phone        = db.Column(db.String(20))
    registered_at = db.Column(db.DateTime, default=datetime.utcnow)
    sales        = db.relationship('Sale', backref='client', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'registered_at': self.registered_at.isoformat()
        }


class Sale(db.Model):
    __tablename__ = 'sales'

    id         = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    client_id  = db.Column(db.String(36), db.ForeignKey('clients.id'), nullable=False)
    article_id = db.Column(db.String(36), db.ForeignKey('articles.id'), nullable=False)
    quantity   = db.Column(db.Integer, nullable=False, default=1)
    total      = db.Column(db.Float, nullable=False)
    date       = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'client_id': self.client_id,
            'client_name': self.client.name if self.client else '',
            'article_id': self.article_id,
            'article_name': self.article.name if self.article else '',
            'article_price': self.article.price if self.article else 0,
            'quantity': self.quantity,
            'total': self.total,
            'date': self.date.isoformat()
        }


with app.app_context():
    db.create_all()


# ─────────────────────────────────────────────
#  RUTAS — ARTÍCULOS
# ─────────────────────────────────────────────

@app.route('/articles', methods=['POST'])
def create_article():
    data = request.get_json()
    article = Article(
        name=data['name'],
        price=data['price'],
        description=data.get('description', ''),
        stock=data.get('stock', 0)
    )
    db.session.add(article)
    db.session.commit()
    return jsonify(article.to_dict()), 201


@app.route('/articles', methods=['GET'])
def get_articles():
    articles = Article.query.all()
    return jsonify([a.to_dict() for a in articles]), 200


@app.route('/articles/<id>', methods=['GET'])
def get_article(id):
    article = Article.query.get_or_404(id)
    return jsonify(article.to_dict()), 200


@app.route('/articles/<id>', methods=['PUT'])
def update_article(id):
    article = Article.query.get_or_404(id)
    data = request.get_json()
    article.name        = data.get('name', article.name)
    article.price       = data.get('price', article.price)
    article.description = data.get('description', article.description)
    article.stock       = data.get('stock', article.stock)
    db.session.commit()
    return jsonify(article.to_dict()), 200


@app.route('/articles/<id>', methods=['DELETE'])
def delete_article(id):
    article = Article.query.get_or_404(id)
    db.session.delete(article)
    db.session.commit()
    return '', 204


# ─────────────────────────────────────────────
#  RUTAS — CLIENTES
# ─────────────────────────────────────────────

@app.route('/clients', methods=['POST'])
def create_client():
    data = request.get_json()
    if Client.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'El correo ya está registrado'}), 400
    client = Client(
        name=data['name'],
        email=data['email'],
        phone=data.get('phone', '')
    )
    db.session.add(client)
    db.session.commit()
    return jsonify(client.to_dict()), 201


@app.route('/clients', methods=['GET'])
def get_clients():
    clients = Client.query.all()
    return jsonify([c.to_dict() for c in clients]), 200


@app.route('/clients/<id>', methods=['GET'])
def get_client(id):
    client = Client.query.get_or_404(id)
    return jsonify(client.to_dict()), 200


@app.route('/clients/<id>', methods=['PUT'])
def update_client(id):
    client = Client.query.get_or_404(id)
    data = request.get_json()
    client.name  = data.get('name', client.name)
    client.email = data.get('email', client.email)
    client.phone = data.get('phone', client.phone)
    db.session.commit()
    return jsonify(client.to_dict()), 200


@app.route('/clients/<id>', methods=['DELETE'])
def delete_client(id):
    client = Client.query.get_or_404(id)
    db.session.delete(client)
    db.session.commit()
    return '', 204


# ─────────────────────────────────────────────
#  RUTAS — VENTAS
# ─────────────────────────────────────────────

@app.route('/sales', methods=['POST'])
def create_sale():
    data = request.get_json()
    article = Article.query.get_or_404(data['article_id'])
    quantity = int(data.get('quantity', 1))

    if article.stock < quantity:
        return jsonify({'error': 'Stock insuficiente'}), 400

    sale = Sale(
        client_id=data['client_id'],
        article_id=data['article_id'],
        quantity=quantity,
        total=round(article.price * quantity, 2)
    )
    article.stock -= quantity
    db.session.add(sale)
    db.session.commit()
    return jsonify(sale.to_dict()), 201


@app.route('/sales', methods=['GET'])
def get_sales():
    sales = Sale.query.order_by(Sale.date.desc()).all()
    return jsonify([s.to_dict() for s in sales]), 200


@app.route('/sales/<id>', methods=['GET'])
def get_sale(id):
    sale = Sale.query.get_or_404(id)
    return jsonify(sale.to_dict()), 200


@app.route('/sales/<id>', methods=['DELETE'])
def delete_sale(id):
    sale = Sale.query.get_or_404(id)
    # Devolver stock al artículo
    article = Article.query.get(sale.article_id)
    if article:
        article.stock += sale.quantity
    db.session.delete(sale)
    db.session.commit()
    return '', 204


# ─────────────────────────────────────────────
#  REPORTE — clientes dados de alta y sus compras
# ─────────────────────────────────────────────

@app.route('/report', methods=['GET'])
def report():
    clients = Client.query.order_by(Client.registered_at.desc()).all()
    result = []
    for c in clients:
        purchases = []
        total_spent = 0
        for s in c.sales:
            purchases.append({
                'article': s.article.name if s.article else 'N/A',
                'quantity': s.quantity,
                'total': s.total,
                'date': s.date.isoformat()
            })
            total_spent += s.total
        result.append({
            'id': c.id,
            'name': c.name,
            'email': c.email,
            'phone': c.phone,
            'registered_at': c.registered_at.isoformat(),
            'total_purchases': len(purchases),
            'total_spent': round(total_spent, 2),
            'purchases': purchases
        })
    return jsonify(result), 200


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)