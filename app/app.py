from datetime import datetime
from flask import Flask, render_template, request, redirect, session

app = Flask(__name__)
app.secret_key = "user"
from app.models import db, DB


db.create_all()


@app.route("/login")
def login():
    return render_template("login_form.html")


@app.route("/temp")
def temp():
    return render_template("temp.html")


@app.route("/home", methods=["GET"])
def home():
    user = "def"  # session.get("user")
    return redirect("/home/" + str(user))


@app.route("/home/<user_id>")
def home_id(user_id):
    data = DB.query.filter_by(user_id=user_id).all()
    return render_template("home.html", user=data)


@app.route("/draw", methods=["POST"])
def draw():
    user = "def"  # session.get("user")
    picture = request.form["name"]
    if picture == "0":
        new = DB(user_id=user, created_at=datetime.now())
        db.session.add(new)
        db.session.commit()
    return render_template("draw.html", picture_id=picture)


@app.route("/help")
def help():
    return render_template("help.html")


@app.errorhandler(404)
def page_not_found(error):
    return redirect("login")
