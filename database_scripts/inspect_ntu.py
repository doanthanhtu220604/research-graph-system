import requests
from bs4 import BeautifulSoup
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

url = "https://chuyengia.ntu.edu.vn/chuyengia/timkiem/index/DV_13"
response = requests.get(url, verify=False)
response.encoding = 'utf-8'

soup = BeautifulSoup(response.text, 'html.parser')

for img in soup.find_all('img'):
    src = img.get('src', '')
    if 'PersonelImage' in src:
        # found an image, let's print its parent container's html
        parent = img.parent.parent.parent
        print(parent.prettify().encode('ascii', 'ignore').decode('ascii'))
        break
