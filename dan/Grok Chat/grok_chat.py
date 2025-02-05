#!/usr/bin/env python3
import os
import requests
import json

def get_available_models(api_key):
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.get(
            "https://api.x.ai/v1/models",
            headers=headers
        )
        if response.status_code == 200:
            models = response.json()
            print("\nAvailable models:")
            for model in models.get('data', []):
                print(f"- {model['id']}")
            return models.get('data', [])
        else:
            print(f'\033[91mError getting models ({response.status_code}):\033[0m {response.text}')
            return []
    except Exception as e:
        print(f'\033[91mError:\033[0m {str(e)}')
        return []

class PerplexityChat:
    def __init__(self):
        self.api_key = os.getenv('PERPLEXITY_API_KEY')
        if not self.api_key:
            raise ValueError('PERPLEXITY_API_KEY not found in environment variables')
        
    def generate_response(self, prompt, model='pplx-7b-chat'):
        headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json'
        }
        data = {
            'model': model,
            'messages': [{'role': 'user', 'content': prompt}]
        }
        
        try:
            response = requests.post(
                'https://api.perplexity.ai/chat/completions',
                headers=headers,
                json=data
            )
            response.raise_for_status()
            return response.json()['choices'][0]['message']['content']
        except requests.exceptions.RequestException as e:
            return f"API Error: {str(e)}"

def main():
    api_key = os.getenv('GROK_API_KEY')
    if not api_key:
        print('\033[91mERROR:\033[0m GROK_API_KEY environment variable not set')
        print('Set it first with:\n')
        print('   export GROK_API_KEY="your-api-key"\n')
        return

    # Get available models first
    models = get_available_models(api_key)
    if not models:
        print("Could not retrieve available models. Please check your API key.")
        return
    
    # Use grok-beta model
    model_id = "grok-beta"

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    print('\033[1mGrok Chat Terminal\033[0m (type \'exit\' to quit)\n')
    print(f'Using model: {model_id}\n')
    
    while True:
        try:
            user_input = input('\033[94mYou:\033[0m ')
            if user_input.lower() in ('exit', 'quit'):
                break

            payload = {
                "messages": [{
                    "role": "user",
                    "content": user_input
                }],
                "model": model_id,
                "temperature": 0.7,
                "stream": False
            }

            response = requests.post(
                "https://api.x.ai/v1/chat/completions",
                headers=headers,
                json=payload
            )

            if response.status_code == 200:
                reply = response.json()['choices'][0]['message']['content']
                print(f'\n\033[92mGrok:\033[0m {reply}\n')
            else:
                print(f'\033[91mAPI Error ({response.status_code}):\033[0m {response.text}')

        except KeyboardInterrupt:
            print('\n\033[93mExiting chat...\033[0m')
            break
        except Exception as e:
            print(f'\033[91mError:\033[0m {str(e)}')

if __name__ == "__main__":
    main()
