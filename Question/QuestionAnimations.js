window.QuestionAnimations = {
  async spin(event, onComplete) {
    const element = event.caster.skillElement;
    const animationClassName = event.caster.team === "player" ? "question-spin-right" : "question-spin-left";
    element.classList.add(animationClassName);

    //Remove class when animation is fully complete
    element.addEventListener("animationend", () => {
      element.classList.remove(animationClassName);
    }, { once:true });

    //Continue question cycle right around when the skills collide
    await utils.wait(100);
    onComplete();
  },

  async glob(event, onComplete) {
    const {caster} = event;
    let div = document.createElement("div");
    div.classList.add("glob-orb");
    div.classList.add(caster.team === "player" ? "question-glob-right" : "question-glob-left");

    div.innerHTML = (`
      <svg viewBox="0 0 32 32" width="32" height="32">
        <circle cx="16" cy="16" r="16" fill="${event.color}" />
      </svg>
    `);

    //Remove class when animation is fully complete
    div.addEventListener("animationend", () => {
      div.remove();
    });

    //Add to scene
    document.querySelector(".Question").appendChild(div);

    await utils.wait(820);
    onComplete();
  }
}
