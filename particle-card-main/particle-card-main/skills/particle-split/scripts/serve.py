#!/usr/bin/env python3
from __future__ import annotations

import argparse
import http.server
import os
import socketserver
import sys
import webbrowser
from pathlib import Path


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Serve the current project so you can preview particle.html in a browser.",
    )
    parser.add_argument("--host", default="127.0.0.1", help="Bind host (default: 127.0.0.1)")
    parser.add_argument("--port", type=int, default=8000, help="Bind port (default: 8000)")
    parser.add_argument(
        "--dir",
        default=os.getcwd(),
        help="Directory to serve (default: current working directory)",
    )
    parser.add_argument("--file", default="particle.html", help="File to open (default: particle.html)")
    parser.add_argument("--open", action="store_true", help="Open the preview URL in the default browser")
    return parser.parse_args(argv)


def main(argv: list[str]) -> int:
    args = parse_args(argv)
    serve_dir = Path(args.dir).resolve()
    if not serve_dir.exists() or not serve_dir.is_dir():
        print(f"[error] --dir must be an existing directory: {serve_dir}", file=sys.stderr)
        return 2

    os.chdir(serve_dir)
    handler = http.server.SimpleHTTPRequestHandler

    url = f"http://{args.host}:{args.port}/{args.file.lstrip('/')}"
    print(f"[ok] Serving: {serve_dir}")
    print(f"[ok] URL: {url}")

    if args.open:
        try:
            webbrowser.open(url)
        except Exception as exc:  # pragma: no cover
            print(f"[warn] Failed to open browser: {exc}", file=sys.stderr)

    with socketserver.ThreadingTCPServer((args.host, args.port), handler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
