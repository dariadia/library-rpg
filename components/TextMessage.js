const MILOS_JOKES = [
  `What room does a ghost not need in a house? A living room. Aha-ha! Get it? 'Cause they're dead!`,
  `When do ghosts drink coffee? In the moaning. Ugh, I'd kill for a good cup for breakfast...`,
  `Do you have any cigarettes? I can't smoke but I sure can smell!`,
  `Rakija is my medicine. You don't happen to have any, do you?..`,
  `Boo Felicia`,
  `My ma made the best rakija. Bre... I miss those days.`,
  `What kind of streets do ghosts haunt? Dead ends.`,
  `Do you want to hear a ghost joke? That’s the spirit.`,
]

const getRandomJoke = (character) => {
  switch (character) {
    case MILOS: {
      return MILOS_JOKES[Math.floor(Math.random() * (MILOS_JOKES.length))] 
    }
  }
}

class TextMessage {
  constructor({ text, character, onComplete, sayRandom }) {
    this.text = text
    this.character = character
    this.onComplete = onComplete
    this.element = null
    this.sayRandom = sayRandom
  }

  createElement() {
    this.element = document.createElement("div")
    this.element.classList.add("TextMessage")

    this.element.innerHTML = (`
      <p class="TextMessage_p"></p>
      <button class="TextMessage_button">Next</button>
    `)

    if (this.character) {
      const characterBox = document.createElement("div")
      characterBox.classList.add("TextMessage_character")
      characterBox.innerHTML = `<div class="TextMessage_character-name">${this.character?.name}<img class="TextMessage_character-avatar" src="${this.character?.avatar}" alt="${this.character?.name} speaking" /></div>`

      this.element.insertBefore(characterBox, this.element.firstChild)
    }

    this.revealingText = new RevealingText({
      element: this.element.querySelector(".TextMessage_p"),
      text: this.sayRandom ? getRandomJoke(this.character.id) : this.text
    })

    this.element.querySelector("button").addEventListener("click", () => {
      this.done()
    })

    this.actionListener = new KeyPressListener("Enter", () => {
      this.done()
    })
  }

  done() {
    if (this.revealingText.isDone) {
      this.element.remove()
      this.actionListener.unbind()
      this.onComplete()
    } else this.revealingText.warpToDone()
  }

  init(container) {
    this.createElement()
    container.appendChild(this.element)
    this.revealingText.init()
  }
}
