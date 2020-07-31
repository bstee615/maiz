import signal
import sys
import select
import json
import socket
import math
import os

from .maze import draw_maze


def process(message):
    '''
    Process message and return the results
    '''

    return draw_maze(message, False)


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
    if 'PYTHON_ENV' in os.environ and os.environ['PYTHON_ENV'] == 'prod':
        host = "0.0.0.0"
        port = 80
    else:
        host = "127.0.0.1"
        port = 3000

    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(1.0)
        s.bind((host, port))
        s.listen()

        print(f"Serving on http://{host}:{port}")
        print("Press Ctrl+C to exit...")

        run_safely(s)

        print("Exiting....")


serve()
