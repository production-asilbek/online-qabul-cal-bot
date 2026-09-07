import type { TemplateVariables } from "@/types";

export function renderTemplate(content: string, variables: TemplateVariables) {
  return content.replace(/\{\{(\w+)\}\}/g, (_, key: keyof TemplateVariables) => variables[key] ?? "");
}

export const SYSTEM_TEMPLATES = [
  {
    name: "Appointment reminder",
    content:
      "Hello {{client_name}}, this is a reminder about your appointment at {{business_name}} tomorrow at {{time}}.",
  },
  {
    name: "Appointment confirmation",
    content:
      "Hello {{client_name}}, your appointment at {{business_name}} is confirmed for {{date}} at {{time}}.",
  },
  {
    name: "Follow-up",
    content: "Hello {{client_name}}, thank you for visiting {{business_name}}.",
  },
];
