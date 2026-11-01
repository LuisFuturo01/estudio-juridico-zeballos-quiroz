/**
 * Punto único de acceso a los datos JSON.
 * Para cambiar a una fuente remota (CMS / API), basta con reemplazar estas exportaciones.
 */
import specialtiesJson from '../data/specialties.json';
import lawyersJson from '../data/lawyers.json';
import blogJson from '../data/blog.json';
import socialJson from '../data/social.json';
import knowledgeJson from '../data/legal_agent_knowledge.json';
import siteJson from '../data/site.json';
import type { AgentKnowledge, BlogPost, Lawyer, SiteFile, SocialFile, SpecialtiesFile } from '../types';

export const specialtiesData = specialtiesJson as SpecialtiesFile;
export const specialties = specialtiesData.items;
export const lawyers = lawyersJson as Lawyer[];
export const blogPosts = [...(blogJson as BlogPost[])].sort((a, b) => b.date.localeCompare(a.date));
export const social = socialJson as SocialFile;
export const site = siteJson as SiteFile;
export const agentKnowledge = knowledgeJson as AgentKnowledge;

export const specialtyById = (id: string) => specialties.find((s) => s.id === id);

/** Nombre corto de una especialidad ("Derecho de Familia" → "Familia"). */
export const shortTitle = (title: string) => title.replace(/^(Derecho de |Derecho )/, '').replace(/ Law$/, '');
