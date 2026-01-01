import re
import os

schema_path = 'packages/new-backend/src/db/schema/introspected/schema.ts'
migration_path = 'legacy_migration.sql'

with open(schema_path, 'r') as f:
    content = f.read()

# 1. Update Import
# Find "drizzle-orm/pg-core" import and add pgSchema
if 'pgSchema' not in content:
    content = re.sub(r'import \{ ([^}]*) \} from "drizzle-orm/pg-core"', r'import { \1, pgSchema } from "drizzle-orm/pg-core"', content)

# 2. Add Schema Definition
# Add it after imports. Find the line ending with "drizzle-orm"" or similar.
# We'll just insert it after the last import line.
last_import_index = content.rfind('from "drizzle-orm"')
if last_import_index == -1:
    last_import_index = content.rfind('from "drizzle-orm/pg-core"')

# Find the end of that line
end_of_line = content.find('\n', last_import_index)
content = content[:end_of_line+1] + '\nexport const ifrs9 = pgSchema("ifrs9");\n' + content[end_of_line+1:]

# 3. Tables to move
tables_to_move = []

def replace_callback(match):
    table_name = match.group(1)
    tables_to_move.append(table_name)
    return 'ifrs9.table("{}"'.format(table_name)

# Regex for frs9_, stg_frs9_, tmp_frs9_ (lowercase)
# Pattern: pgTable("((?:stg_|tmp_)?frs9_[^"]+)"
# Note: table name is inside quotes.
content_new = re.sub(r'pgTable\("((?:stg_|tmp_)?frs9_[^"]+)"', replace_callback, content)

# Regex for UPPERCASE FRS9_
# Pattern: pgTable("(FRS9_[^"]+)"
content_new = re.sub(r'pgTable\("(FRS9_[^"]+)"', replace_callback, content_new)

# 4. Write Code
with open(schema_path, 'w') as f:
    f.write(content_new)

# 5. Generate SQL Migration
sql_statements = ["CREATE SCHEMA IF NOT EXISTS ifrs9;"]
for table in tables_to_move:
    # Check if table exists in public schema before moving? 
    # Migration script usually assumes state. 
    # We will generate ALTER statements.
    sql_statements.append(f'ALTER TABLE IF EXISTS public."{table}" SET SCHEMA ifrs9;')

with open(migration_path, 'w') as f:
    f.write('\n'.join(sql_statements))

print(f"Updated {schema_path}")
print(f"Generated {migration_path} with {len(tables_to_move)} tables moving to ifrs9 schema.")
