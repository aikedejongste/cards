import json
import base64

def build():
    try:
        with open('questions.json', 'r') as f:
            data = f.read()
            # Minify JSON first
            minified = json.dumps(json.loads(data), separators=(',', ':'))
            # Base64 encode
            encoded = base64.b64encode(minified.encode('utf-8')).decode('utf-8')
            
        with open('questions.b64', 'w') as f:
            f.write(encoded)
            
        print("Successfully created questions.b64")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    build()
