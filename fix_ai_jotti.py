with open('src/app/utils/aiService.ts', 'r', encoding='utf-8') as f:
    content = f.read()

new_func = """
export async function chatWithJotti(message: string, history: any[], context?: string, contextData?: any): Promise<string | null> {
  try {
    let contextInstructions = "";
    
    if (context === "lesson-planner") {
      contextInstructions = `You are in the Lesson Planner. If the user asks you to create a lesson plan, include this at the very end of your message on a new line: [ACTION_CREATE_PLAN] Subject | Topic | Grade.`;
    } else if (context === "analytics") {
      contextInstructions = `You are helping the teacher analyze class data and student insights. Use the provided context data to answer questions about student performance, cognitive styles, and classroom synergy.`;
    } else if (context === "students") {
      contextInstructions = `You are helping the teacher manage students. Offer advice on engaging students based on cognitive profiles, generating codes, or differentiated activities.`;
    } else if (context === "jtia") {
      contextInstructions = `You are helping the teacher interpret their Teaching Insights Assessment results. Give them empowering advice on professional development and growth.`;
    } else {
      contextInstructions = `You are a general teaching assistant on the JotMinds platform.`;
    }

    const systemMsg = {
      role: 'system',
      content: `You are Jotti, an expert, friendly AI Teaching Assistant for the JotMinds platform. 
${contextInstructions}
Context Data: ${JSON.stringify(contextData || {})}`
    };
    const messages = [systemMsg, ...history, { role: 'user', content: message }];
    return await callOpenAI(messages, false, 800);
  } catch (err) {
    console.error('Failed to chat with Jotti:', err);
    return null;
  }
}
"""

if "export async function chatWithJotti(" not in content:
    content += new_func
    with open('src/app/utils/aiService.ts', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Added chatWithJotti")
else:
    print("Already exists")
