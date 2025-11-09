import json
import random
import copy
from datetime import datetime, timedelta

# Define sensible random value generators for different field types
def generate_random_value(key, value, context):
    """Generate sensible random values based on field name and context"""
    
    # Skip metadata and non-vehicle data
    if key in ['metadata', 'years', 'counts_by_year', 'sources']:
        return value
    
    # If value is None, create a reasonable replacement depending on the field
    if value is None:
        lk = key.lower()

        # If the field name implies a list, return an empty list (safe, not-null)
        if lk.endswith('list'):
            return []

        # Descriptive / string fields — try to use sibling context when possible
        if lk in ('atvtype',):
            return context.get('VClass') or context.get('baseModel') or 'Standard Vehicle'

        if lk in ('c240dscr', 'c240bdscr', 'eng_dscr', 'trans_dscr'):
            # Build a short description from displacement and cylinders if available
            displ = context.get('displ')
            cyl = context.get('cylinders')
            if displ and cyl:
                return f"{cyl} cyl, {displ} L"
            return context.get('trany') or context.get('fuelType') or 'Not available'

        if lk in ('evmotor',):
            # If there is a battery count or negative battery, try to guess
            try:
                b = int(context.get('battery', -1))
            except Exception:
                b = -1
            return 'Electric motor' if b > 0 else 'No electric motor'

        if lk in ('guzzler',):
            return 'No'

        if lk in ('fueltype2',):
            return ''  # optional second fuel type — empty string instead of null

        if lk in ('emissionslist',):
            # Keep as an empty array if emissions are unknown
            return []

        if lk in ('scharger', 'tcharger'):
            return str(round(random.uniform(0.5, 8.0), 1))

        if lk in ('createdon', 'modifiedon'):
            return datetime.utcnow().isoformat() + 'Z'

        # Boolean-like string flags
        if key in ('cylDeact', 'startStop'):
            return 'N'
        if key == 'cylDeactYesNo':
            return 'No'
        if key in ('mpgData', 'mpgRevised', 'phevBlended'):
            return 'false'

        # Numeric-like fields — generate reasonable numeric strings
        if 'charge' in lk:
            return str(round(random.uniform(1.5, 12.0), 1))

        if 'city' in lk and 'range' not in lk:
            if key.startswith('U') or 'u' in key:
                return str(round(random.uniform(15.0, 35.0), 4))
            return str(random.randint(15, 35))

        if 'highway' in lk or 'hwy' in lk:
            if key.startswith('U') or 'u' in key:
                return str(round(random.uniform(20.0, 45.0), 4))
            if 'range' in lk:
                return str(round(random.uniform(250.0, 450.0), 1))
            return str(random.randint(20, 45))

        if 'comb' in lk and 'mpg' not in lk:
            if key.startswith('U') or 'u' in key:
                return str(round(random.uniform(18.0, 40.0), 4))
            return str(random.randint(18, 40))

        if 'range' in lk and key != 'rangeA':
            return str(round(random.uniform(250.0, 450.0), 1))

        if 'barrel' in lk:
            return str(round(random.uniform(8.0, 20.0), 2))

        if any(tok in lk for tok in ('citye', 'combe', 'highwaye')):
            return str(round(random.uniform(25.0, 120.0), 1))

        if 'mpk' in lk or 'umpk' in lk:
            return str(random.randint(2, 5))

        if lk.endswith('uf') or ' uf' in lk:
            return str(round(random.uniform(0.0, 1.0), 2))

        if 'cd' in lk and len(lk) <= 6:
            return str(round(random.uniform(0.0, 50.0), 1))

        if 'phev' in lk:
            return str(random.randint(15, 45))

        if key in ('hlv', 'hpv', 'lv2', 'lv4', 'pv2', 'pv4'):
            return str(random.randint(0, 1))

        if 'co2tailpipeagpm' in lk:
            return str(round(random.uniform(150.0, 550.0), 1))

        if 'fuelcosta' in lk:
            return str(random.randint(1500, 4000))

        if key == 'youSaveSpend':
            return str(random.randint(-8000, 2000))

        # Fallback for any other None — return a short placeholder string
        return 'Unknown'
    
    return value

def process_json_recursively(data, path=""):
    """Recursively process JSON data to replace null and 0.0 values"""
    
    if isinstance(data, dict):
        new_data = {}
        for key, value in data.items():
            current_path = f"{path}.{key}" if path else key
            
            # Process the value
            if isinstance(value, (dict, list)):
                new_data[key] = process_json_recursively(value, current_path)
            else:
                new_data[key] = generate_random_value(key, value, data)
        return new_data
    
    elif isinstance(data, list):
        return [process_json_recursively(item, path) for item in data]
    
    return data

def main():
    input_file = r"c:\Users\vibhu\Documents\Satyam Stuff\UTD\Obsidian\School\Semester 7\7 sem7 Fall 2025\HackUTD\Toyota project\Data\toyota_dataset_2024-2025.json"
    output_file = r"c:\Users\vibhu\Documents\Satyam Stuff No Sync\Github Repos\hackutd2025\scripts\toyota_dataset_fixed.json"
    
    print("Loading JSON file...")
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print("Processing data to replace null and 0.0 values...")
    processed_data = process_json_recursively(data)
    
    print("Writing processed data to output file...")
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(processed_data, f, indent=2, ensure_ascii=False)
    
    print(f"✓ Complete! Fixed data written to: {output_file}")
    
    # Print some statistics
    original_str = json.dumps(data)
    processed_str = json.dumps(processed_data)
    
    null_count_before = original_str.count('null')
    null_count_after = processed_str.count('null')
    zero_count_before = original_str.count('"0.0"') + original_str.count(': 0,') + original_str.count(': 0}')
    zero_count_after = processed_str.count('"0.0"') + processed_str.count(': 0,') + processed_str.count(': 0}')
    
    print(f"\nStatistics:")
    print(f"  null values: {null_count_before} → {null_count_after}")
    print(f"  Approximate 0/0.0 values reduced: {zero_count_before} → {zero_count_after}")

if __name__ == "__main__":
    main()
