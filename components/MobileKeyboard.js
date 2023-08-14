class MobileKeyboard {
  constructor() {
    this.container = document.querySelector(".game-container")
  }
  createElement() {
    this.element = document.createElement("div")
    this.element.classList.add("MobileKeyboard")
    this.element.innerHTML = `
    <button id="left" class="MobileKey left">➤</button>
    <button id="right" class="MobileKey right">➤</button>
    <button id="enter" class="MobileKey enter">ok</button>
    <button id="up" class="MobileKey up">➤</button>
    <button id="down" class="MobileKey down">➤</button>
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
    this.container.classList.add("mobile")
    this.createElement()
  }
}
