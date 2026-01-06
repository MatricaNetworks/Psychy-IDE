# How to Run Shell-IDE

This guide provides instructions for building and running Shell-IDE (VS Code) on different operating systems.

## 🚨 CRITICAL: Node.js Version

The project requires **Node.js 22.20.0** (or newer). You are likely using an older version (v12) which causes `ERR_UNKNOWN_FILE_EXTENSION` errors.

**Use this one-liner to fix your environment and build:**
```bash
export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" && nvm install 22 && nvm use 22 && npm run watch
```

## Prerequisites

- **Node.js**: v22+ (use `nvm`).
- **Git**, **Python**, **C++ Compiler**.

## 1. Linux

1.  **Install Prerequisites**:
    ```bash
    sudo apt-get install build-essential g++ libx11-dev libxkbfile-dev libsecret-1-dev libkrb5-dev python-is-python3
    ```

2.  **Build and Watch**:
    Ensure you are using Node 22:
    ```bash
    nvm use 22
    npm run watch
    ```

3.  **Run the IDE**:
    Open a **new terminal**:
    ```bash
    cd ~/Shell-IDE/vscode
    nvm use 22
    ./scripts/code.sh
    ```

## 2. Windows & 3. macOS

See the specific sections below for platform-specific prerequisites, but **always ensure you are using Node.js v22**.
