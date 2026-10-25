import os
import sys
import time

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By


def main():
    base_url = os.getenv("SMOKE_BASE_URL", "http://localhost:8080").rstrip("/")
    options = Options()
    options.add_argument("--headless=new")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--window-size=1440,1000")

    driver = webdriver.Chrome(options=options)
    try:
        driver.get(f"{base_url}/")
        deadline = time.time() + 15
        while time.time() < deadline:
            if driver.find_elements(By.CSS_SELECTOR, "h1"):
                break
            time.sleep(0.25)

        heading = driver.find_element(By.CSS_SELECTOR, "h1").text
        if "Smart Dine" not in heading:
            raise AssertionError(f"Unexpected home-page heading: {heading!r}")

        print(f"Selenium smoke test passed: {heading}")
    finally:
        driver.quit()


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"Selenium smoke test failed: {exc}", file=sys.stderr)
        raise
