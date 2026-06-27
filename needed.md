# How to Run Psychy-IDE

This guide provides instructions for building and running Psychy-IDE (VS Code) on different operating systems.

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
    cd ~/Psychy-IDE/vscode
    nvm use 22
    ./scripts/code.sh
    ```

## 2. Windows

1. **Install Prerequisites**:
   ```bash
   # Using Chocolatey
   choco install git python3 visualstudio2019buildtools nodejs-lts
   ```

2. **Build and Watch**:
   Ensure you are using Node 22:
   ```bash
   nvm use 22
   npm run watch
   ```

3. **Run the IDE**:
   ```bash
   cd %USERPROFILE%\\Psychy-IDE\\vscode
   nvm use 22
   .\\scripts\\code.bat
   ```

## 3. macOS (Intel)

1. **Install Prerequisites**:
   ```bash
   brew install git python node
   ```

2. **Build and Watch**:
   ```bash
   nvm use 22
   npm run watch
   ```

3. **Run the IDE**:
   ```bash
   cd ~/Psychy-IDE/vscode
   nvm use 22
   ./scripts/code.sh
   ```

## 4. macOS (Apple Silicon)

1. **Install Prerequisites**:
   ```bash
   brew install git python node
   # Ensure you have the ARM version of node via nvm
   ```

2. **Build and Watch**:
   ```bash
   nvm use 22
   npm run watch
   ```

3. **Run the IDE**:
   ```bash
   cd ~/Psychy-IDE/vscode
   nvm use 22
   ./scripts/code.sh
   ```
