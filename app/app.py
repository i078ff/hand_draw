from flask import Flask
app = Flask(__name__)
from app.models import db
db.create_all()
db.session.commit()

@app.route('/')
def index():
    return 'success'