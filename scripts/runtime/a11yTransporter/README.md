## Functions

<dl>
<dt><a href="#transportAriaAttributes">transportAriaAttributes</a></dt>
<dd><p>Transfers all ARIA attributes from the host element to the target element.
This function allows optional removal of the original attributes and the ability to ignore specific attributes.</p>
</dd>
<dt><a href="#transportRoleAttribute">transportRoleAttribute</a></dt>
<dd><p>Transfers the &#39;role&#39; attribute from the host element to the target element.
This function can optionally remove the original attribute from the host after transport.</p>
</dd>
<dt><a href="#transportTabIndexAttribute">transportTabIndexAttribute</a></dt>
<dd><p>Transfers the &#39;tabindex&#39; attribute from the host element to the target element.
This function can optionally remove the original attribute from the host after transport.</p>
</dd>
<dt><a href="#transportAllA11yAttributes">transportAllA11yAttributes</a></dt>
<dd><p>Transfers all accessibility-related attributes (ARIA, role, tabindex) from the host element to the target element.
This function allows optional removal of the original attributes and the ability to ignore specific attributes.</p>
</dd>
</dl>

<a name="transportAriaAttributes"></a>

## transportAriaAttributes
Transfers all ARIA attributes from the host element to the target element.
This function allows optional removal of the original attributes and the ability to ignore specific attributes.

**Kind**: global constant  
**Returns**: <code>function</code> - Function to detach the specific matcher and target pairing.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| params | <code>Object</code> |  | The parameters object. |
| params.host | <code>HTMLElement</code> |  | The host element to observe. |
| params.target | <code>HTMLElement</code> |  | The target element to receive attributes. |
| [params.removeOriginal] | <code>boolean</code> | <code>true</code> | Whether to remove original attributes. |
| [params.ignore] | <code>Array.&lt;String&gt;</code> |  | The list of attributes not to transport. |

<a name="transportRoleAttribute"></a>

## transportRoleAttribute
Transfers the 'role' attribute from the host element to the target element.
This function can optionally remove the original attribute from the host after transport.

**Kind**: global constant  
**Returns**: <code>function</code> - Function to detach the specific matcher and target pairing.} param.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| params | <code>Object</code> |  | The parameters object. |
| params.host | <code>HTMLElement</code> |  | The host element to observe. |
| params.target | <code>HTMLElement</code> |  | The target element to receive attributes. |
| [params.removeOriginal] | <code>boolean</code> | <code>true</code> | Whether to remove original attributes. |

<a name="transportTabIndexAttribute"></a>

## transportTabIndexAttribute
Transfers the 'tabindex' attribute from the host element to the target element.
This function can optionally remove the original attribute from the host after transport.

**Kind**: global constant  
**Returns**: <code>function</code> - Function to detach the specific matcher and target pairing.} param.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| params | <code>Object</code> |  | The parameters object. |
| params.host | <code>HTMLElement</code> |  | The host element to observe. |
| params.target | <code>HTMLElement</code> |  | The target element to receive attributes. |
| [params.removeOriginal] | <code>boolean</code> | <code>true</code> | Whether to remove original attributes. |

<a name="transportAllA11yAttributes"></a>

## transportAllA11yAttributes
Transfers all accessibility-related attributes (ARIA, role, tabindex) from the host element to the target element.
This function allows optional removal of the original attributes and the ability to ignore specific attributes.

**Kind**: global constant  
**Returns**: <code>function</code> - Function to detach the specific matcher and target pairing.} param.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| params | <code>Object</code> |  | The parameters object. |
| params.host | <code>HTMLElement</code> |  | The host element to observe. |
| params.target | <code>HTMLElement</code> |  | The target element to receive attributes. |
| [params.removeOriginal] | <code>boolean</code> | <code>true</code> | Whether to remove original attributes. |
| [params.ignore] | <code>Array.&lt;String&gt;</code> |  | The list of attributes not to transport. |

