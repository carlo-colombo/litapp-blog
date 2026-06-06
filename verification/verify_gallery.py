import asyncio
from playwright.async_api import async_playwright
import os
import subprocess
import time

async def verify():
    # Kill any existing processes
    subprocess.run("kill $(lsof -t -i :8080) 2>/dev/null || true", shell=True)
    subprocess.run("kill $(lsof -t -i :9021) 2>/dev/null || true", shell=True)

    # Start the server
    env = os.environ.copy()
    env["TIDDLYWIKI_PLUGIN_PATH"] = "./plugins"
    server = subprocess.Popen(["yarn", "dev"], env=env)
    time.sleep(8)  # Give it more time to start

    async with async_playwright() as p:
        browser = await p.chromium.launch()

        # Mobile view (iPhone 12/13 Mini style)
        context = await browser.new_context(viewport={'width': 375, 'height': 812})
        page = await context.new_page()

        # Gallery entry - using a long title one to see the wrapping and space
        url = "http://localhost:9021/Laghetto%20Villa%20Reale,%20Monza%20%23duck%20%23microfourthirds%20%23monza%20%23gloomy%20%23lake%20%23foggymorning.html"
        await page.goto(url)
        # Wait for any lazy loading
        await page.wait_for_timeout(2000)
        await page.screenshot(path="verification/screenshots/update_mobile.png")

        # Desktop view for comparison
        context_desktop = await browser.new_context(viewport={'width': 1280, 'height': 800})
        page_desktop = await context_desktop.new_page()
        await page_desktop.goto(url)
        await page_desktop.wait_for_timeout(2000)
        await page_desktop.screenshot(path="verification/screenshots/update_desktop.png")

        await browser.close()

    server.terminate()

if __name__ == "__main__":
    asyncio.run(verify())
