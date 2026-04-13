import { readFileSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const templatesBasePath = join(__dirname, '../../../../packages/templates');

interface TemplateComponent {
  name: string;
  path: string;
  content: string;
}

interface CachedTemplate {
  type: string;
  path: string;
  components: TemplateComponent[];
}

/**
 * 模板缓存
 */
const templateCache = new Map<string, CachedTemplate>();

/**
 * 当前选中的模板类型
 */
let currentTemplateType = 'full';

/**
 * 加载模板列表
 */
export function getTemplateList(): Array<{ name: string; path: string; components: TemplateComponent[] }> {
  const templates: Array<{ name: string; path: string; components: TemplateComponent[] }> = [];
  const fullPath = join(templatesBasePath, 'full');
  const basePath = join(templatesBasePath, 'base');

  if (existsSync(fullPath)) {
    templates.push({ name: 'full', path: fullPath, components: [] });
  }
  if (existsSync(basePath)) {
    templates.push({ name: 'base', path: basePath, components: [] });
  }

  return templates;
}

/**
 * 加载模板组件
 * @param templateType - 模板类型 (full/base)
 */
export async function loadTemplateComponents(templateType: string): Promise<CachedTemplate> {
  const templatePath = join(templatesBasePath, templateType);

  if (!existsSync(templatePath)) {
    throw new Error(`Template not found: ${templateType}`);
  }

  const cacheKey = `template_${templateType}`;

  if (templateCache.has(cacheKey)) {
    return templateCache.get(cacheKey)!;
  }

  try {
    const files = readdirSync(templatePath).filter(f =>
      f.endsWith('.vue') || f.endsWith('.js') || f.endsWith('.ts')
    );

    const components: TemplateComponent[] = [];

    for (const file of files) {
      const filePath = join(templatePath, file);
      const content = readFileSync(filePath, 'utf-8');
      components.push({
        name: file,
        path: filePath,
        content
      });
    }

    const result: CachedTemplate = {
      type: templateType,
      path: templatePath,
      components
    };

    templateCache.set(cacheKey, result);
    return result;

  } catch (error) {
    console.error(`[TemplateLoader] Error loading template ${templateType}:`, error);
    throw error;
  }
}

/**
 * 切换模板类型
 * @param type - 模板类型
 */
export function switchTemplateType(type: string): void {
  currentTemplateType = type;
  console.log(`[TemplateLoader] Switched to template type: ${type}`);
}

/**
 * 获取当前模板类型
 */
export function getCurrentTemplateType(): string {
  return currentTemplateType;
}

/**
 * 加载所有模板
 */
export async function loadTemplates(): Promise<void> {
  const templates = getTemplateList();
  console.log(`[TemplateLoader] Found ${templates.length} templates:`, templates.map(t => t.name));

  for (const template of templates) {
    await loadTemplateComponents(template.name);
  }
}

/**
 * 获取模板内容用于预览
 * @param templateType - 模板类型
 * @param componentName - 组件名称
 */
export function getTemplateContent(templateType: string, componentName: string): string | null {
  const cacheKey = `template_${templateType}`;
  const cached = templateCache.get(cacheKey);

  if (!cached) {
    return null;
  }

  const component = cached.components.find(c => c.name === componentName);
  return component?.content || null;
}
