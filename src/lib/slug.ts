
export function slugify(name: string, id: string): string {
  const slug = name
    .toLowerCase()
    .normalize("NFD") // Decompose chars (e.g. é -> e + ')
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, ""); // Trim hyphens

  return `${slug}-${id}`;
}

export function getIdFromSlug(slug: string): string {
  // If slug is just a UUID, return it
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(slug)) {
    return slug;
  }

  // Otherwise, extract the last part (UUID)
  // Assuming the format is name-of-event-UUID
  // UUIDs have hyphens, so we need to be careful.
  // A UUID is 36 chars long.
  
  if (slug.length < 36) return slug; // Fallback or invalid
  
  const potentialId = slug.slice(-36);
  if (uuidRegex.test(potentialId)) {
      return potentialId;
  }
  
  // If simplified placeholder ID (e.g. '1', '10')
  const parts = slug.split('-');
  return parts[parts.length - 1];
}
