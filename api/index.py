# api/index.py
from http.server import BaseHTTPRequestHandler
import json
import os
from openai import OpenAI

class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        response = {
            'status': 'Career Copilot API is running',
            'version': '1.0.0'
        }
        self.wfile.write(json.dumps(response).encode())

    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data.decode('utf-8'))
        
        path = self.path
        
        if path == '/api/chat':
            response = self.handle_chat(data)
        elif path == '/api/analyze-resume':
            response = self.handle_resume_analysis(data)
        elif path == '/api/search-jobs':
            response = self.handle_job_search(data)
        else:
            response = {'error': 'Endpoint not found'}
        
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(response).encode())
    
    def handle_chat(self, data):
        try:
            client = OpenAI(api_key=os.environ.get('OPENAI_API_KEY'))
            
            completion = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "user", "content": data.get('message', '')}
                ]
            )
            
            return {'response': completion.choices[0].message.content}
        except Exception as e:
            return {'error': str(e)}
    
    def handle_resume_analysis(self, data):
        # Add your resume analysis logic here
        return {
            'score': 85,
            'improvements': [
                'Add more quantifiable achievements',
                'Include relevant keywords'
            ],
            'strengths': [
                'Strong technical background',
                'Clear formatting'
            ]
        }
    
    def handle_job_search(self, data):
        # Add your job search logic here
        return {
            'jobs': [
                {
                    'id': 1,
                    'title': 'Senior Software Engineer',
                    'company': 'TechCorp',
                    'location': 'San Francisco, CA',
                    'salary': '$150,000 - $200,000'
                }
            ]
        }