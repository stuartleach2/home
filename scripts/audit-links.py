#!/usr/bin/env python3
"""Check local HTML links, stylesheets, scripts, and images resolve.

This intentionally avoids network requests. External URLs, mailto/tel links,
and same-page hash links are ignored so the script remains useful in GitHub
Pages-compatible static repositories.
"""

from __future__ import annotations

from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlparse
import sys

ROOT = Path(__file__).resolve().parents[1]
CHECKED_ATTRS = {
    "a": ("href",),
    "img": ("src",),
    "script": ("src",),
    "link": ("href",),
    "source": ("src", "srcset"),
}
IGNORED_SCHEMES = {"http", "https", "mailto", "tel", "data", "javascript"}


class LinkParser(HTMLParser):
    def __init__(self, html_file: Path) -> None:
        super().__init__()
        self.html_file = html_file
        self.references: list[tuple[int, str, str, str]] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        wanted = CHECKED_ATTRS.get(tag)
        if not wanted:
            return

        attrs_by_name = {name: value for name, value in attrs if value}
        for attr in wanted:
            value = attrs_by_name.get(attr)
            if not value:
                continue
            if attr == "srcset":
                for candidate in value.split(","):
                    url = candidate.strip().split()[0]
                    self.references.append((self.getpos()[0], tag, attr, url))
            else:
                self.references.append((self.getpos()[0], tag, attr, value))


def is_local_reference(value: str) -> bool:
    parsed = urlparse(value)
    if parsed.scheme.lower() in IGNORED_SCHEMES:
        return False
    if parsed.netloc:
        return False
    if not parsed.path and parsed.fragment:
        return False
    return bool(parsed.path)


def resolve_reference(html_file: Path, value: str) -> Path:
    parsed = urlparse(value)
    path = unquote(parsed.path)
    if path.startswith("/"):
        return ROOT / path.lstrip("/")
    return html_file.parent / path


def main() -> int:
    failures: list[str] = []
    html_files = sorted(ROOT.rglob("*.html"))

    for html_file in html_files:
        parser = LinkParser(html_file)
        parser.feed(html_file.read_text(encoding="utf-8", errors="ignore"))

        for line, tag, attr, value in parser.references:
            if not is_local_reference(value):
                continue
            target = resolve_reference(html_file, value)
            if not target.exists():
                rel_html = html_file.relative_to(ROOT)
                rel_target = target.relative_to(ROOT) if target.is_relative_to(ROOT) else target
                failures.append(
                    f"{rel_html}:{line}: missing {tag} {attr}={value!r} -> {rel_target}"
                )

    if failures:
        print("Missing local references found:")
        for failure in failures:
            print(f"- {failure}")
        return 1

    print(f"Checked {len(html_files)} HTML files; all local href/src references resolve.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
