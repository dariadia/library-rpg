class MobileKeyboard {
  constructor(){}
  createElement() {
    this.element = document.createElement("div")
    this.element.classList.add("MobileKeyboard")
    this.element.innerHTML = `
    <button class="MobileKey left">➤</button>
    <button class="MobileKey right">➤</button>
    <button class="MobileKey up">➤</button>
    <button class="MobileKey down">➤</button>
    `
    document.querySelector(".game-container").appendChild(this.element)
  }
  init() {
    this.createElement()
  }
}
