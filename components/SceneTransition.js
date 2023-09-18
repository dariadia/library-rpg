class SceneTransition {
  constructor({ lowShade, shadeOptions, noTransition }) {
    this.element = null
    this.lowShade = lowShade
    this.shadeOptions = shadeOptions
    this.noTransition = noTransition
  }
  createElement() {
    this.element = document.createElement("div")
    this.element.classList.add("SceneTransition")
  }

  fadeOut() {
    this.element.classList.add("fade-out")
    this.element.addEventListener("animationend", () => {
      this.element.remove()
    }, { once: true })
  }

  init(container, callback) {
    if (this.noTransition) return callback()
    this.createElement()
    if (this.lowShade) {
      this.element.classList.add("low-shade")
      this.element.style = this.shadeOptions
    }
    container.appendChild(this.element)
    this.element.addEventListener("animationend", () => {
      callback()
    }, { once: true })
  }
}
