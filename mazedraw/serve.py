import signal
import sys
import select
import json
import socket
import math
import os
import flask
from flask import send_file

from .maze import draw_maze

app = flask.Flask(__name__)


@app.route("/", methods=["POST"])
def starting_url():
    maze_info = flask.request.json
    img_b64 = draw_maze(maze_info, False)
    print("replying", img_b64)
    return img_b64


if 'PYTHON_ENV' in os.environ and os.environ['PYTHON_ENV'] == 'prod':
    host = "0.0.0.0"
    port = 80
else:
    host = "127.0.0.1"
    port = 3000

app.run(host, port)
