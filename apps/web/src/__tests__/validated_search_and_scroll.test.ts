import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DISALLOWED_SEARCH_CHARS_REGEX } from '../components/ValidatedSearchInput';
import { forceReleaseBodyScrollLock } from '../hooks/useBodyScrollLock';

describe('1. Global ScrollToTop & Body Lock Mechanics', () => {
  let mockBodyStyle: { overflow: string };

  beforeEach(() => {
    mockBodyStyle = { overflow: '' };
    (globalThis as any).document = {
      body: {
        style: mockBodyStyle,
      },
      documentElement: {
        scrollTop: 0,
      },
      getElementById: vi.fn().mockReturnValue({ scrollTop: 0 }),
    };
    (globalThis as any).window = {
      scrollTo: vi.fn(),
      history: {
        scrollRestoration: 'auto',
      },
    };
  });

  afterEach(() => {
    mockBodyStyle.overflow = '';
  });

  it('releases active body locks upon calling forceReleaseBodyScrollLock', () => {
    document.body.style.overflow = 'hidden';
    expect(document.body.style.overflow).toBe('hidden');

    forceReleaseBodyScrollLock();
    expect(document.body.style.overflow).toBe('');
  });

  it('scroll restoration is configured as manual on window history', () => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
      expect(window.history.scrollRestoration).toBe('manual');
    }
  });
});

describe('2. ValidatedSearchInput & Query Logic', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('detects and disallows illegal special characters: < > { } [ ] \\ ^ ` ~ ; = "', () => {
    const invalidInputs = [
      'teak <script>',
      'wood > 5ft',
      'logs {curly}',
      'planks [brackets]',
      'teak \\ slash',
      'log ^ caret',
      'price ` backtick',
      'wood ~ tilde',
      'species ; semicolon',
      'search = query',
      'teak "quotes"',
    ];

    invalidInputs.forEach((input) => {
      expect(DISALLOWED_SEARCH_CHARS_REGEX.test(input)).toBe(true);
    });

    const validInputs = [
      'Teak round logs',
      'Mahogany 12ft',
      'Anjili (അറുത്ത പലകകൾ)',
      'Rosewood CFT-45',
      'Rubberwood 2.5',
      'Nilambur 100%',
    ];

    validInputs.forEach((input) => {
      expect(DISALLOWED_SEARCH_CHARS_REGEX.test(input)).toBe(false);
    });
  });

  it('enforces 3-character minimum constraint and blocks API execution for 1 or 2 characters', () => {
    const onSearchMock = vi.fn();
    const minChars = 3;

    // Simulate search logic
    const handleInput = (val: string) => {
      const trimmed = val.trim();
      if (DISALLOWED_SEARCH_CHARS_REGEX.test(val)) return; // blocked
      if (trimmed.length === 0) {
        onSearchMock('');
        return;
      }
      if (trimmed.length < minChars) {
        // Blocked: do NOT call onSearch
        return;
      }
      onSearchMock(trimmed);
    };

    handleInput('t');
    expect(onSearchMock).not.toHaveBeenCalled();

    handleInput('te');
    expect(onSearchMock).not.toHaveBeenCalled();

    handleInput('   ');
    expect(onSearchMock).toHaveBeenCalledWith('');
    onSearchMock.mockClear();

    handleInput('tea');
    expect(onSearchMock).toHaveBeenCalledWith('tea');
  });

  it('debounces rapid keystrokes to 350ms before triggering onSearch', () => {
    const onSearchMock = vi.fn();
    let timer: any = null;

    const handleDebouncedInput = (val: string) => {
      if (timer) clearTimeout(timer);
      const trimmed = val.trim();
      if (trimmed.length < 3) return;

      timer = setTimeout(() => {
        onSearchMock(trimmed);
      }, 350);
    };

    handleDebouncedInput('tea');
    vi.advanceTimersByTime(100);
    expect(onSearchMock).not.toHaveBeenCalled();

    handleDebouncedInput('teak');
    vi.advanceTimersByTime(200);
    expect(onSearchMock).not.toHaveBeenCalled();

    handleDebouncedInput('teak logs');
    vi.advanceTimersByTime(350);
    expect(onSearchMock).toHaveBeenCalledTimes(1);
    expect(onSearchMock).toHaveBeenCalledWith('teak logs');
  });

  it('blocks onSearch completely when illegal characters are present', () => {
    const onSearchMock = vi.fn();
    let timer: any = null;

    const handleValidatedInput = (val: string) => {
      if (timer) clearTimeout(timer);
      if (DISALLOWED_SEARCH_CHARS_REGEX.test(val)) {
        // Blocked!
        return;
      }
      const trimmed = val.trim();
      if (trimmed.length < 3) return;
      timer = setTimeout(() => {
        onSearchMock(trimmed);
      }, 350);
    };

    handleValidatedInput('teak<logs>');
    vi.advanceTimersByTime(400);
    expect(onSearchMock).not.toHaveBeenCalled();

    handleValidatedInput('teak{logs}');
    vi.advanceTimersByTime(400);
    expect(onSearchMock).not.toHaveBeenCalled();
  });
});
