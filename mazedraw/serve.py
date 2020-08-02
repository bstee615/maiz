import signal
import sys
import select
import json
import socket
import math
import os
import flask
from flask import send_file
import logging

from .maze import draw_maze

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.StreamHandler(flask.logging.wsgi_errors_stream)
    ]
)

app = flask.Flask(__name__)


@app.route("/", methods=["POST"])
def starting_url():
    maze_info = flask.request.json
    logging.debug("got maze info", maze_info)
    img_b64 = draw_maze(maze_info, False)
    logging.debug("sending reply", img_b64)
    return img_b64


if 'PYTHON_ENV' in os.environ and os.environ['PYTHON_ENV'] == 'prod':
    host = "0.0.0.0"
    port = 80
else:
    host = "127.0.0.1"
    port = 3000

app.run(host, port)
