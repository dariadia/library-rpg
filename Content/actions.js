window.Actions = {
  ask_name: {
    name: "Ask for her name",
    description: "it's friendly... right?",
    success: [
      { type: "textMessage", text: "So. What's your name?"},
      { type: "stateChange", status: { type: "disoriented", expiresIn: 3 } },
      { type: "stateChange", damage: 5}
    ]
  },
  ask_death: {
    name: "Ask how she died",
    description: "because you're curious",
    success: [
      { type: "textMessage", text: "How did you die?"},
      { type: "stateChange", damage: 10 }
    ]
  },
  ask_death_gen: {
    name: "Ask about death in general",
    description: "because you're curious",
    success: [
      { type: "textMessage", text: "How does one die in a library? Does your soul stay here forever?"},
      { type: "stateChange", damage: 10 }
    ]
  },
  ask_ghost: {
    name: "Ask if she's a ghost",
    description: "because you can",
    success: [
      { type: "textMessage", text: "{CASTER} uses {ACTION}"},
      { type: "stateChange", damage: 10}
    ]
  },
  damage1: {
    name: "walk through her",
    description: "because you can",
    success: [
      { type: "textMessage", text: "{CASTER} uses {ACTION}"},
      { type: "stateChange", damage: 10}
    ]
  },
  confidentStatus: {
    name: "Tomato Squeeze",
    description: "Applies the confident status",
    targetType: "friendly",
    success: [
      { type: "textMessage", text: "{CASTER} uses {ACTION}!"},
      { type: "stateChange", status: { type: "confident", expiresIn: 3 } }
    ]
  },
  sleepyStatus: {
    name: "sleepy",
    description: "Slippery mess of deliciousness",
    success: [
      { type: "textMessage", text: "{CASTER} uses {ACTION}!"},
      { type: "animation", animation: "glob", color: "#dafd2a" },
      { type: "stateChange", status: { type: "sleepy", expiresIn: 3 } },
      { type: "textMessage", text: "{TARGET} is slipping all around! Ugh.... sleep... must sleep..."},
    ]
  },
  disorientedStatus: {
    name: "what's going on?.. who am I",
    description: "Slippery mess of deliciousness",
    success: [
      { type: "textMessage", text: "{CASTER} uses {ACTION}!"},
      { type: "animation", animation: "glob", color: "#dafd2a" },
      { type: "stateChange", status: { type: "sleepy", expiresIn: 3 } },
      { type: "textMessage", text: "{TARGET} is slipping all around! Ugh.... sleep... must sleep..."},
    ]
  },
  //Items
  item_recoverStatus: {
    name: "Heating Lamp",
    description: "Feeling fresh and warm",
    targetType: "friendly",
    success: [
      { type: "textMessage", text: "{CASTER} uses a {ACTION}!"},
      { type: "stateChange", status: null },
      { type: "textMessage", text: "Feeling fresh!", },
    ]
  },
  item_recoverHp: {
    name: "stale granola bar",
    description: "Tastes better when hungry",
    targetType: "friendly",
    success: [
      { type:"textMessage", text: "{CASTER} finds a {ACTION} in their bag!", },
      { type:"stateChange", recover: 10, },
      { type:"textMessage", text: "{CASTER} recovers HP!", },
    ]
  },
}
