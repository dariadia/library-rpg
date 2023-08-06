class Combatant {
  constructor(config, question) {
    Object.keys(config).forEach(key => {
      this[key] = config[key];
    })
    this.hp = typeof(this.hp) === "undefined" ? this.maxHp : this.hp;
    this.question = question;
  }

  get hpPercent() {
    const percent = this.hp / this.maxHp * 100;
    return percent > 0 ? percent : 0;
  }

  get xpPercent() {
    return this.xp / this.maxXp * 100;
  }

  get isActive() {
    return this.question?.activeCombatants[this.team] === this.id;
  }

  get givesXp() {
    return this.level * 20;
  }

  createElement() {
    this.hudElement = document.createElement("div");
    this.hudElement.classList.add("Combatant");
    this.hudElement.setAttribute("data-combatant", this.id);
    this.hudElement.setAttribute("data-team", this.team);
    this.hudElement.innerHTML = (`
      <p class="Combatant_name">${this.name}</p>
      <p class="Combatant_level"></p>
      <div class="Player_crop">
        <img class="Player_notepad" alt="${this.type}" src="${this.icon}" />
      </div>
      <img class="Combatant_type" src="${this.icon}" alt="${this.type}" />
      <svg viewBox="0 0 26 3" class="Player_time-container">
        <rect x=0 y=0 width="0%" height=1 fill="rgba(255,215,0,0.9)" />
        <rect x=0 y=1 width="0%" height=2 fill="rgba(255,215,0,1)" />
      </svg>
      <svg viewBox="0 0 26 2" class="Player_clues-container">
        <rect x=0 y=0 width="0%" height=1 fill="#ffd76a" />
        <rect x=0 y=1 width="0%" height=1 fill="#ffc934" />
      </svg>
      <p class="Combatant_status"></p>
    `);

    this.hpFills = this.hudElement.querySelectorAll(".Player_time-container > rect");
    this.xpFills = this.hudElement.querySelectorAll(".Player_clues-container > rect");
  }

  update(changes={}) {
    //Update anything incoming
    Object.keys(changes).forEach(key => {
      this[key] = changes[key]
    });

    this.hudElement.setAttribute("data-active", this.isActive);
    this.hpFills.forEach(rect => rect.style.width = `${this.hpPercent}%`)
    this.xpFills.forEach(rect => rect.style.width = `${this.xpPercent}%`)
    this.hudElement.querySelector(".Combatant_level").innerText = this.level;
    const statusElement = this.hudElement.querySelector(".Combatant_status");
    if (this.status) {
      statusElement.innerText = this.status.type;
      statusElement.style.display = "block";
    } else {
      statusElement.innerText = "";
      statusElement.style.display = "none";
    }
  }

  getReplacedEvents(originalEvents) {

    if (this.status?.type === "clumsy" && utils.randomFromArray([true, false, false])) {
      return [
        { type: "textMessage", text: `${this.name} flops over!` },
      ]
    }

    return originalEvents;
  }

  getPostEvents() {
    switch (this.status?.type) {
      case "confident": {
        return [
          { type: "textMessage", text: "Feelin' confident!" },
          { type: "stateChange", recover: 5, onCaster: true }
        ]
      }
      default:
        return []
    }
  }

  decrementStatus() {
    if (this.status?.expiresIn > 0) {
      this.status.expiresIn -= 1;
      if (this.status.expiresIn === 0) {
        this.update({
          status: null
        })
        return {
          type: "textMessage",
          text: "Status expired!"
        }
      }
    }
    return null;
  }

  init(container) {
    this.createElement();
    container.appendChild(this.hudElement);
    this.update();
  }

}
