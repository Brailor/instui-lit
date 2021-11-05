import {LitElement, html, css, svg} from 'lit';
import {customElement, property} from 'lit/decorators.js';

const icons = {
  arrow_down: svg`<svg viewBox="0 0 1920 1920" version="1.1" xmlns="http://www.w3.org/2000/svg">
  <path transform="matrix(0 1 1 0 .067 -.067)" d="M568.129648 0.0124561278L392 176.142104 1175.86412 960.130789 392 1743.87035 568.129648 1920 1528.24798 960.130789z" stroke="none" stroke-width="1" fill-rule="evenodd"/>
</svg>`,
  arrow_end: svg`<svg viewBox="0 0 1920 1920" version="1.1" xmlns="http://www.w3.org/2000/svg">
    <path d="M568.129648 0.0124561278L392 176.142104 1175.86412 960.130789 392 1743.87035 568.129648 1920 1528.24798 960.130789z" stroke="none" stroke-width="1" fill-rule="evenodd"/>
</svg>

`,
};

/**
 * Very basic toggle group component.
 * @slot the detail for the toggle detail goes into the slot
 * @event toggle fires when the toggle group toggles
 */
@customElement('inst-toggle-group')
export class ToggleGroup extends LitElement {
  static override styles = css`
    :host {
      font-family: LatoWeb, Lato, 'Helvetica Neue', Helvetica, Arial, sans-serif;
    }
    .container {
      border-radius: 0.25rem;
      border-width: 0.0625rem;
      box-sizing: border-box;
      max-width: 100%;
      overflow: visible;
      display: block;
      color: rgb(45, 59, 69);
      background: rgb(255, 255, 255);
      border-style: solid;
      border-color: rgb(199, 205, 209);
    }
    .flex-container {
      padding: 0.75rem 0.75rem 0.75rem 0.5rem;
      max-width: 100%;
      overflow: visible;
      display: flex;
      box-sizing: border-box;
      -webkit-box-align: center;
      align-items: center;
      -webkit-box-pack: start;
      justify-content: flex-start;
      flex-direction: row;
    }
    .flex-item {
      max-width: 100%;
      overflow: visible;
      box-sizing: border-box;
      min-width: 0.0625rem;
      flex-shrink: 0;
    }
    span {
      display: 'block';
    }
    svg {
      width: 1rem;
      height: 1rem;
    }
    button {
      box-sizing: border-box;
      max-width: 100%;
      overflow: visible;
      display: inline-block;
      vertical-align: middle;
      color: rgb(45, 59, 69);
      background: none;
      position: relative;
      appearance: none;
      text-decoration: none;
      touch-action: manipulation;
    }
    .details {
      box-sizing: border-box;
      max-width: 100%;
      overflow: visible;
      display: block;
      border-style: solid;
      border-color: rgb(199, 205, 209);
    }
    .details__item {
      box-sizing: border-box;
      max-width: 100%;
      overflow: visible;
      display: block;
    }
  `;
  @property({type: String})
  summary!: string;

  @property({type: Boolean, reflect: true})
  toggled = false;

  private _click(e: PointerEvent) {
    this.toggled = !this.toggled;
    this.dispatchEvent(
      new CustomEvent('toggle', {composed: true, bubbles: true})
    );
  }
  private renderIcon() {
    return html`
      <button
        @click="${this._click}"
        style="margin: 0px; padding: 0px; border-radius: 0.25rem; border-width: 0px; width: auto; cursor: pointer;"
      >
        ${this.toggled ? icons.arrow_down : icons.arrow_end}
      </button>
    `;
  }
  private renderDetails() {
    return html`<span class="details" style="border-width: 0.0625rem 0px 0px;">
      <span class="details__item" style="padding: 0.75rem;">
        <slot></slot>
      </span>
    </span>`;
  }
  protected override render() {
    return html` <span class="container">
      <span class="flex-container">
        <span class="flex-item">${this.renderIcon()}</span>
        <span style="padding: 0px 0px 0px 0.5rem" class="flex-item"
          >${this.summary}</span
        >
      </span>
      ${this.toggled ? this.renderDetails() : html`<span></span>`}
    </span>`;
  }
}
