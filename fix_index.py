with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

translate_script = """
      <!-- Google Translate -->
      <script type="text/javascript">
        function googleTranslateElementInit() {
          new google.translate.TranslateElement({
            pageLanguage: 'en',
            includedLanguages: 'en,fr,es,ar,sw',
            layout: google.translate.TranslateElement.InlineLayout.SIMPLE
          }, 'google_translate_element');
        }
      </script>
      <script type="text/javascript" src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"></script>
"""

content = content.replace("<body>", "<body>\n" + translate_script)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated index.html with Google Translate")
