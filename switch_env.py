import os
import sys

def update_env(file_path, updates):
    if not os.path.exists(file_path):
        print(f"Warning: {file_path} not found.")
        return

    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    new_lines = []
    keys_updated = set()

    for line in lines:
        if '=' in line and not line.strip().startswith('#'):
            key = line.split('=')[0].strip()
            if key in updates:
                new_lines.append(f"{key}={updates[key]}\n")
                keys_updated.add(key)
                continue
        new_lines.append(line)

    # Add missing keys
    for key, value in updates.items():
        if key not in keys_updated:
            new_lines.append(f"{key}={value}\n")

    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)

def main():
    print("Select Environment:")
    print("1. Local (Laragon)")
    print("2. Production (AlwaysData)")
    
    choice = input("Enter choice (1/2): ").strip()
    
    if choice == '1':
        env_type = 'local'
        # Frontend updates
        fe_updates = {
            'VITE_API_URL': 'http://localhost:8001',
            'VITE_APP_ENV': 'local',
            'DEBUG': 'true'
        }
        # Backend updates
        be_updates = {
            'DB_HOST': 'localhost',
            'DB_DATABASE': 'bacaloria_db',
            'DB_USERNAME': 'root',
            'DB_PASSWORD': '',
            'APP_URL': 'http://localhost:8001',
            'ALLOWED_ORIGINS': 'http://localhost:3000',
            'APP_ENV': 'local',
            'DEBUG': 'true',
            'TELEGRAM_BOT_TOKEN': '8530603884:AAHRpUwIf13_SGBK16v1LLs3zRXgh-01Sio',
            'TELEGRAM_ADMIN_CHAT_ID': '8265886951'
        }
    elif choice == '2':
        env_type = 'production'
        # Frontend updates
        fe_updates = {
            'VITE_API_URL': 'https://bistunhalk.alwaysdata.net/api',
            'VITE_APP_ENV': 'production',
            'DEBUG': 'false'
        }
        # Backend updates
        be_updates = {
            'DB_HOST': 'mysql-bistunhalk.alwaysdata.net',
            'DB_DATABASE': 'bistunhalk_bistunhalk',
            'DB_USERNAME': 'bistunhalk',
            'DB_PASSWORD': 'Magdy@2010',
            'APP_URL': 'https://bistunhalk.alwaysdata.net',
            'ALLOWED_ORIGINS': 'https://basstnhalk.vercel.app',
            'APP_ENV': 'production',
            'DEBUG': 'false',
            'TELEGRAM_BOT_TOKEN': '8530603884:AAHRpUwIf13_SGBK16v1LLs3zRXgh-01Sio',
            'TELEGRAM_ADMIN_CHAT_ID': '8265886951'
        }
    else:
        print("Invalid choice.")
        return

    print(f"Switching to {env_type}...")
    
    # Update Frontend .env (root)
    update_env('.env', fe_updates)
    print("✓ Updated frontend .env")
    
    # Update Backend .env
    update_env('backend/.env', be_updates)
    print("✓ Updated backend .env")
    
    print("\nDone! Please restart your dev servers if running.")

if __name__ == "__main__":
    main()
