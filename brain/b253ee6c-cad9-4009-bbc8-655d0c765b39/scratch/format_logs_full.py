import json

with open('/Users/kwabenabrefo/.gemini/antigravity/brain/b253ee6c-cad9-4009-bbc8-655d0c765b39/.system_generated/steps/955/output.txt') as f:
    data = json.load(f)

events = data.get('result', {}).get('result', [])
for i, ev in enumerate(events[:10]):
    print(f"Event {i}: {json.dumps(ev, indent=2)}")
