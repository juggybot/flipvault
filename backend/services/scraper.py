import random
import requests
from bs4 import BeautifulSoup
from sqlalchemy.orm import Session
from ..database import SessionLocal, init_db
from ..crud import create_product, get_product, update_product
from ..models import Product
from urllib.parse import quote_plus
import schedule
import time
import os
from typing import Optional
import xml.etree.ElementTree as ET
import json
from dotenv import load_dotenv

class MarketplaceScraper:
    def __init__(self):
        load_dotenv()  # Load environment variables
        self.proxies = self.load_proxies()

    def load_proxies(self):
        try:
            # Get proxy credentials from environment variables
            username = os.getenv('PROXY_USERNAME')
            password = os.getenv('PROXY_PASSWORD')
            proxy_ip = os.getenv('PROXY_IP')
            proxy_port = os.getenv('PROXY_PORT')
            if not all([username, password, proxy_ip, proxy_port]):
                raise EnvironmentError("One or more proxy environment variables are missing.")

            # Create proxy string
            proxy = f"{username}:{password}:{proxy_ip}:{proxy_port}"
            print(f"Using proxy configuration (username:***:ip:port): {username}:***:{proxy_ip}:{proxy_port}")
            
            return [proxy]  # Return as list for compatibility with existing code
            
        except Exception as e:
            print(f"Error loading proxy configuration: {e}")
            # Return default proxy as fallback
            return ["default_username:default_password:default_ip:default_port"]

    def generate_url(self, keywords):
        encoded_keywords = quote_plus(keywords)
        ebay_url = f"https://www.ebay.com/sch/i.html?_from=R40&_nkw={encoded_keywords}&_sacat=0&LH_Sold=1&LH_Complete=1&_udlo=0&rt=nc"
        return ebay_url

    def fetch_page_content(self, url, retries=3, delay=7):
        if not self.proxies:
            raise ValueError("No proxies loaded. Please check your proxy file.")

        for attempt in range(1, retries + 1):
            proxy = random.choice(self.proxies)
            try:
                username, password, ip, port = proxy.split(':')
                formatted_proxy = f"http://{username}:{password}@{ip}:{port}/"
                proxies_dict = {"http": formatted_proxy, "https": formatted_proxy}
            except ValueError:
                print(f"Invalid proxy format: {proxy}. Expected 'username:password:ip:port'.")
                continue

            try:
                response = requests.get(url, proxies=proxies_dict, timeout=10)
                response.raise_for_status()
                return response.text
            except Exception as e:
                print(f"Attempt {attempt} failed for URL: {url} with error: {e}")
                if attempt < retries:
                    time.sleep(delay)
                else:
                    print(f"All {retries} attempts failed for URL: {url}")
                    return None

    def parse_ebay_results(self, html_content):
        soup = BeautifulSoup(html_content, 'html.parser')

        price_results = soup.find_all('div', {'class': 's-item__info clearfix'})  # Div with price info
        prices = []
        
        for item in price_results:
            price_text = item.find('span', {'class': 's-item__price'})  # Span with item price
            if price_text:
                price_str = price_text.text.replace('$', '').replace(',', '').strip()  # Clean price string
                try:
                    price = float(price_str)  # Convert to float
                    prices.append(price)  # Append prices to list
                except ValueError:
                    continue

        listing_results = soup.find_all('div', {'class': 'srp-controls__control srp-controls__count'})  # Div with listing info
        listings = []
        for listing in listing_results:
            listing_text = listing.find('h1', {'class': 'srp-controls__count-heading'})  # H1 with listing amount
            if listing_text:
                # Clean and truncate text at the first non-numeric character
                cleaned_text = listing_text.text.replace('results for', '').strip()
                cleaned_text = ''.join(char for char in cleaned_text if char.isdigit() or char == '+')
                listings.append(cleaned_text)

        return prices, listings

    def search_volume(self, keywords, country_code, retries=3, delay=5):
        if not self.proxies:
            raise ValueError("No proxies loaded. Please check your proxy file.")

        url = f'https://api.searchvolume.com/search_volume?country={country_code}&keywords={keywords}'

        for attempt in range(retries):
            proxy = random.choice(self.proxies)
            username, password, ip, port = proxy.split(':')
            formatted_proxies = {
                "http": f"http://{username}:{password}@{ip}:{port}/",
                "https": f"http://{username}:{password}@{ip}:{port}/"
            }

            try:
                response = requests.get(url, proxies=formatted_proxies, timeout=10)
                response.raise_for_status()
                data = response.json()
                if data:
                    key, value = list(data.items())[0]
                    volume = f'{value:,}'
                    return volume
            except Exception as e:
                print(f"Attempt {attempt + 1} failed: {e}")
                if attempt < retries - 1:
                    time.sleep(delay)
                else:
                    print("All retry attempts failed.")
                    return None

    def fetch_popular_keywords(self, base_keyword):
        url = f"https://clients1.google.com/complete/search?hl=en&output=toolbar&q={quote_plus(base_keyword)}"
        response = requests.get(url)
        
        if response.status_code == 200:
            try:
                root = ET.fromstring(response.text)
                suggestions = [suggestion.attrib['data'] for suggestion in root.findall(".//suggestion")]
                return json.dumps(suggestions)  # Always return a JSON string
            except ET.ParseError:
                print("Error parsing XML response")
        
        return json.dumps([])  # <- fixed here

    def scrape_products(self, product_list):
        results = {}
        db = SessionLocal()
        for product_id, product_name in product_list:
            ebay_url = self.generate_url(product_name)
            print(f"Scraping eBay URL: {ebay_url}")
            
            html_econtent = self.fetch_page_content(ebay_url)
            
            if html_econtent:
                ebay_prices, ebay_listings = self.parse_ebay_results(html_econtent)
                print(f"eBay prices: {ebay_prices}")
            else:
                ebay_prices, ebay_listings = [], []

            search_volume_us = self.search_volume(product_name, 'us')
            search_volume_au = self.search_volume(product_name, 'au')
            search_volume_uk = self.search_volume(product_name, 'gb')
            
            popular_keywords = self.fetch_popular_keywords(product_name)

            average_ebay_price = round(sum(ebay_prices) / len(ebay_prices), 2) if ebay_prices else 0
            sale_amount = round(sum(ebay_prices), 2)

            # Convert ebay_listings to an integer
            total_ebay_listings = 0
            for listing in ebay_listings:
                if listing.endswith('+'):
                    listing = listing[:-1]  # Remove the trailing '+'
                try:
                    total_ebay_listings += int(listing)
                except ValueError:
                    continue

            product_data = {
                'average_ebay_price': average_ebay_price,
                'ebay_listings': total_ebay_listings,
                'ebay_sale_amount': sale_amount,
                'search_volume_us': search_volume_us if search_volume_us else '0',
                'search_volume_au': search_volume_au if search_volume_au else '0',
                'search_volume_uk': search_volume_uk if search_volume_uk else '0',
                'popular_keywords': popular_keywords,
                'last_updated': time.strftime('%Y-%m-%d')
            }
            print(f"Updating product ID '{product_id}' with data: {product_data}")
            existing_product = get_product(db, product_id)
            if existing_product:
                print(f"Calling update_product for product ID '{product_id}' with data: {product_data}")
                update_product(db, product_id, product_data)
                print(f"Committing changes for product ID '{product_id}'")
                db.commit()  # Commit the session to save changes
                db.refresh(existing_product)  # Refresh the instance with the latest data from the database
                print(f"Updated product data: {existing_product.__dict__}")
            else:
                print(f"Product ID '{product_id}' not found in the database. Skipping creation.")
            results[product_id] = product_data
        db.close()
        return results

def run_scraper(product_id: Optional[int] = None):
    if product_id:
        print(f"Running scraper for product ID: {product_id}")
        try:
            db = SessionLocal()
            product = db.query(Product).filter(Product.id == product_id).first()
            db.close()
            if product:
                scraper = MarketplaceScraper()
                results = scraper.scrape_products([(product.id, product.name)])
                print("Scraping completed. Results:", results)
                return results
            else:
                print(f"Product ID '{product_id}' not found in the database.")
                return None
        except Exception as e:
            print(f"Error in run_scraper: {e}")
            raise
    else:
        print("Running scraper for all products")
        try:
            db = SessionLocal()
            product_list = [(product.id, product.name) for product in db.query(Product).all()]
            db.close()
            scraper = MarketplaceScraper()
            results = scraper.scrape_products(product_list)
            print("Scraping completed. Results:", results)
            return results
        except Exception as e:
            print(f"Error in run_scraper: {e}")
            raise

if __name__ == "__main__":
    run_scraper()  # Force run the scraper initially
    schedule.every().hour.do(run_scraper)
    while True:
        schedule.run_pending()
        time.sleep(1)