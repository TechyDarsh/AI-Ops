import http.server
import socketserver
import os

PORT = 6000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        # Default root requests to server6000.html
        if self.path == '/' or self.path == '/index.html':
            self.path = '/server6000.html'
        return super().do_GET()

print(f"=======================================================")
print(f"  AI-OPS ALERT CONSOLE RUNNING ON PORT {PORT}")
print(f"  Open in your browser: http://localhost:{PORT}")
print(f"=======================================================")

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server.")
        httpd.server_close()
