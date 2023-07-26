class Prompt {
  constructor({ options, onComplete, withBackOption }) {
    this.options = options
    this.onComplete = onComplete
    this.element = null
    this.withBackOption = withBackOption
  }

  menuSubmit(action = null) {
    this.keyboardMenu?.end()
    this.onComplete()
  }

  getOptions() {
    const backOption = {
      label: "Go Back",
      description: "Return to previous page",
      handler: () => {
        this.keyboardMenu.setOptions(this.getPages())
      }
    };
    let options = this.options.map(option => ({
      label: option.text,
      description: `Choose what to do: ${option.text}`,
      handler: () => {
        this.menuSubmit()
      }
    }))

    if (this.withBackOption) options.push(backOption)

    return options
  }

  createActionsMenu(container) {
    this.element = document.createElement("div")
    this.element.classList.add("Prompt_actions")
    this.keyboardMenu = new KeyboardMenu({}, true);
    this.keyboardMenu.init(this.element);
    this.keyboardMenu.setOptions(this.getOptions())
    container.appendChild(this.element)
  }

  done() {
    this.element.remove()
    this.actionListener.unbind()
    this.onComplete()
  }

  init(container) {
    this.createActionsMenu(container)
    container.appendChild(this.element)
  }
}
