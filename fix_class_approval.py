with open('src/app/components/TeacherClassManagement.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("status: 'pending' // Classes created by teachers need approval", "status: 'approved' // Auto-approve classes created by teachers (Revised system)")
content = content.replace("Create and manage your classes. New classes must be approved by your school admin before students can join them.", "Create and manage your classes.")

with open('src/app/components/TeacherClassManagement.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated TeacherClassManagement")
