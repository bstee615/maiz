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

    return draw_maze(message["walls"], message["startingPoint"], message["width"], message["height"], size, show=show_image)


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


def service_request(sock):
    conn = None
    try:
        conn, addr = sock.accept()
        print("Request from", addr)
        with conn:
            message = recv_all(conn)
            maze_info = json.loads(message)

            img = process(maze_info)
            conn.send(img.getvalue())
    finally:
        if conn:
            conn.close()


def run_safely(sock):
    '''
    Run server and handle exceptions
    '''

    running = True

    while running:
        try:
            service_request(sock)
        except socket.timeout:
            pass
        except (SystemExit, KeyboardInterrupt):
            running = False
            break
        except Exception as ex:
            print("Fatal Error!")
            print(str(ex))
            raise


def serve():
    '''
    Serve maze generation requests on loop
    '''
    config = get_config()

    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(1.0)
        s.bind(("localhost", config["port"]))
        s.listen()

        print(f"Serving on http://localhost:{config['port']}")
        print("Press Ctrl+C to exit...")

        run_safely(s)

        print("Exiting....")


serve()
