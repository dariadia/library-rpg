window.SkillTypes = {
  normal: "normal",
  observant: "observant",
  quick: "quick on your feet",
  persuasive: "persuasive",
  confident: "confident",
  disoriented: "disoriented",
  sleepy: "sleepy",
  chill: "chill",
}

window.Skills = {
  "0obs": {
    description: "You pay close attention to details.",
    type: SkillTypes.observant,
    src: "/images/icons/notepad.png",
    icon: "/images/icons/notepad.png",
    actions: [ "ask_name", "ask_death_gen", "damage1" ],
  },
  "0quick": {
    description: "Quick thinking. Also, fast running.",
    type: SkillTypes.quick,
    src: "/images/icons/quick.png",
    icon: "/images/icons/quick.png",
    actions: [ "ask_death", "ask_ghost", "damage1" ],
  },
  "mrsT": {
    name: "Mrs T (widowed)",
    description: "Has no idea what's going on.",
    type: SkillTypes.disoriented,
    src: "/images/characters/skills/s001.png",
    icon: "/images/icons/question-mark.png",
    actions: [ "disoriented1", "disoriented2", "sleepy" ],
  },
  "s001": {
    name: "some name",
    description: "Skill desc here",
    type: SkillTypes.normal,
    src: "/images/characters/skills/s001.png",
    icon: "/images/icons/spicy.png",
    actions: [ "confidentStatus", "sleepyStatus", "damage1" ],
  },
  "s002": {
    name: "Bacon Brigade",
    description: "A salty warrior who fears nothing",
    type: SkillTypes.normal,
    src: "/images/characters/skills/s002.png",
    icon: "/images/icons/spicy.png",
    actions: [ "damage1", "confidentStatus", "sleepyStatus" ],
  },
  "v001": {
    name: "Call Me Kale",
    description: "Skill desc here",
    type: SkillTypes.normal,
    src: "/images/characters/skills/v001.png",
    icon: "/images/icons/veggie.png",
    actions: [ "damage1" ],
  },
  "v002": {
    name: "Archie Artichoke",
    description: "Skill desc here",
    type: SkillTypes.normal,
    src: "/images/characters/skills/v001.png",
    icon: "/images/icons/veggie.png",
    actions: [ "damage1" ],
  },
  "f001": {
    name: "Portobello Express",
    description: "Skill desc here",
    type: SkillTypes.normal,
    src: "/images/characters/skills/f001.png",
    icon: "/images/icons/fungi.png",
    actions: [ "damage1" ],
  },
  "f002": {
    name: "some name",
    description: "Skill desc here",
    type: SkillTypes.normal,
    src: "/images/characters/skills/f001.png",
    icon: "/images/icons/fungi.png",
    actions: [ "damage1" ],
  }
}
