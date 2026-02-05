
import os
import re

def fix_grid_usage(file_path):
    with open(file_path, 'r') as f:
        content = f.read()

    # Pattern to match <Grid item ...>
    # We need to handle multi-line tags potentially, but let's start with single line for simplicity
    # or use regex with DOTALL if careful.
    
    # Strategy: Find all <Grid ...> tags that contain 'item'.
    # Then parse the attributes to construct 'size' prop.
    
    # Regex for finding Grid tags with item
    # <Grid\s+[^>]*\bitem\b[^>]*>
    
    def replacer(match):
        full_tag = match.group(0)
        
        # Check if it has 'item'
        if 'item' not in full_tag:
            return full_tag
            
        # Parse attributes
        # We want to extract xs, sm, md, lg, xl
        sizes = {}
        for size in ['xs', 'sm', 'md', 'lg', 'xl']:
            # Match size={value} or size="value" or just size
            # But usually it's xs={12} or xs="12"
            size_match = re.search(rf'\b{size}={{([^}}]+)}}', full_tag)
            if size_match:
                sizes[size] = size_match.group(1)
            else:
                # Try string format
                size_match_str = re.search(rf'\b{size}="([^"]+)"', full_tag)
                if size_match_str:
                    try:
                        sizes[size] = int(size_match_str.group(1))
                    except:
                        sizes[size] = size_match_str.group(1)
        
        # Construct new size prop
        size_prop = ""
        if sizes:
            # Build object string: {{ xs: 12, md: 6 }}
            props_list = [f"{k}: {v}" for k, v in sizes.items()]
            size_prop = f" size={{{{ {', '.join(props_list)} }}}}"
            
        # Remove item and size props from original tag
        new_tag = full_tag.replace(' item', '')
        for size in ['xs', 'sm', 'md', 'lg', 'xl']:
            new_tag = re.sub(rf'\s+{size}={{[^}}]+}}', '', new_tag)
            new_tag = re.sub(rf'\s+{size}="[^"]+"', '', new_tag)
            
        # Insert size prop after <Grid
        # Or before the end, but easier to append to start if we want consistency?
        # Let's append it right after <Grid
        new_tag = new_tag.replace('<Grid', f'<Grid{size_prop}', 1)
        
        # Clean up double spaces
        new_tag = re.sub(r'\s+', ' ', new_tag)
        new_tag = new_tag.replace('<Grid ', '<Grid ') # Ensure one space
        # Fix self-closing or >
        new_tag = new_tag.replace(' >', '>')
        new_tag = new_tag.replace(' />', ' />')
        
        return new_tag

    # Use DOTALL to match multi-line tags if needed, but simple regex might be safer line-by-line 
    # if we assume standard formatting.
    # However, React props often span lines.
    
    # Let's try to match the opening tag <Grid ... >
    # This regex is a bit complex for full reliability, but let's try.
    # We will search for '<Grid' and then find the closing '>' corresponding to the opening tag attributes.
    # This is hard with regex. 
    
    # Alternative: Use simple line-based approach if code is formatted (Prettier).
    # Most <Grid item ...> are one-liners or predictably formatted.
    
    new_content = re.sub(r'<Grid\s[^>]*\bitem\b[^>]*>', replacer, content, flags=re.DOTALL)
    
    if new_content != content:
        print(f"Fixed: {file_path}")
        with open(file_path, 'w') as f:
            f.write(new_content)

def check_and_fix_dir(directory):
    for root, dirs, files in os.walk(directory):
        if 'node_modules' in root:
            continue
        for file in files:
            if file.endswith('.tsx') or file.endswith('.jsx'):
                fix_grid_usage(os.path.join(root, file))

if __name__ == "__main__":
    check_and_fix_dir("packages/frontend/src/app")
