# JotMinds: Product Overview & Use Cases

## What is JotMinds?
JotMinds is a collaborative knowledge-management, note-taking, and learning platform designed to bridge the gap between personal thought organization and institutional knowledge sharing. At its core, it allows users to quickly capture ideas ("jots"), organize complex information, and securely share it within their schools, companies, or personal lives. 

The platform is accessible anywhere, functioning seamlessly across a full web application and a touch-friendly, mobile-first experience.

## Comprehensive User Personas: Who uses it?
JotMinds is designed with a flexible architecture that caters to multiple distinct types of users, each with unique needs and workflows within the platform:

### 1. General Users (Personal Use)
* **Profile:** Individuals looking for a frictionless space to organize their daily lives.
* **Use Cases:** 
  * Personal journaling and daily habit tracking.
  * Rapid idea capture ("jots") while on the go using the mobile-first app.
  * Organizing personal projects, recipes, or travel plans without needing to connect to any organization.

### 2. Students
* **Profile:** Learners within an educational institution.
* **Use Cases:**
  * Organizing class notes, study guides, and research materials.
  * Receiving and interacting with curated "jots" and lesson materials shared securely by their teachers.
  * Collaborating with peers on group projects and study sessions.

### 3. Educators & Teachers
* **Profile:** Instructors managing classrooms and curricula.
* **Use Cases:**
  * **Classroom Management:** Organizing lesson plans, class notes, and educational resources.
  * **Knowledge Sharing:** Distributing study materials to students or collaborating on curriculum with fellow teachers.
  * **Frictionless Onboarding:** Utilizing the "Organization Invitation Code" at sign-up to automatically map their account to their specific school (`teacher:{uid}:classes`) and instantly gain access to the school's directory.

### 4. Professionals & Corporate Employees
* **Profile:** Knowledge workers within a business or enterprise environment.
* **Use Cases:**
  * **Meeting & Project Notes:** Taking rapid, structured notes during meetings and brainstorming sessions.
  * **Team Collaboration:** Accessing the professional directory (`pro:{uid}:directory`) to easily find colleagues and share project-specific knowledge.
  * **Enterprise Security:** Benefiting from strict data silos where corporate information remains secure and accessible only to verified employees linked to the company.

### 5. Organization Administrators (School & Enterprise IT)
* **Profile:** The IT managers, principals, or HR leads responsible for managing the platform at an institutional level.
* **Use Cases:**
  * **Access Management:** Generating and managing the "Organization Invitation Codes" (`invite:{invite_code}:org:{org_id}`) that seamlessly route incoming teachers and professionals to the correct workspace.
  * **Security & Oversight:** Managing high-level organization metadata (`org:{org_id}:meta`) and overseeing third-party OAuth and consent authorizations (`/oauth/consent`).

## Key Product Features
* **"Jots" and Content Modules:** The core unit of JotMinds. Users can create rich-text notes, attach resources, and organize them chronologically or categorically.
* **Frictionless Organization Auto-Linking:** By entering a simple code during onboarding, users bypass complex setup phases and instantly join their school or company environment.
* **Mobile-First Accessibility:** The mobile MVP provides a highly responsive, touch-friendly interface with large tap targets, ensuring you can capture an idea the second it comes to mind.
* **Deep-Linked Ecosystem:** Secure workflows (like password resets or third-party app consent) route users perfectly back into their context, whether they are on their phone or desktop.

## Summary
In short, JotMinds is a unified brain-hub. Whether it's an admin setting up a secure workspace, a teacher mapping out a semester's curriculum, a student studying for finals, a professional organizing deliverables, or an individual tracking their daily thoughts, JotMinds provides the secure, cross-platform architecture to make capturing and sharing knowledge effortless.