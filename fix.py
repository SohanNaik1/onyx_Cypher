import os

filepath = "frontend/code.html"

with open(filepath, "r") as f:
    lines = f.readlines()

# The file up to line 613 (inclusive) is the good HTML.
# Lines 610-613 are:
# </div>
# </div>
# </main>
# </div>

good_html_top = lines[:613]

# The Javascript logic starts at line 614 (0-indexed 613) and ends at line 1067 (0-indexed 1066)
javascript_lines = lines[613:1066] # Excludes the </script> tag at 1067
# The chat widget HTML starts at line 1068 (0-indexed 1067) and ends at line 1103 (0-indexed 1102)
chat_widget_lines = lines[1068:1103]

# So we want to assemble:
# 1. good_html_top
# 2. chat_widget_lines
# 3. <script>\n
# 4. javascript_lines
# 5. </script>\n</body></html>

new_lines = []
new_lines.extend(good_html_top)
new_lines.extend(chat_widget_lines)
new_lines.append("<!-- Interactive JavaScript Handling -->\n")
new_lines.append("<script>\n")
new_lines.extend(javascript_lines)
new_lines.append("</script>\n")
new_lines.append("</body></html>\n")

with open(filepath, "w") as f:
    f.writelines(new_lines)
print("Fix applied successfully.")
