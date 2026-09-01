import os
import glob
import re

files = glob.glob('src/app/components/**/*.tsx', recursive=True) + \
        glob.glob('src/app/components/**/*.ts', recursive=True) + \
        glob.glob('src/app/components/**/*.js', recursive=True) + \
        glob.glob('src/app/utils/**/*.ts', recursive=True) + \
        glob.glob('src/app/utils/**/*.tsx', recursive=True)

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # User-facing text replacements
    new_content = content
    new_content = new_content.replace('Teaching Insights (JTIA)', 'Teaching Insights')
    new_content = new_content.replace('Teaching Insights Assessment (JTIA)', 'Teaching Insights Assessment')
    new_content = new_content.replace('Teaching Insights Profile (JTIA)', 'Teaching Insights Profile')
    new_content = new_content.replace('(JTIA)', '')
    new_content = new_content.replace('Overall JTIA Score', 'Overall Insights Score')
    new_content = new_content.replace('JTIA Profile', 'Teaching Insights Profile')
    new_content = new_content.replace('JTIA + one cognitive assessment', 'Teaching Insights + one cognitive assessment')
    new_content = new_content.replace('JTIA required for Full Analysis', 'Teaching Insights required for Full Analysis')
    new_content = new_content.replace('JTIA ↔ Thinking style', 'Teaching Insights ↔ Thinking style')
    new_content = new_content.replace('JTIA • Scenario & Preference Items', 'Teaching Insights • Scenario & Preference Items')
    new_content = new_content.replace('>JTIA<', '>Teaching Insights<')
    new_content = new_content.replace('"JTIA"', '"Teaching Insights"')
    new_content = new_content.replace("'JTIA'", "'Teaching Insights'") # might break string literals used for keys, we'll see
    # We should be careful about changing literal 'jtia' keys if they are used in code logic.
    
    # Revert if it broke logic (e.g. tabs or JSON keys)
    # Actually, I should only replace specific phrases to be safe.
    
    if content != new_content:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {file}")

