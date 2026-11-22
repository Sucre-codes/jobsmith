import { templateById, type TemplateId } from "./styles";

const KEY = "jobsmith:template";

export function getTemplateId(): TemplateId {
  try {
    return templateById(localStorage.getItem(KEY) ?? "").id;
  } catch {
    return "classic";
  }
}

export function setTemplateId(id: TemplateId): void {
  try {
    localStorage.setItem(KEY, id);
  } catch {
    // Storage can be blocked. The choice just won't be remembered.
  }
}