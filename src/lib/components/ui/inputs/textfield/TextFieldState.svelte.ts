type Props = {
  value?: string;
  label?: string;
  required?: boolean;
  onfocus?: Callback;
  onblur?: Callback;
  onfocusout?: Callback;
  onclick?: Callback;
};

type Callback = () => void;

/** The state of a text field ([TextField]).  */
export class TextFieldState {
  constructor(props: Props) {
    this.value = props.value;
    this.labelText = `${props.label}${props.required ? '*' : ''}`;
    this.onfocus = props.onfocus;
    this.onblur = props.onblur;
    this.onfocusout = props.onfocusout;
    this.onclick = props.onclick;
  }

  /** The text in the text field. */
  value = $state<string>();

  /** Determines if this is the first time the component is being rendered. */
  firstRender = $state(true);

  /** Determines if the input has focus. */
  isFocused = $state(false);

  /** Determines if the label is floating. */
  isFloated = $derived.by(
    () => this.isFocused || Boolean(this.value && this.value.length > 0)
  );

  /** The label text. */
  labelText = $state();

  private onfocus = $state<Callback>();
  private onblur = $state<Callback>();
  private onfocusout = $state<Callback>();
  private onclick = $state<Callback>();

  /** Sets [isFocused] and calls the provided `onfocus` function. */
  handleOnFocus = () => {
    this.isFocused = true;
    if (this.firstRender) {
      this.firstRender = false;
    }
    this.onfocus?.();
  };

  /** Unsets [isFocused] and calls the provided `onblur` function. */
  handleOnBlur = () => {
    this.isFocused = false;
    this.onblur?.();
  };

  /** Unsets [isFocused] and calls the provided `onfocusout` function. */
  handleOnFocusOut = () => {
    this.isFocused = false;
    this.onfocusout?.();
  };

  /** Sets [isFocused] and calls the provided `onclick` function. */
  handleOnClick = () => {
    this.isFocused = true;
    this.onclick?.();
  };
}
