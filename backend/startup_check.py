import sys
import traceback

def main():
    try:
        from main import app
        print("SUCCESS")
        
        # Optionally, print the registered routes
        routes = [route.path for route in app.routes]
        print(f"Registered {len(routes)} routes.")
        if "/health" in routes:
            print("Found /health")
        else:
            print("Missing /health")
            
        sys.exit(0)
    except Exception as e:
        print("ERROR")
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
