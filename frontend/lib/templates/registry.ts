import type { TemplateId } from "../types";

export const TEMPLATES = [
  { id: "modern" as TemplateId, name: "Modern", description: "Clean and minimal" },
  { id: "classic" as TemplateId, name: "Classic", description: "Traditional serif layout" },
  { id: "enterprise" as TemplateId, name: "Enterprise", description: "Formal with letterhead" },
  { id: "freelancer" as TemplateId, name: "Freelancer", description: "Personal and creative" },
  { id: "corporate" as TemplateId, name: "Corporate", description: "Board-ready with watermark" },
] as const;
