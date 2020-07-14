import signal
import sys
import select
import json
import socket
import math

from .maze import draw_maze


def get_config():
    '''
    Read and return the maze configuration
    '''

    with open("mazeconfig.json") as mazeconfig:
        return json.load(mazeconfig)


def process(message):
    '''
    Process message and return the results
    '''

    config = get_config()
    size = config["cellsize"]
    show_image = config["showImage"]

    return draw_maze(message["maze"], message["width"], message["height"], size, show=show_image)


def recv_all(conn):
    '''
    Read all bytes in chunks from conn
    '''

    acc = b''
    while True:
        data = conn.recv(1024)
        if not data:
            break
        acc += data
    return acc.decode("utf-8")


def serve():
    '''
    Serve maze generation requests on loop
    '''
    config = get_config()

    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        s.bind(("localhost", config["port"]))
        s.listen()

        print(
            f"Serving on http://localhost:{config['port']} until Ctrl+C is pressed...")
        try:
            while True:
                conn, addr = s.accept()
                print("Request from", addr)
                with conn:
                    message = recv_all(conn)
                    maze_info = json.loads(message)

                    img = process(maze_info)
                    conn.send(img.getvalue())
                conn.close()
        finally:
            conn.close()


serve()
