class MobileKeyboard {
  constructor() {
    this.container = document.querySelector(".game-container")
  }
  createElement() {
    this.element = document.createElement("div")
    this.element.classList.add("MobileKeyboard")
    this.element.innerHTML = `
    <button class="MobileKey left">➤</button>
    <button class="MobileKey right">➤</button>
    <button class="MobileKey up">➤</button>
    <button class="MobileKey down">➤</button>
    `
    this.show()
  }
  hide() {
    this.element.remove()
  }
  show() {
    this.container.appendChild(this.element)
  }
  init() {
    document.querySelector(".how-to-play").remove()
    this.createElement()
  }
}
