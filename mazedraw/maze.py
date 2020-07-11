
from PIL import Image, ImageDraw
import io
import math


def draw_maze(walls, w, h, size, show=False):
    img = Image.new("RGB", (w*size, h*size))
    draw = ImageDraw.Draw(img)

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
        print(f"{math.ceil(rowi+1/len(walls)*100)}% done")
    if show:
        img.show()

    img_bytes = io.BytesIO()
    img.save(img_bytes, format='PNG')

    return img_bytes
