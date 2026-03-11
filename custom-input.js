/* ===== Custom Input Utilities for Blog Animations ===== */
/* Provides validation + parsing for custom array, index, and range inputs */

var CustomInput = (function() {

  /**
   * Parse a comma-separated string into an array of integers.
   * Returns { ok: true, data: [...] } or { ok: false, error: "message" }
   */
  function parseIntArray(str, minLen, maxLen) {
    minLen = minLen || 1;
    maxLen = maxLen || 16;
    str = (str || '').trim();
    if (!str) return { ok: false, error: 'Input is empty' };
    var parts = str.split(/[\s,]+/);
    var arr = [];
    for (var i = 0; i < parts.length; i++) {
      var s = parts[i].trim();
      if (s === '') continue;
      var n = Number(s);
      if (!isFinite(n) || n !== Math.floor(n)) {
        return { ok: false, error: '"' + s + '" is not a valid integer' };
      }
      if (n < -999 || n > 999) {
        return { ok: false, error: 'Values must be between -999 and 999' };
      }
      arr.push(n);
    }
    if (arr.length < minLen) return { ok: false, error: 'Need at least ' + minLen + ' element' + (minLen > 1 ? 's' : '') };
    if (arr.length > maxLen) return { ok: false, error: 'Maximum ' + maxLen + ' elements allowed' };
    return { ok: true, data: arr };
  }

  /**
   * Parse a single integer within [lo, hi].
   */
  function parseInt1(str, lo, hi) {
    str = (str || '').trim();
    if (!str) return { ok: false, error: 'Input is empty' };
    var n = Number(str);
    if (!isFinite(n) || n !== Math.floor(n)) return { ok: false, error: '"' + str + '" is not a valid integer' };
    if (n < lo || n > hi) return { ok: false, error: 'Must be between ' + lo + ' and ' + hi };
    return { ok: true, data: n };
  }

  /**
   * Require array length to be a power of 2.
   */
  function requirePow2(arr) {
    var n = arr.length;
    if (n > 0 && (n & (n - 1)) === 0) return { ok: true };
    return { ok: false, error: 'Array length must be a power of 2 (got ' + n + '). Try 2, 4, 8, or 16 elements.' };
  }

  /**
   * Show an error message near an element. Clears after a few seconds.
   */
  function showError(containerId, msg) {
    var el = document.getElementById(containerId);
    if (!el) return;
    el.textContent = msg;
    el.style.color = '#ef4444';
    el.style.fontWeight = '600';
    clearTimeout(el._errTimer);
    el._errTimer = setTimeout(function() {
      el.textContent = '';
      el.style.color = '';
      el.style.fontWeight = '';
    }, 4000);
  }

  /**
   * Clear error display.
   */
  function clearError(containerId) {
    var el = document.getElementById(containerId);
    if (!el) return;
    el.textContent = '';
    el.style.color = '';
    el.style.fontWeight = '';
  }

  /**
   * Create a standard custom-input widget. Returns the container element.
   * opts: { id, label, placeholder, buttonText, onApply }
   */
  function createWidget(opts) {
    var wrap = document.createElement('div');
    wrap.className = 'custom-input-row';
    wrap.style.cssText = 'display:flex;gap:0.4rem;align-items:center;flex-wrap:wrap;margin:0.5rem 0';

    var label = document.createElement('label');
    label.textContent = opts.label || 'Array:';
    label.style.cssText = 'font-size:0.82rem;font-weight:600;white-space:nowrap';
    wrap.appendChild(label);

    var input = document.createElement('input');
    input.type = 'text';
    input.id = opts.id;
    input.placeholder = opts.placeholder || '1, 3, 5, 7';
    input.style.cssText = 'font-family:Consolas,monospace;font-size:0.82rem;padding:0.3rem 0.5rem;border:1px solid var(--line);border-radius:6px;flex:1;min-width:120px;background:var(--card);color:var(--ink)';
    wrap.appendChild(input);

    var btn = document.createElement('button');
    btn.className = 'anim-btn';
    btn.textContent = opts.buttonText || 'Apply';
    btn.style.cssText += ';font-size:0.78rem;padding:0.3rem 0.7rem';
    btn.addEventListener('click', function() { opts.onApply(input.value); });
    wrap.appendChild(btn);

    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') opts.onApply(input.value);
    });

    var errSpan = document.createElement('div');
    errSpan.id = opts.id + '-err';
    errSpan.style.cssText = 'font-size:0.78rem;width:100%;min-height:1.1rem';
    wrap.appendChild(errSpan);

    return wrap;
  }

  return {
    parseIntArray: parseIntArray,
    parseInt: parseInt1,
    requirePow2: requirePow2,
    showError: showError,
    clearError: clearError,
    createWidget: createWidget
  };
})();
