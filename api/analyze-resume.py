from http.server import BaseHTTPRequestHandler
import json
import os

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        # Resume analysis logic
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        response = {
            'score': 85,
            'improvements': ['Add keywords', 'Quantify achievements'],
            'strengths': ['Clear format', 'Good experience']
        }
        
        self.wfile.write(json.dumps(response).encode())