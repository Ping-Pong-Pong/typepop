#!/bin/bash
# Re-applies PWA tags + assets to dist/ after `npx expo export --platform web`.
# Run this before every gh-pages deploy so Add-to-Home-Screen stays fullscreen.
set -e
cd "$(dirname "$0")/.."
python3 <<'PYEOF'
import shutil
html_path = "dist/index.html"
html = open(html_path).read()
tags = """    <link rel="manifest" href="/typepop/manifest.webmanifest" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="TypePop Pals" />
    <meta name="theme-color" content="#D9794B" />
    <link rel="apple-touch-icon" href="/typepop/apple-touch-icon.png" />
    <link rel="icon" type="image/png" sizes="192x192" href="/typepop/icon-192.png" />
"""
anchor = '    <title>TypePop Pals</title>\n'
if 'apple-mobile-web-app-capable' not in html:
    html = html.replace(anchor, anchor + tags)
    open(html_path, "w").write(html)
    print("index.html injected")
for f in ["apple-touch-icon.png", "icon-192.png", "icon-512.png", "manifest.webmanifest"]:
    shutil.copy(f"dist-pwa/{f}", f"dist/{f}")
print("pwa assets copied")
PYEOF
