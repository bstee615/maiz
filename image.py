import json
import socket
import math
from PIL import Image, ImageDraw

with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
    s.bind(("localhost", 2000))
    s.listen()
    conn, addr = s.accept()
    with conn:
        acc = b''
        while True:
            data = conn.recv(1024)
            if not data:
                break
            acc += data
        walls = json.loads(acc.decode("utf-8"))
        w = 6
        h = 10
        size = 100

        # creating new Image object
        img = Image.new("RGB", (w*size, h*size))

        # create rectangle image
        draw = ImageDraw.Draw(img)
        # draw.line([(20, 30), (50, 60)])

        # img.show()

        for ir, row in enumerate(walls):
            for ic, cell in enumerate(row):
                for conn in cell:
                    dr, dc = conn["row"] - ir, conn["col"] - ic
                    print(ir, ic, conn["row"], conn["col"], dr, dc)
                    if dr != 0:
                        x = ic * size
                        y = ((.5 + ir + (.5 * dr)) * size)
                        tx = (ic+1) * size
                        draw.line([(x, y), (tx, y)])
                        print("row", x, y, tx)
                    if dc != 0:
                        x = ((.5 + ic + (.5 * dc)) * size)
                        y = ir * size
                        ty = (ir+1) * size
                        draw.line([(x, y), (x, ty)])
                        print("col", x, y, ty)

        img.save("img1.png", "PNG")
