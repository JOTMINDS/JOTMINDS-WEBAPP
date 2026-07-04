import os
import re

files_to_fix = [
    'skillMastery.ts',
    'gamification.ts',
    'schoolAnalytics.ts',
    'privacyConsent.ts',
    'cognitiveXP.ts',
    'adminSettingsApi.ts',
    'supabaseSync.ts',
    'profileImprovement.ts',
    'cognitiveWorkout.ts'
]

for filename in files_to_fix:
    filepath = os.path.join('/Users/kwabenabrefo/j/JOTMINDS/src/app/utils', filename)
    if not os.path.exists(filepath):
        continue
    
    with open(filepath, 'r') as f:
        content = f.read()
        
    if 'JSON.parse' in content:
        # Add import for safeParseData if not present
        if 'safeParseData' not in content:
            if "import { safeParse }" in content:
                content = content.replace("import { safeParse }", "import { safeParse, safeParseData }")
            elif "import { safeParse " in content:
                content = content.replace("import { safeParse ", "import { safeParse, safeParseData ")
            else:
                # Add it after the last import
                imports = [line for line in content.split('\n') if line.startswith('import ')]
                if imports:
                    last_import = imports[-1]
                    content = content.replace(last_import, f"{last_import}\nimport {{ safeParseData }} from './storage';")
                else:
                    content = f"import {{ safeParseData }} from './storage';\n{content}"
        
        # Replace JSON.parse(data) with safeParseData(data, []) or {} depending on type, but for simplicity let's just do:
        # wait, safeParseData requires a fallback.
        # This regex approach is too fragile for fallback detection.
        pass
