"""Runs the Robot Framework suites with the right variable files.

Usage (from the repository root):
    python robot/run.py api            # API suites, ENV=local by default
    python robot/run.py api --env public
    python robot/run.py web --env public
    python robot/run.py api --dryrun   # syntax check only, no request sent
    python robot/run.py api --include known-bug   # any other option is passed to Robot

ENV can also come from the environment variable ENV (same as the npm scripts).
BASE_URL, when set, overrides the API base URL (docker compose and CI use it).
Reports: reports/robot/<suite>/ (report.html, log.html, output.xml, junit.xml).
"""

import argparse
import os
import sys
from pathlib import Path

from robot import run_cli

ROOT = Path(__file__).resolve().parent.parent
ROBOT_DIR = ROOT / "robot"
ENVIRONMENTS = ("local", "public")


def build_arguments(suite: str, env: str, dryrun: bool, extra: list[str]) -> list[str]:
    reports = ROOT / "reports" / "robot" / suite
    args = [
        "--outputdir", str(reports),
        "--xunit", "junit.xml",
        "--metadata", f"Environment:{env}",
        "--consolecolors", "on",
    ]
    if suite == "api":
        args += [
            "--variablefile", str(ROBOT_DIR / "variables" / f"api-{env}.json"),
            "--variablefile", str(ROBOT_DIR / "variables" / "booking-data.json"),
        ]
        base_url = os.environ.get("BASE_URL")
        if base_url:
            args += ["--variable", f"BASE_URL:{base_url}"]
    else:
        # Same test data file as the Playwright suite: one source of truth.
        args += ["--variablefile", str(ROOT / "playwright" / "test-data" / f"{env}.json")]
    if dryrun:
        args.append("--dryrun")
    args += extra
    args.append(str(ROBOT_DIR / "tests" / suite))
    return args


def main() -> None:
    parser = argparse.ArgumentParser(description="Run the Robot Framework suites.")
    parser.add_argument("suite", choices=("api", "web"))
    parser.add_argument("--env", choices=ENVIRONMENTS, default=os.environ.get("ENV", "local"))
    parser.add_argument("--dryrun", action="store_true", help="check syntax and keywords only")
    options, extra = parser.parse_known_args()
    print(f"Robot Framework - suite {options.suite}, environment {options.env}")
    sys.exit(run_cli(build_arguments(options.suite, options.env, options.dryrun, extra), exit=False))


if __name__ == "__main__":
    main()
