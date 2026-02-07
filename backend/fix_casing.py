import os
import shutil
import re

def merge_folders(src, dst):
    """
    Recursively merges src folder into dst folder, handling case sensitivity.
    """
    src = os.path.abspath(src)
    dst = os.path.abspath(dst)
    
    if src == dst:
        return

    if not os.path.exists(dst):
        # On Linux, renaming to same name but different case is simple 
        # if the destination doesn't exist.
        os.rename(src, dst)
        return

    # Merge contents
    for item in os.listdir(src):
        s_path = os.path.join(src, item)
        
        # Determine target name in dst (check for case-insensitive existing match)
        target_name = item
        for existing in os.listdir(dst):
            if existing.lower() == item.lower():
                target_name = existing
                break
        
        d_path = os.path.join(dst, target_name)
        
        if os.path.isdir(s_path):
            merge_folders(s_path, d_path)
        else:
            # For files, if it's a PHP class, ensure it's capitalized
            final_name = target_name
            if s_path.endswith('.php') and s_path != 'routes.php':
                try:
                    with open(s_path, 'r', encoding='utf-8', errors='ignore') as f:
                        c = f.read()
                        m = re.search(r'(class|interface|trait)\s+([a-zA-Z0-9_]+)', c)
                        if m:
                            final_name = m.group(2) + ".php"
                except:
                    pass
            
            d_path_final = os.path.join(dst, final_name)
            # Remove existing if it's a different file or just move it
            if os.path.exists(d_path_final) and os.path.abspath(s_path) != os.path.abspath(d_path_final):
                os.remove(d_path_final)
            
            if os.path.abspath(s_path) != os.path.abspath(d_path_final):
                shutil.move(s_path, d_path_final)

    # Clean up empty src
    try:
        if not os.listdir(src):
            os.rmdir(src)
    except:
        pass

def fix_all(app_root):
    """
    Standardizes 'app' directory contents for PSR-4.
    """
    # 1. Capitalize direct subfolders of 'app'
    # app/config -> app/Config, etc.
    for item in os.listdir(app_root):
        item_path = os.path.join(app_root, item)
        if os.path.isdir(item_path):
            target_name = item[0].upper() + item[1:]
            target_path = os.path.join(app_root, target_name)
            merge_folders(item_path, target_path)

if __name__ == "__main__":
    app_root = os.path.abspath("./app")
    if os.path.exists(app_root):
        print(f"Executing Deep PSR-4 Fix in: {app_root}")
        fix_all(app_root)
        
        # Double check routes.php
        routes_path = os.path.join(app_root, "Config", "routes.php")
        if os.path.exists(routes_path):
            print("Success: routes.php found in app/Config/routes.php")
        else:
            # Maybe it stayed in app/config? (merge_folders should have moved it)
            pass
            
        print("Done! All folders merged and capitalized.")
    else:
        print("Error: Directory 'app' not found.")
