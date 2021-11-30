import { domat } from "./domat.js";



export const formGroup = (formId) => {

    const formParent = domat(formId);
    
    // да намеря всички input елементи
    const formInputCollection = formParent.dom().elements;
    const formGroupCollection = {};
    for(const formInput of formInputCollection) {
        const element = domat(formInput);
        formGroupCollection[element.attr('data-name')] = element;
    }

    return new FormGroup(formGroupCollection);
};

const findSubmitAction = (formGroupCollection) => {

    for(const index in formGroupCollection ) {
        if(formGroupCollection[index].hasAttr('data-submit')) {
            return formGroupCollection[index];
        }
    }
}

class FormGroup {

    constructor(formGroupCollection) {

        this.errorMessage           = {};
        this.formGroupCollection    = formGroupCollection;
        this.submitElement          = findSubmitAction(formGroupCollection);
    }

    get(formElementId) {
        return this.formGroupCollection[formElementId];
    }

    getValue(formElementId) {
        return this.formGroupCollection[formElementId].value();
    }

    __isSubmitable(formElementId) {
        return this.formGroupCollection[formElementId].hasAttr('data-submit');
    }

    __isInputable(formElementId)  {
        return !this.__isSubmitable(formElementId);
    }

    getFormValue() {

        const formGroupValueObject = {};
        for(const index in this.formGroupCollection) {

            if(this.__isInputable(index)) {
                formGroupValueObject[index] = this.getValue(index);
            }
        }

        return formGroupValueObject;
    }

    isValid(formElementId) {

        const element = this.get(formElementId);
        if(element.hasAttr('data-validation-required')) {
            if(element.value().length == 0) {
                this.errorMessage[formElementId] = "Полето е задължително";
                return false;
            }
        }

        if(element.hasAttr('data-validation-minlen')) {

            const validationValue = element.attr('data-validation-minlen');

            if(element.value().length < validationValue) {
                this.errorMessage[formElementId] = `Минимална дължина ${validationValue}`;
                return false;
            }
        }

        if(element.hasAttr('data-validation-email')) {

            const emailValidation = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            if(!emailValidation.test(element.value())) {
                this.errorMessage[formElementId] = `Невалиден E-mail адрес`;
                return false;
            }
        }

        return true;
    }

    validateInput(index) {

        const errorPlaceholder  = domat(`[data-error="${index}"]`);

        if(this.isValid(index)) {

            delete this.errorMessage[index];

            if(errorPlaceholder) {
                errorPlaceholder.html("");
            }

            return;
        }

        const message               = this.errorMessage[index];
        const element               = this.formGroupCollection[index];
        const errorPlaceholderHtml  = `<div data-error="${index}">${message}</div>`;

        if(errorPlaceholder) {
            return errorPlaceholder.html(errorPlaceholderHtml);
        }
        
        element.after(errorPlaceholderHtml);
    }

    validate() {

        for(const index in this.formGroupCollection) {

            if(this.__isInputable(index)) {
                this.validateInput(index);
            }
        }
    }

    isFormValid() {

        this.validate();
        return Object.keys(this.errorMessage).length == 0;
    }

    submit(callback) {

        this.submitElement.on('click', (e) => {

            e.preventDefault();
            callback(this.getFormValue());
        });
    }
}

// да взимам обект съдържащ всички стойности
// да управлявам валидация
// да питам дали формата е валидна
// да изпращам формата