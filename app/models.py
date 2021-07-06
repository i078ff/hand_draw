from flask_sqlalchemy import SQLAlchemy
from app.app import app

app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://user:passward@postgres-server:5432/tutorial_blog'
db = SQLAlchemy(app)