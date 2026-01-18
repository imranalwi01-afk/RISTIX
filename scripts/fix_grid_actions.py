
import os
import re

def fix_grid_actions_cell_item(file_path):
    if file_path.endswith('.original') or file_path.endswith('.bak'):
        return

    with open(file_path, 'r') as f:
        content = f.read()

    # Pattern for GridActionsCellItem with sx prop
    # We want to find cases like:
    # <GridActionsCellItem
    #   ...
    #   icon={<DeleteIcon />}
    #   ...
    #   sx={{ color: 'error.main' }}
    # />
    
    # This regex matches the component and captures the icon and sx props
    pattern = re.compile(r'<GridActionsCellItem\b([^>]*?)>', re.DOTALL)

    def replacer(match):
        attrs = match.group(1)
        if 'sx=' not in attrs:
            return match.group(0)

        # Extract color from sx={{ color: '...' }}
        # We only handle simple cases like success.main, error.main, primary.main
        # Or literal colors
        sx_match = re.search(r'sx=\{\{\s*color:\s*[\'"](.*?)[\'"]\s*\}\}', attrs)
        if not sx_match:
            return match.group(0) # Skip if it's a more complex sx

        color_value = sx_match.group(1)
        
        # Determine MUI color prop value if possible, else wrap icon with sx
        mui_color = None
        if color_value == 'error.main': mui_color = 'error'
        elif color_value == 'success.main': mui_color = 'success'
        elif color_value == 'primary.main': mui_color = 'primary'
        elif color_value == 'warning.main': mui_color = 'warning'
        elif color_value == 'info.main': mui_color = 'info'
        
        # Extract the icon component
        icon_match = re.search(r'icon=\{<(.*?)\s?/>\}', attrs)
        if icon_match:
            icon_name = icon_match.group(1)
            # Remove existing props if any (though usually it's just <Icon />)
            icon_name_clean = icon_name.split(' ')[0]
            
            new_icon = f'<{icon_name_clean} color="{mui_color}" />' if mui_color else f'<{icon_name_clean} sx={{{{ color: "{color_value}" }}}} />'
            
            # Replace the icon and remove the sx prop from GridActionsCellItem
            new_attrs = attrs.replace(f'icon={{<{icon_name}/>}}', f'icon={{{new_icon}}}') # Handle no space
            new_attrs = new_attrs.replace(f'icon={{<{icon_name} />}}', f'icon={{{new_icon}}}') # Handle space
            # Attempt a more generic replace for icon if the above failed due to exact matching
            if new_attrs == attrs:
                new_attrs = re.sub(r'icon=\{<.*?\s?/>\}', f'icon={{{new_icon}}}', attrs)

            new_attrs = re.sub(r'sx=\{\{\s*color:\s*[\'"].*?[\'"]\s*\}\}', '', new_attrs)
            
            # Clean up whitespace
            new_attrs = re.sub(r'\s+', ' ', new_attrs).strip()
            return f'<GridActionsCellItem {new_attrs} />'

        return match.group(0)

    # Simplified approach for complex multi-line: just target the known case if regex is too hard
    # But let's try a simpler one for the SegmentationDetailModal specifically first if the above is too risky
    
    new_content = grid_pattern_replace(content)
    
    if new_content != content:
        print(f"Fixed: {file_path}")
        with open(file_path, 'w') as f:
            f.write(new_content)

def grid_pattern_replace(content):
    # This specifically looks for the pattern in the error
    return content.replace(
        'sx={{ color: \'error.main\' }}',
        ''
    ).replace(
        'icon={<DeleteIcon />}',
        'icon={<DeleteIcon color="error" />}'
    ).replace(
        'sx={{ color: \'success.main\' }}',
        ''
    ).replace(
        'icon={<ApproveIcon />}',
        'icon={<ApproveIcon color="success" />}'
    ).replace(
        'sx={{ color: \'primary.main\' }}',
        ''
    ).replace(
        'icon={<EditIcon />}',
        'icon={<EditIcon color="primary" />}'
    )

def check_and_fix_dir(directory):
    for root, dirs, files in os.walk(directory):
        if any(x in root for x in ['node_modules', '.next', '.git']):
            continue
        for file in files:
            if file.endswith('.tsx') or file.endswith('.jsx'):
                fix_grid_actions_cell_item(os.path.join(root, file))

if __name__ == "__main__":
    check_and_fix_dir("packages/frontend/src")
