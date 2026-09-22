#!/usr/bin/env python3
"""
Tiny server for the AI Survey demo.

  python3 serve.py            (from anywhere; it serves its own folder)

Serves the site and stores survey answers in data/responses.json.
Students on the same Wi-Fi open  http://<this laptop's IP>:8975

  GET    /api/responses   -> all responses (JSON list)
  POST   /api/responses   -> add one response (JSON object)
  DELETE /api/responses   -> clear everything (the "Clear all" button)
"""
import json, os, socket, sys, threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

HERE = os.path.dirname(os.path.abspath(__file__))
os.chdir(HERE)
DATA = os.path.join(HERE, "data", "responses.json")
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8975
lock = threading.Lock()


def load():
    try:
        with open(DATA, encoding="utf-8") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return []


def save(rows):
    os.makedirs(os.path.dirname(DATA), exist_ok=True)
    with open(DATA, "w", encoding="utf-8") as f:
        json.dump(rows, f, indent=1)


class Handler(SimpleHTTPRequestHandler):
    def _json(self, obj, status=200):
        body = json.dumps(obj).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path.split("?")[0] == "/api/responses":
            with lock:
                return self._json(load())
        return super().do_GET()

    def do_POST(self):
        if self.path != "/api/responses":
            return self._json({"error": "not found"}, 404)
        n = int(self.headers.get("Content-Length", 0))
        try:
            row = json.loads(self.rfile.read(n) or b"{}")
        except json.JSONDecodeError:
            return self._json({"error": "bad json"}, 400)
        if not isinstance(row, dict):
            return self._json({"error": "expected an object"}, 400)
        with lock:
            rows = load()
            rows.append(row)
            save(rows)
        self._json({"ok": True, "count": len(rows)})

    def do_DELETE(self):
        if self.path != "/api/responses":
            return self._json({"error": "not found"}, 404)
        with lock:
            save([])
        self._json({"ok": True, "count": 0})

    def end_headers(self):
        # Never let a phone hold an old copy of the page mid-class. A
        # stale index.html paired with a fresh script is how you get
        # errors that make no sense against the code on disk, so this
        # is "no-store", not the weaker "no-cache".
        if not self.path.startswith("/api/"):
            self.send_header("Cache-Control", "no-store, must-revalidate")
        super().end_headers()

    def log_message(self, fmt, *args):
        if "/api/" in (args[0] if args else ""):
            super().log_message(fmt, *args)


def lan_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("8.8.8.8", 80))
        return s.getsockname()[0]
    except OSError:
        return "127.0.0.1"
    finally:
        s.close()


if __name__ == "__main__":
    srv = ThreadingHTTPServer(("0.0.0.0", PORT), Handler)
    print(f"AI Survey demo running.")
    print(f"  You:       http://localhost:{PORT}")
    print(f"  Students:  http://{lan_ip()}:{PORT}   (same Wi-Fi)")
    print(f"  Answers saved to {DATA}")
    print("  Ctrl-C to stop.")
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        pass
