# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import openai
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Verify API key is loaded
api_key = os.getenv('OPENAI_API_KEY')
if not api_key:
    print('ERROR: OPENAI_API_KEY is not set in .env file')
    print('Please create a .env file with your OpenAI API key')
    exit(1)

# Set up OpenAI
openai.api_key = api_key

# Test endpoint
@app.route('/api/test')
def test():
    return jsonify({'status': 'Server is running'})

# Chat endpoint
@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        message = data.get('message', '')
        print(f'Received message: {message}')
        
        # Create chat completion using the OpenAI client
        from openai import OpenAI
        client = OpenAI(api_key=api_key)
        
        completion = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "user", "content": message}
            ]
        )
        
        response_content = completion.choices[0].message.content
        print(f'OpenAI response: {response_content}')
        
        return jsonify({'response': response_content})
        
    except openai.APIError as e:
        print(f'OpenAI API Error: {str(e)}')
        return jsonify({
            'error': f'OpenAI API Error: {str(e)}',
            'details': 'Check your API key and billing status'
        }), 500
    except Exception as e:
        print(f'Error: {str(e)}')
        return jsonify({
            'error': str(e),
            'details': 'Check server logs for more information'
        }), 500

if __name__ == '__main__':
    PORT = int(os.getenv('PORT', 5001))
    print(f'Server starting on port {PORT}')
    print(f'Test the server: http://localhost:{PORT}/api/test')
    print(f'Using OpenAI API key: {api_key[:8]}...' if api_key else 'No API key found')
    app.run(debug=True, port=PORT, host='0.0.0.0')