window.SkillTypes = {
  normal: "normal",
  observant: "observant",
  quick: "quick on your feet",
  persuasive: "persuasive",
  confident: "confident",
  disoriented: "disoriented",
  sleepy: "sleepy",
  chill: "chill",
  grumpy: "grympy",
  friendly: "friendly"
}

window.Skills = {
  "0obs": {
    name: "Skill: observant",
    isSkillName: true,
    description: "You pay close attention to details.",
    type: SkillTypes.observant,
    src: "/images/icons/notepad.png",
    icon: "/images/icons/notepad.png",
    actions: { [window.Characters.MRS_T]: ["ask_name", "ask_death_gen", "damage1"] },
  },
  "0quick": {
    name: "Skill: quick",
    isSkillName: true,
    description: "Quick thinking. Also, fast running.",
    type: SkillTypes.quick,
    src: "/images/icons/quick.png",
    icon: "/images/icons/quick.png",
    actions: { [window.Characters.MRS_T]: ["ask_death", "ask_ghost", "damage1"] },
  },
  [window.Characters.MRS_T]: {
    name: window.Characters.MRS_T,
    description: "Has no idea what's going on.",
    type: SkillTypes.disoriented,
    src: "/images/characters/skills/s001.png",
    icon: "/images/icons/question-mark.png",
    actions: ["disoriented1", "disoriented2", "sleepy"],
  },
  [window.Characters.KARINA]: {
    name: "Karina Saroyan",
    description: "Grumpy but helpful.",
    type: SkillTypes.grumpy,
    src: "/images/characters/skills/s001.png",
    icon: "/images/icons/question-mark.png",
    actions: ["silent_treatment"],
  },
  [window.Characters.ARYLHAN]: {
    name: "Arylhan Ivanov",
    description: "Friendly but naive.",
    type: SkillTypes.grumpy,
    src: "/images/characters/skills/s001.png",
    icon: "/images/icons/question-mark.png",
    actions: ["chatter", "chatter2"],
  },
}
