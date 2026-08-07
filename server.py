from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
import argparse, json, os, socket, threading, webbrowser
from pathlib import Path

ROOT = Path(__file__).resolve().parent
os.chdir(ROOT)

class Handler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('X-Content-Type-Options','nosniff')
        self.send_header('Referrer-Policy','same-origin')
        super().end_headers()
    def do_GET(self):
        if self.path.split('?',1)[0] == '/health':
            body=json.dumps({'ok':True,'app':'AR7 Gestão da Oficina','version':'19.0.0'}).encode('utf-8')
            self.send_response(200); self.send_header('Content-Type','application/json; charset=utf-8'); self.send_header('Content-Length',str(len(body))); self.end_headers(); self.wfile.write(body); return
        return super().do_GET()
    def log_message(self, fmt, *args):
        print('[AR7]', fmt % args)

def port_available(host, port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        try:
            sock.bind((host, port)); return True
        except OSError:
            return False

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('port', nargs='?', type=int, default=8108)
    parser.add_argument('--auto-port', action='store_true')
    parser.add_argument('--open', action='store_true')
    args=parser.parse_args()
    env_port=os.getenv('PORT')
    railway=bool(env_port or os.getenv('RAILWAY_ENVIRONMENT') or os.getenv('RAILWAY_PROJECT_ID'))
    port=int(env_port) if env_port else args.port
    host='0.0.0.0' if railway else '127.0.0.1'
    if args.auto_port and not railway:
        while port <= 8199 and not port_available(host,port): port += 1
        if port > 8199: raise SystemExit('Nenhuma porta livre encontrada entre 8108 e 8199.')
    server=ThreadingHTTPServer((host,port),Handler)
    url=f'http://localhost:{port}/#dashboard'
    print('==============================================================')
    print(' AR7 Gestao da Oficina V19')
    print(f' Servidor: {host}:{port}')
    print(f' Acesso local: {url}')
    print('==============================================================')
    if args.open and not railway: threading.Timer(.4,lambda:webbrowser.open(url)).start()
    try: server.serve_forever()
    except KeyboardInterrupt: pass
    finally: server.server_close()

if __name__=='__main__': main()
