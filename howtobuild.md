# How to Build and Use Psychy-IDE (Mobile Edition)

This guide covers how to build Psychy-IDE for different operating systems and how to leverage its newly integrated Android Studio and Xcode capabilities.

## Build Instructions

Psychy-IDE leverages the VSCodium build pipeline but is hardened and pre-configured for heavy-duty mobile development.

### Prerequisites
- Node.js (Version matching `.nvmrc`)
- Python 3
- Git
- `jq`

### Building for Linux
1. Run the `ci-build-linux.yml` GitHub Action workflow, OR
2. Locally execute:
   ```bash
   export OS_NAME="linux"
   ./get_repo.sh
   ./build.sh
   ```
   This will produce AppImage, deb, and rpm packages in the `artifacts/` or `vscode/` build directory.

### Building for macOS
1. Ensure Xcode and command line tools are installed.
2. Run the `ci-build-macos.yml` GitHub Action workflow, OR
3. Locally execute:
   ```bash
   export OS_NAME="osx"
   ./get_repo.sh
   ./build.sh
   ```
   This will produce a macOS `.dmg` and `.zip` file.

### Building for Windows
1. Run the `ci-build-windows.yml` GitHub Action workflow, OR
2. Locally execute from a Windows environment with Git Bash/WSL:
   ```bash
   export OS_NAME="windows"
   ./get_repo.sh
   ./build.sh
   ```
   This produces the Windows Installer (`.msi` / `.exe`).

---

## Using Android Studio & Xcode Capabilities

Psychy-IDE has been supercharged to fully replace Android Studio and Xcode. By injecting the `psychy-mobile-pack` into the build process, you get an out-of-the-box native experience.

### 📱 Android Development
When you open an Android/Kotlin/Java/Flutter project, Psychy-IDE automatically activates the following features:

1. **Gradle Build System**: A Gradle Elephant icon will appear in your sidebar. You can manage your dependencies, sync Gradle, and run build tasks natively just like Android Studio.
2. **Emulators & Physical Devices**: The Android Device Manager allows you to boot up AVD (Android Virtual Devices) or connect to physical devices via ADB directly from the IDE.
3. **Logcat**: A dedicated Logcat terminal tab is available to monitor and filter system logs from your running apps in real-time.
4. **Intelligent Code**: Deep Kotlin and Java analysis is provided via the official language servers.

*To deploy to the Google Play Store, simply use the Gradle Sidebar -> app -> Tasks -> build -> bundleRelease.*

### 🍏 iOS & Apple Development (Xcode Replacement)
When you open a Swift project or `.xcodeproj` / `.xcworkspace`, Psychy-IDE activates **SweetPad** and **CodeLLDB**:

1. **Simulator Manager**: A device selector will appear in the bottom status bar or sidebar. You can instantly boot iOS Simulators without opening Xcode.
2. **xcodebuild Integration**: Building and running your app uses native `xcodebuild` under the hood. Errors will be parsed and highlighted natively in your code editor.
3. **Native Debugging**: Set breakpoints in your Swift or Objective-C code. CodeLLDB will attach directly to the running iOS Simulator or physical device.
4. **Provisioning Profiles**: Manage Apple certificates and provisioning profiles right inside the editor to sign your app.

*To deploy to the iOS App Store, you can configure your `xcodebuild` archive command natively through the IDE's build tasks.*
