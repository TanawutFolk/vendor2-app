import sys

path = r'c:\Users\tanawut.pat\Desktop\VEN-Dev\vendor2-app\src\_workspace\pages\_find-vendor\SearchFilter.tsx'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

import re
# Use regex to match the searchResults block, accommodating CRLF or LF
new_content = re.sub(
    r'searchResults:\s*\{\s*pageSize:.*?columnFilterFns:.*?\}',
    r"searchResults: {\n                    agGridState: getValues('searchResults.agGridState')\n                }",
    content,
    flags=re.DOTALL
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Done!")
