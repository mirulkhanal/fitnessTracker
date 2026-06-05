#!/usr/bin/env python3
"""Resolve next semver tag and write release-notes.md for GitHub Releases."""
from __future__ import annotations

import os
import re
import subprocess
import sys
from pathlib import Path


def run(cmd: str) -> str:
    return subprocess.check_output(cmd, shell=True, text=True).strip()


def main() -> int:
    root = Path(__file__).resolve().parent.parent
    os.chdir(root)

    variant = os.environ.get("RELEASE_VARIANT", "local")
    sha = os.environ.get("GITHUB_SHA", run("git rev-parse HEAD"))

    tags_at_head = [
        t for t in run("git tag --points-at HEAD -l 'v*' --sort=-version:refname").splitlines() if t
    ]
    if tags_at_head:
        tag = tags_at_head[0]
        release_name = f"FitTrack Progress {tag}"
        notes = "\n".join(
            [
                "## Release rerun",
                "",
                "This workflow rerun re-published artifacts for an existing tag.",
                "",
                f"Tag: {tag}",
                f"Source commit: {sha}",
                f"Build variant: {variant}",
            ]
        )
    else:
        tags = [t for t in run("git tag -l 'v*' --sort=-version:refname").splitlines() if t]
        last_tag = tags[0] if tags else None

        if last_tag:
            commit_messages = run(f"git log --format=%B {last_tag}..HEAD")
            commits_short = run(f"git log --pretty=format:'- %s (%h)' {last_tag}..HEAD")
            base = last_tag[1:]
        else:
            commit_messages = run("git log --format=%B")
            commits_short = run("git log --pretty=format:'- %s (%h)'")
            base = "0.0.0"

        if not commits_short.strip():
            commits_short = "- chore: no new commits found"

        parts = [int(p) for p in base.split(".")]
        while len(parts) < 3:
            parts.append(0)
        major, minor, patch = parts[:3]

        bump = "patch"
        if "BREAKING CHANGE" in commit_messages or re.search(
            r"^[a-zA-Z]+(\(.+\))?!:", commit_messages, re.MULTILINE
        ):
            bump = "major"
        elif re.search(r"^feat(\(.+\))?:", commit_messages, re.MULTILINE):
            bump = "minor"

        if bump == "major":
            major += 1
            minor = 0
            patch = 0
        elif bump == "minor":
            minor += 1
            patch = 0
        else:
            patch += 1

        tag = f"v{major}.{minor}.{patch}"
        release_name = f"FitTrack Progress {tag}"
        previous = last_tag if last_tag else "initial release"
        notes = "\n".join(
            [
                f"## Changes since {previous}",
                "",
                commits_short,
                "",
                f"Build: local Gradle ({variant} APK)",
                f"Source commit: {sha}",
            ]
        )

    Path("release-notes.md").write_text(notes + "\n", encoding="utf-8")

    github_output = os.environ.get("GITHUB_OUTPUT")
    if github_output:
        with open(github_output, "a", encoding="utf-8") as handle:
            handle.write(f"tag={tag}\n")
            handle.write(f"release_name={release_name}\n")

    # For local shell: TAG=... RELEASE_NAME=...
    print(f"TAG={tag}")
    print(f"RELEASE_NAME={release_name}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
