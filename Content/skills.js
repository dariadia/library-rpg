window.SkillTypes = {
  normal: "normal",
  spicy: "spicy",
  veggie: "veggie",
  fungi: "fungi",
  chill: "chill",
}

window.Skills = {
  "s001": {
    name: "Slice Samurai",
    description: "Skill desc here",
    type: SkillTypes.spicy,
    src: "/images/characters/skills/s001.png",
    icon: "/images/icons/spicy.png",
    actions: [ "saucyStatus", "clumsyStatus", "damage1" ],
  },
  "s002": {
    name: "Bacon Brigade",
    description: "A salty warrior who fears nothing",
    type: SkillTypes.spicy,
    src: "/images/characters/skills/s002.png",
    icon: "/images/icons/spicy.png",
    actions: [ "damage1", "saucyStatus", "clumsyStatus" ],
  },
  "v001": {
    name: "Call Me Kale",
    description: "Skill desc here",
    type: SkillTypes.veggie,
    src: "/images/characters/skills/v001.png",
    icon: "/images/icons/veggie.png",
    actions: [ "damage1" ],
  },
  "v002": {
    name: "Archie Artichoke",
    description: "Skill desc here",
    type: SkillTypes.veggie,
    src: "/images/characters/skills/v001.png",
    icon: "/images/icons/veggie.png",
    actions: [ "damage1" ],
  },
  "f001": {
    name: "Portobello Express",
    description: "Skill desc here",
    type: SkillTypes.fungi,
    src: "/images/characters/skills/f001.png",
    icon: "/images/icons/fungi.png",
    actions: [ "damage1" ],
  },
  "f002": {
    name: "Say Shitake",
    description: "Skill desc here",
    type: SkillTypes.fungi,
    src: "/images/characters/skills/f001.png",
    icon: "/images/icons/fungi.png",
    actions: [ "damage1" ],
  }
}
