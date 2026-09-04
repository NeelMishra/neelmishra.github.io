(function () {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';
  var COLOR = {
    green: '#0a8f6a',
    blue: '#3a7bd5',
    gold: '#c98a2b',
    red: '#b83a3a',
    violet: '#7a5cc4',
    gray: '#9eaaa4',
    line: '#d8dedb',
    ink: '#2d3a34',
    muted: '#6b7a72',
    paleGreen: 'rgba(10,143,106,0.14)',
    paleBlue: 'rgba(58,123,213,0.14)',
    paleGold: 'rgba(201,138,43,0.14)',
    paleRed: 'rgba(184,58,58,0.13)',
    paleViolet: 'rgba(122,92,196,0.14)'
  };

  function byId(id) {
    return document.getElementById(id);
  }

  function setText(id, value) {
    var el = byId(id);
    if (el) el.textContent = value;
  }

  function svgEl(name, attrs) {
    var el = document.createElementNS(NS, name);
    Object.keys(attrs || {}).forEach(function (key) {
      el.setAttribute(key, attrs[key]);
    });
    return el;
  }

  function clear(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  function rect(parent, x, y, w, h, fill, stroke, radius) {
    var el = svgEl('rect', {
      x: x, y: y, width: Math.max(0, w), height: Math.max(0, h),
      rx: radius === undefined ? 4 : radius,
      fill: fill || 'none'
    });
    if (stroke) {
      el.setAttribute('stroke', stroke);
      el.setAttribute('stroke-width', 1.2);
    }
    parent.appendChild(el);
    return el;
  }

  function line(parent, x1, y1, x2, y2, color, width, dash) {
    var attrs = {
      x1: x1, y1: y1, x2: x2, y2: y2,
      stroke: color || COLOR.gray,
      'stroke-width': width || 1.4,
      'stroke-linecap': 'round'
    };
    if (dash) attrs['stroke-dasharray'] = dash;
    var el = svgEl('line', attrs);
    parent.appendChild(el);
    return el;
  }

  function label(parent, x, y, value, color, size, anchor, weight) {
    var el = svgEl('text', {
      x: x, y: y,
      fill: color || COLOR.muted,
      'font-family': 'Manrope, sans-serif',
      'font-size': size || 11,
      'font-weight': weight || 500,
      'text-anchor': anchor || 'middle'
    });
    el.textContent = value;
    parent.appendChild(el);
    return el;
  }

  function arrowMarker(svg, id, color) {
    var defs = svgEl('defs', {});
    var marker = svgEl('marker', {
      id: id, viewBox: '0 0 10 10', refX: 9, refY: 5,
      markerWidth: 6, markerHeight: 6, orient: 'auto-start-reverse'
    });
    marker.appendChild(svgEl('path', { d: 'M 0 0 L 10 5 L 0 10 z', fill: color }));
    defs.appendChild(marker);
    svg.appendChild(defs);
  }

  function bytes(value) {
    var units = ['B', 'KB', 'MB', 'GB', 'TB'];
    var i = 0;
    while (value >= 1024 && i < units.length - 1) { value /= 1024; i++; }
    return value.toFixed(value >= 100 || i === 0 ? 0 : value >= 10 ? 1 : 2) + ' ' + units[i];
  }

  function si(value) {
    var units = [['T', 1e12], ['G', 1e9], ['M', 1e6], ['K', 1e3]];
    for (var i = 0; i < units.length; i++) {
      if (value >= units[i][1]) {
        var v = value / units[i][1];
        return v.toFixed(v >= 100 ? 0 : v >= 10 ? 1 : 2) + units[i][0];
      }
    }
    return value.toFixed(0);
  }

  window.DT = {
    COLOR: COLOR,
    byId: byId,
    setText: setText,
    svgEl: svgEl,
    clear: clear,
    rect: rect,
    line: line,
    label: label,
    arrowMarker: arrowMarker,
    bytes: bytes,
    si: si
  };
})();
