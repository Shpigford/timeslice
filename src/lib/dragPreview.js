// Create a polished drag preview element
export function setDragPreview(e, label, color) {
  const el = document.createElement('div')
  el.textContent = label
  el.style.cssText = `
    position: fixed;
    top: -1000px;
    left: -1000px;
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 600;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    color: white;
    background: ${color};
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    white-space: nowrap;
    pointer-events: none;
  `
  document.body.appendChild(el)
  e.dataTransfer.setDragImage(el, el.offsetWidth / 2, el.offsetHeight / 2)
  requestAnimationFrame(() => document.body.removeChild(el))
}
