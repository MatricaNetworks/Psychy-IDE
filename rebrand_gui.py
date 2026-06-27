import os

# Configuration
TARGET_DIR = 'vscode/src'
EXTENSIONS = ('.ts', '.js', '.json', '.html')
IGNORE_MARKERS = ['@vscodium/'] # Skip replacement on lines containing this (imports)

REPLACEMENT_MAP = {
    'VSCodium': 'Psychy-IDE',
    # 'vscodium': 'psychy-ide' # Skipping specific lowercase replacement to avoid breaking IDs, unless specific visible strings need it.
}

def process_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            lines = f.readlines()
    except Exception as e:
        print(f"Skipping {filepath}: {e}")
        return

    new_lines = []
    file_changed = False

    for line in lines:
        original_line = line
        
        # Check if line contains any ignore marker
        if any(marker in line for marker in IGNORE_MARKERS):
            new_lines.append(line)
            continue

        # Perform replacements
        for search, replace in REPLACEMENT_MAP.items():
            if search in line:
                line = line.replace(search, replace)
        
        new_lines.append(line)
        if line != original_line:
            file_changed = True

    if file_changed:
        try:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.writelines(new_lines)
            print(f"Update: {filepath}")
        except Exception as e:
            print(f"Error writing {filepath}: {e}")

def main():
    print(f"Starting rebranding in {TARGET_DIR}...")
    count = 0
    for root, dirs, files in os.walk(TARGET_DIR):
        for file in files:
            if file.endswith(EXTENSIONS):
                process_file(os.path.join(root, file))
                count += 1
    print(f"Processed {count} files.")

if __name__ == '__main__':
    main()
