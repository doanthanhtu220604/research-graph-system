import urllib.request

url = "https://chuyengia.ntu.edu.vn/chuyengia/timkiem/PersonelInfo/305"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
import ssl
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

with urllib.request.urlopen(req, context=ctx) as response:
    html = response.read().decode('utf-8')

with open("profile.html", "w", encoding="utf-8") as f:
    f.write(html)
print("Saved profile.html")
