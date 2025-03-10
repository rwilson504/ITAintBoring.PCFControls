import {IInputs, IOutputs} from "./generated/ManifestTypes";

export class ValidatedInputControl implements ComponentFramework.StandardControl<IInputs, IOutputs> {
  // Value of the field is stored and used inside the control 
  private _value: string;
  // RegEx to test against
  private _regEx: RegExp | null = null;
  // Error message to dipslay if RegEx test fails
  private _errorMessage: string;
  // Show error if the value of the input field is emty
  private _showErrorOnEmptyValue: boolean;
  // PCF framework delegate which will be assigned to this object which would be called whenever any update happens. 
  private _notifyOutputChanged: () => void;
  // label element created as part of this control
  private labelElement: HTMLLabelElement;
  // input element that is used to create the range slider
  private inputElement: HTMLInputElement;
  // Reference to the control container HTMLDivElement
  // This element contains all elements of our custom control example
  private _container: HTMLDivElement;
  // Reference to ComponentFramework Context object
  private _context: ComponentFramework.Context<IInputs>;
  
  private _blurHandler: EventListenerOrEventListenerObject;
  private _inputHandler: EventListenerOrEventListenerObject;
  
  private _isError: boolean;

  constructor() {
  }
 
  public setErrorState(value: string)
  {
    var valid = ((!value && !this._showErrorOnEmptyValue) || this._regEx == null || this._regEx.test(value));
    this.labelElement.innerHTML = valid ? "" : this._errorMessage;
    return this._isError = !valid;    
  }

  public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container: HTMLDivElement) {
	  debugger;
    this._context = context;
    this._container = document.createElement("div");
    this._notifyOutputChanged = notifyOutputChanged;
    this._blurHandler = this.blurHandler.bind(this);
	  this._inputHandler = this.inputHandler.bind(this);
    // creating HTML elements for the input type range and binding it to the function which refreshes the control data
    this.inputElement = document.createElement("input");
    this.inputElement.setAttribute("type", "text");
    this.inputElement.addEventListener("blur", this._blurHandler);
	  this.inputElement.addEventListener("input", this._inputHandler);
    this._value = context.parameters.value.raw;
	
	if(context.parameters.regEx)
	   this._regEx = new RegExp(context.parameters.regEx.raw);
   
  if(context.parameters.errorMessage)
    this._errorMessage = context.parameters.errorMessage.raw;
    
  this._showErrorOnEmptyValue = (context.parameters.showErrorOnEmptyValue && context.parameters.showErrorOnEmptyValue.raw && context.parameters.showErrorOnEmptyValue.raw.toLowerCase() === 'false') ? false : true;

  var currentValue = context.parameters.value.formatted || "";
  this.inputElement.setAttribute("value", currentValue);
	this.labelElement = document.createElement("label");
  
	this.setErrorState(currentValue);
    // appending the HTML elements to the control's HTML container element.
    this._container.appendChild(this.inputElement);
    this._container.appendChild(this.labelElement);
    container.appendChild(this._container);
  }

  /**
  * Updates the values to the internal value variable we are storing and also updates the html label that displays the value
  * @param context : The "Input Properties" containing the parameters, control metadata and interface functions
  */

  public blurHandler(evt: Event): void {
	var tempValue = (this.inputElement.value as any) as string;
	if(!this.setErrorState(tempValue))
	{
		this._notifyOutputChanged();
		this._value = tempValue;
	}
  }
  
  public inputHandler(evt: Event): void {
	var tempValue = (this.inputElement.value as any) as string;
	if(this._isError && !this.setErrorState(tempValue))
	{
		this._notifyOutputChanged();
		this._value = tempValue;
	}
  }

  public updateView(context: ComponentFramework.Context<IInputs>): void {
    // storing the latest context from the control.
    this._value = context.parameters.value.raw;
    this._context = context;
    this.inputElement.setAttribute("value",context.parameters.value.formatted ? context.parameters.value.formatted : "");
  }

  public getOutputs(): IOutputs {
    return {
      value: this._value
    };
  }

  public destroy() {
    this.inputElement.removeEventListener("input", this._inputHandler);
	this.inputElement.removeEventListener("blur", this._blurHandler);
  }
}