import http.server
import os

os.chdir('/Users/ipatate/Documents/dev/2025/portfolio')

handler = http.server.SimpleHTTPRequestHandler
with http.server.HTTPServer(('', 3000), handler) as httpd:
    httpd.serve_forever()
