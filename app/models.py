from flask_sqlalchemy import SQLAlchemy
from app.app import app

app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://user:password@postgres-server:5432/test'
db = SQLAlchemy(app)