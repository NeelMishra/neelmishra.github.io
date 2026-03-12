"""
Capture threaded_trees_collage.html as an animated GIF for LinkedIn.
Takes screenshots at intervals and stitches them into a looping GIF.
"""
import io
import os
from pathlib import Path
from playwright.sync_api import sync_playwright
from PIL import Image

COLLAGE_PATH = Path(__file__).parent / "threaded_trees_collage.html"
OUTPUT_GIF = Path(__file__).parent / "threaded_trees_collage.gif"
OUTPUT_PNG = Path(__file__).parent / "threaded_trees_collage.png"

FRAMES = 30
INTERVAL_MS = 350
GIF_FRAME_MS = 150
WIDTH = 1200
HEIGHT = 720

def main():
    file_url = COLLAGE_PATH.as_uri()
    print(f"Opening {file_url}")

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": WIDTH, "height": HEIGHT})
        page.goto(file_url)
        page.wait_for_timeout(2000)

        # Save a static PNG
        page.screenshot(path=str(OUTPUT_PNG), full_page=False)
        print(f"Static PNG saved: {OUTPUT_PNG}")

        # Capture frames - quantize each immediately to save memory
        frames = []
        for i in range(FRAMES):
            shot = page.screenshot(full_page=False)
            img = Image.open(io.BytesIO(shot)).convert("RGB")
            # Resize to half for manageable GIF size
            img = img.resize((WIDTH, HEIGHT), Image.LANCZOS)
            # Quantize to 256-color palette immediately
            img = img.quantize(colors=256, method=Image.Quantize.MEDIANCUT)
            frames.append(img)
            page.wait_for_timeout(INTERVAL_MS)
            print(f"  Frame {i+1}/{FRAMES}")

        browser.close()

    print("Building GIF...")
    frames[0].save(
        str(OUTPUT_GIF),
        save_all=True,
        append_images=frames[1:],
        duration=GIF_FRAME_MS,
        loop=0,
        optimize=True
    )

    size_mb = os.path.getsize(OUTPUT_GIF) / (1024 * 1024)
    print(f"GIF saved: {OUTPUT_GIF} ({size_mb:.1f} MB)")

if __name__ == "__main__":
    main()
