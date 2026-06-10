import { stripHtml, countPlainTextChars, calculateReadingTimeMinutes, getReadingStats } from './readingStats';

describe('stripHtml', () => {
  it('returns empty string for non-string inputs', () => {
    expect(stripHtml(null)).toBe('');
    expect(stripHtml(undefined)).toBe('');
    expect(stripHtml(123)).toBe('');
    expect(stripHtml({})).toBe('');
  });

  it('returns original plain text when no HTML tags are present', () => {
    const plainText = 'Hello world test content';
    expect(stripHtml(plainText)).toBe(plainText);
  });

  it('strips simple HTML tags from content', () => {
    const html = '<p>Hello Conduit Blog</p>';
    expect(stripHtml(html)).toBe('Hello Conduit Blog');
  });

  it('strips nested and attribute-bearing HTML tags completely', () => {
    const html = '<div class="article-body"><h1>Article Title</h1><p>Main content text</p></div>';
    expect(stripHtml(html)).toBe('Article TitleMain content text');
  });

  it('returns empty string for empty HTML input', () => {
    expect(stripHtml('')).toBe('');
  });
});

describe('countPlainTextChars', () => {
  it('returns 0 for empty HTML content', () => {
    expect(countPlainTextChars('')).toBe(0);
  });

  it('counts characters correctly for plain text without tags', () => {
    const testText = '1234567890abcdef';
    expect(countPlainTextChars(testText)).toBe(testText.length);
  });

  it('ignores HTML tags when counting total characters', () => {
    const html = '<p>sixchar</p>';
    expect(countPlainTextChars(html)).toBe(7);
  });

  it('counts correctly across multiple separate tags', () => {
    const html = '<h2>Hi</h2><p>There</p>';
    expect(countPlainTextChars(html)).toBe(7);
  });
});

describe('calculateReadingTimeMinutes', () => {
  it('returns 0 for 0 character count', () => {
    expect(calculateReadingTimeMinutes(0)).toBe(0);
  });

  it('returns 1 for any character count between 1 and 200 inclusive', () => {
    expect(calculateReadingTimeMinutes(1)).toBe(1);
    expect(calculateReadingTimeMinutes(100)).toBe(1);
    expect(calculateReadingTimeMinutes(200)).toBe(1);
  });

  it('correctly rounds up to next minute when character count exceeds multiple of 200', () => {
    expect(calculateReadingTimeMinutes(201)).toBe(2);
    expect(calculateReadingTimeMinutes(399)).toBe(2);
    expect(calculateReadingTimeMinutes(400)).toBe(2);
    expect(calculateReadingTimeMinutes(401)).toBe(3);
  });

  it('returns 0 for negative character count', () => {
    expect(calculateReadingTimeMinutes(-100)).toBe(0);
  });

  it('returns 0 for non-finite numeric inputs', () => {
    expect(calculateReadingTimeMinutes(NaN)).toBe(0);
    expect(calculateReadingTimeMinutes(Infinity)).toBe(0);
  });

  it('returns 0 for undefined input', () => {
    expect(calculateReadingTimeMinutes(undefined)).toBe(0);
  });
});

describe('getReadingStats', () => {
  it('returns zero stats for empty article body', () => {
    const result = getReadingStats('');
    expect(result.charCount).toBe(0);
    expect(result.readingTimeMinutes).toBe(0);
  });

  it('returns consistent stats matching the input content', () => {
    const htmlContent = '<p>Test article body content for reading stats calculation</p>';
    const result = getReadingStats(htmlContent);
    expect(result.charCount).toBe(stripHtml(htmlContent).length);
    expect(result.readingTimeMinutes).toBe(Math.ceil(result.charCount / 200));
  });

  it('produces expected reading time for 500 plain text characters', () => {
    const longText = 'a'.repeat(500);
    const result = getReadingStats(longText);
    expect(result.charCount).toBe(500);
    expect(result.readingTimeMinutes).toBe(3);
  });
});
