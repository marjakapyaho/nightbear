// https://developer.mozilla.org/en-US/docs/Web/API/Element/closest#Polyfill
((Element: any) => {
  if (!Element.prototype.matches) {
    Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
  }
  if (!Element.prototype.closest) {
    Element.prototype.closest = function(s: any) {
      var el = this;
      do {
        if (el.matches(s)) return el;
        el = el.parentElement || el.parentNode;
      } while (el !== null && el.nodeType === 1);
      return null;
    };
  }
})(Element);

// All files must be modules when the '--isolatedModules' flag is provided ts(1208)
export default null;
