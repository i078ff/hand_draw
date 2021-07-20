from flask import Flask, render_template

app = Flask(__name__)
from app.models import db


db.create_all()
db.session.commit()


@app.route("/login")
def login():
    return render_template("login_form.html")


@app.route("/home")
def home():
    return render_template("home.html")


@app.route("/draw")
def draw():
    return render_template("draw.html", picture_id=111)  # 仮の数字を入れてるので消してOKです


@app.route("/help")
def help():
    return render_template("help.html")
