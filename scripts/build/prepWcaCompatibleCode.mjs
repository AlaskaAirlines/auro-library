export default (code, sourcePath) => {
  const defaultTag = (code.match(/static register\(name \= (.+)\)/) || code.match(/customElements.get\((.+?)\)/))[1];
  const className = code.match(/export class (.+) extends/)?.[1];
  const classDesc = code.match(/\/\*\*((.|\n)*?)(\*\n|\*\/)/)?.[1] || '';

  if (!defaultTag || !className) {
    return code;
  }
  return `
import { ${className} } from '${sourcePath}';

/**${classDesc}*/
class ${className}WCA extends ${className} {}

if (!customElements.get(${defaultTag})) {
  customElements.define(${defaultTag}, ${className}WCA);
}
`;
};
