# Manual Testing Checklist

This checklist defines verification steps on devcontainer Ubuntu. No code execution is included here; it guides testers once implemented.

## Setup
- Open workspace root in VS Code (devcontainer Ubuntu)
- Ensure Competitive Companion posts to `http://127.0.0.1:10043/`
- Ensure `python` and `pypy3` are available on PATH

## Receive & Persist
- Import a problem via Competitive Companion
- Verify directory structure `/<contestId>/<taskId>/tests/`
- Confirm `.in/.out` files exist and are sequentially numbered starting at 1
- Re-import the same problem with additional tests → ensure new tests are appended (merge), no overwrite
- Confirm `main.py` is created on first import and not overwritten on subsequent imports

## Sidebar & State
- Sidebar shows problem `name` and `group`
- Tests list displays indices and Expected content (collapsible)

## Run (CPython)
- Set interpreter to CPython
- Run All: all tests execute serially, statuses reflect results
- For a known passing solution, all tests pass; Actual collapses by default
- Introduce a failing case: status shows Fail, Actual visible, Console hidden (unless stderr exists)

## Run (PyPy)
- Switch interpreter to PyPy
- Run All: ensure execution succeeds
- Verify common PyPy CPU cache warnings are suppressed from Console

## Timeout & Errors
- Configure a long-running input or artificial sleep → observe Timeout status
- Raise an exception in `main.py` → status RE, Console shows full stack trace

## Working Directory
- Print current working directory in solution and verify it is the workspace root

## Interactive Problems
- For a problem marked `interactive: true`, Sidebar indicates unsupported and run controls are disabled

## Regression
- Re-import, re-run in both interpreters; ensure no duplication or overwrite of files, and state updates correctly

