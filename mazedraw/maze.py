
from PIL import Image, ImageDraw
import io
import math


def draw_maze(message, show=True):
    walls = message["walls"]
    start = message["startingPoint"]
    ends = message["ends"]
    w = message["width"]
    h = message["height"]
    size = message["cellSize"]

    img = Image.new("RGB", (w*size, h*size))
    draw = ImageDraw.Draw(img)

    # Draw an X at the start
    # print(start)
    draw.rectangle([((start["col"])*size, (start["row"])*size),
                    ((start["col"]+1)*size, (start["row"]+1)*size)], fill="green", width=3)

    for obj in ends:
        point = obj["point"]
        draw.rectangle([((point["col"])*size, (point["row"])*size),
                        ((point["col"]+1)*size, (point["row"]+1)*size)], fill="blue", width=3)

    for rowi, row in enumerate(walls):
        for coli, col in enumerate(row):
            for conn in col:
                dr, dc = conn["row"] - rowi, conn["col"] - coli

                if dr != 0:
                    x = coli * size
                    y = ((.5 + rowi + (.5 * dr)) * size)
                    tx = (coli+1) * size
                    draw.line([(x, y), (tx, y)])

                elif dc != 0:
                    x = ((.5 + coli + (.5 * dc)) * size)
                    y = rowi * size
                    ty = (rowi+1) * size
                    draw.line([(x, y), (x, ty)])

                else:
                    print("Bang Ding Ow")
        print(f"{math.ceil(((rowi+1)/len(walls))*100)}% done")
    if show:
        img.show()

    img_bytes = io.BytesIO()
    img.save(img_bytes, format='PNG')

    return img_bytes
