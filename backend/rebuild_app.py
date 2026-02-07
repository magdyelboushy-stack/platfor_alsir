import os
import shutil
import re

def get_psr4_path(file_path):
    """
    Reads a PHP file and returns its expected PSR-4 relative path (e.g. Controllers/Auth/Login.php)
    or just the original case-corrected path for non-class files.
    """
    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
    except:
        return None

    # Try to find namespace and class name
    ns_match = re.search(r'namespace\s+App\\(.+?);', content)
    class_match = re.search(r'(class|interface|trait)\s+([a-zA-Z0-9_]+)', content)

    if ns_match and class_match:
        rel_ns = ns_match.group(1).replace('\\', '/')
        class_name = class_match.group(2)
        return f"{rel_ns}/{class_name}.php"
    
    # Non-class file (like routes.php) - we try to find its place based on folder
    # but we should at least capitalize folders like 'config' -> 'Config'
    parts = file_path.replace('\\', '/').split('/')
    try:
        # Find 'app' and get everything after it
        idx = parts.index('app')
        after_app = parts[idx+1:]
        # Capitalize each part except the last one if it's a file
        fixed_parts = []
        for i, p in enumerate(after_app):
            if i < len(after_app) - 1:
                fixed_parts.append(p[0].upper() + p[1:])
            else:
                fixed_parts.append(p) # keep filename as is unless it's a class (already handled)
        return "/".join(fixed_parts)
    except:
        return None

def rebuild_app(app_dir):
    temp_dir = app_dir + "_new"
    if os.path.exists(temp_dir):
        shutil.rmtree(temp_dir)
    os.makedirs(temp_dir)

    print(f"Walking {app_dir}...")
    for root, dirs, files in os.walk(app_dir):
        for file in files:
            full_path = os.path.join(root, file)
            target_rel = get_psr4_path(full_path)
            
            if target_rel:
                target_abs = os.path.join(temp_dir, *target_rel.split('/'))
                os.makedirs(os.path.dirname(target_abs), exist_ok=True)
                print(f"Placing: {target_rel}")
                shutil.copy2(full_path, target_abs)
            else:
                print(f"Skipping/Error on: {file}")

    # Swap
    bak_dir = app_dir + "_bak"
    if os.path.exists(bak_dir):
        shutil.rmtree(bak_dir)
    
    print("Swapping directories...")
    os.rename(app_dir, bak_dir)
    os.rename(temp_dir, app_dir)
    print("Done! Original app moved to app_bak. New structure is live.")

if __name__ == "__main__":
    target = os.path.abspath("./app")
    if os.path.exists(target):
        rebuild_app(target)
    else:
        print("Error: 'app' folder not found in current directory.")
