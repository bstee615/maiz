
from PIL import Image, ImageDraw


def draw_maze(walls, w, h, size, show=True):
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
    if show:
        img.show()
