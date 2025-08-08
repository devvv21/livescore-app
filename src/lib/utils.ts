// src/lib/utils.ts

export const createSlug = (name: string): string => {
  if (!name) return '';
  const a = 'àáâäæãåāăąçćčđďèéêëēėęěğǵḧîïíīįìłḿñńǹňôöòóœøōõőṕŕřßśšşșťțûüùúūǘůűųẃẍÿýžźż·/_,:;'
  const b = 'aaaaaaaaaacccddeeeeeeeegghiiiiiilmnnnnoooooooooprrsssssttuuuuuuuuuwxyyzzz------'
  const p = new RegExp(a.split('').join('|'), 'g')
  return name.toString().toLowerCase()
    .replace(p, c => b.charAt(a.indexOf(c)))
    .replace(/&/g, '-and-')      
    .replace(/\s+/g, '-')      
    .replace(/[^\w\-]+/g, '')  
    .replace(/\-\-+/g, '-')    
    .replace(/^-+/, '')        
    .replace(/-+$/, '');       
};

export const createTeamSlug = (name: string, id: number): string => {
  if (!name || !id) return '';
  const baseSlug = createSlug(name);
  return `${baseSlug}-${id}`;
};

export const createLeagueSlug = (name: string, id: number): string => {
    if (!name || !id) return '';
    const baseSlug = createSlug(name);
    return `${baseSlug}-${id}`;
};

export function generateSlug(homeTeam: string, awayTeam: string, id: number): string {
    const cleanedHome = createSlug(homeTeam);
    const cleanedAway = createSlug(awayTeam);
    return `${cleanedHome}-vs-${cleanedAway}-${id}`;
}

export function generateNewsSlug(title: string): string {
  return createSlug(title);
}

export const getIdFromSlug = (slug: string): string | null => {
    if (!slug) return null;
    const parts = slug.split('-');
    const potentialId = parts[parts.length - 1];
    return /^\d+$/.test(potentialId) ? potentialId : null;
};

export const createTagSlug = (tagName: string): string => {
  const withHyphens = tagName.replace(/ /g, '-'); // Replace space with hyphen
  const safeName = withHyphens.replace(/\//g, '\/'); // Handle slashes separately
  return encodeURIComponent(safeName);
};

export const getTagNameFromSlug = (slug: string): string => {
  const decodedSlug = decodeURIComponent(slug);
  const withSlashes = decodedSlug.replace(/--/g, '/'); // Restore slashes first
  return withSlashes.replace(/-/g, ' '); // Restore hyphens to spaces
};

export const createCategorySlug = (categoryName: string): string => {
  return encodeURIComponent(categoryName.replace(/ /g, '-'));
};

export const getCategoryNameFromSlug = (slug: string): string => {
  return decodeURIComponent(slug).replace(/-/g, ' ');
};

const countryNameToCodeMap: { [key: string]: string } = {
  'England': 'GB', 'Spain': 'ES', 'Germany': 'DE', 'Italy': 'IT', 'France': 'FR',
  'Portugal': 'PT', 'Netherlands': 'NL', 'Brazil': 'BR', 'Argentina': 'AR',
  'USA': 'US',
};

export function convertCountryNameToCode(countryName: string): string {
  return countryNameToCodeMap[countryName] || 'XX';
}