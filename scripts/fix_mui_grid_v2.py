
import os
import re

def fix_grid_usage(file_path):
    if file_path.endswith('.original') or file_path.endswith('.bak'):
        return

    with open(file_path, 'r') as f:
        content = f.read()

    grid_pattern = re.compile(r'<Grid\b([^>]*?)>', re.DOTALL)

    def replacer(match):
        attributes = match.group(1)
        
        if 'size=' in attributes:
            if ' item' in attributes or '\nitem' in attributes:
               new_attr = attributes.replace(' item', '').replace('\nitem', '')
               return f'<Grid{new_attr}>'
            return match.group(0)
            
        sizes = {}
        for s in ['xs', 'sm', 'md', 'lg', 'xl']:
            # Normal values s={12} s="12"
            pattern = re.escape(s) + r'=[{"]([^\s}"]+)[}"]'
            size_match = re.search(pattern, attributes)
            if size_match:
                sizes[s] = size_match.group(1)
            else:
                # Ternary or complex s={...}
                complex_pattern = re.escape(s) + r'=\{\s*(.*?)\s*\}'
                complex_match = re.search(complex_pattern, attributes, re.DOTALL)
                if complex_match:
                    sizes[s] = complex_match.group(1)

        if not sizes and 'item' not in attributes:
            return match.group(0)

        size_prop = ""
        if sizes:
            parts = [f"{k}: {v}" for k, v in sizes.items()]
            size_prop = f" size={{{{ {', '.join(parts)} }}}}"

        new_attr = attributes
        if 'item' in new_attr:
            new_attr = re.sub(r'\bitem\b', '', new_attr)
        
        for s in ['xs', 'sm', 'md', 'lg', 'xl']:
            pattern = re.escape(s) + r'=[{"]([^\s}"]+)[}"]'
            new_attr = re.sub(pattern, '', new_attr)
            complex_pattern = re.escape(s) + r'=\{\s*.*?\s*\}'
            new_attr = re.sub(complex_pattern, '', new_attr, flags=re.DOTALL)

        result = f'<Grid{size_prop}{new_attr}>'
        result = re.sub(r'\s+', ' ', result)
        result = result.replace(' >', '>').replace(' />', ' />')
        return result

    new_content = grid_pattern.sub(replacer, content)
    
    if new_content != content:
        print(f"Fixed: {file_path}")
        with open(file_path, 'w') as f:
            f.write(new_content)

def check_and_fix_dir(directory):
    for root, dirs, files in os.walk(directory):
        if any(x in root for x in ['node_modules', '.next', '.git']):
            continue
        for file in files:
            if file.endswith('.tsx') or file.endswith('.jsx'):
                fix_grid_usage(os.path.join(root, file))

if __name__ == "__main__":
    check_and_fix_dir("packages/frontend/src")
