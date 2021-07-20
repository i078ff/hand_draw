from flask_sqlalchemy import SQLAlchemy
from app.app import app

app.config[
    "SQLALCHEMY_DATABASE_URI"
] = "sqlite:///test.db"  # postgresql://user:password@postgres-server:5432/test"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)


class DB(db.Model):
    file_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(20), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False)
