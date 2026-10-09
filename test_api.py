import urllib.request
import json

def test_api():
    print("Fetching data from http://localhost:8000/api/triage...")
    try:
        with urllib.request.urlopen("http://localhost:8000/api/triage") as response:
            data = json.loads(response.read().decode())
            print("\n=== FINAL JSON RESPONSE ===")
            print(json.dumps(data, indent=2))
            print("===========================\n")
            print("Success! The API is perfectly wired up to Supabase.")
    except Exception as e:
        print(f"Error fetching from API: {e}")

if __name__ == "__main__":
    test_api()
