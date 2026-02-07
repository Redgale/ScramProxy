export const sanitizeUrl = (url) => {
  if (!url) throw new Error('URL is required');
  
  // Remove protocols that could be dangerous
  if (url.startsWith('javascript:') || url.startsWith('data:') || url.startsWith('vbscript:')) {
    throw new Error('Unsafe protocol');
  }
  
  // Add protocol if missing
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  
  try {
    new URL(url);
  } catch (error) {
    throw new Error('Invalid URL format');
  }
  
  return url;
};

export const sanitizeHtml = (html) => {
  // Basic HTML sanitization
  return html
    .replace(/on\w+\s*=\s*"[^"]*"/gi, '') // Remove event handlers
    .replace(/javascript:/gi, ''); // Remove javascript protocol
};