window.Actions = {
  ask_name: {
    name: "Ask for her name",
    description: "It's friendly... right?",
    success: [
      { type: "textMessage", text: "So. What's your name?" },
      { type: "stateChange", status: { type: "disoriented", expiresIn: 3 } },
      { type: "textMessage", text: "Nice to meet you.", character: CHARACTERS[MRS_T] },
      { type: "textMessage", text: "It's Mrs... Mrs... Mrs Ta- Mrs Te... Oh dear, oh dear...", character: CHARACTERS[MRS_T], emotion: 'upset' },
      { type: "stateChange", damage: 5}
    ]
  },
  ask_death: {
    name: "Ask how she died",
    description: "Because you're curious",
    success: [
      { type: "textMessage", text: "How did you die?"},
      { type: "textMessage", text: "I am not dead, dear...", character: CHARACTERS[MRS_T] },
      { type: "textMessage", text: "What a sense of humour you have there!", character: CHARACTERS[MRS_T] },
      { type: "textMessage", text: "I am not dead... Am I? That bookcase looked so heavy.", character: CHARACTERS[MRS_T], emotion: 'upset' },
      { type: "textMessage", text: "Imagine being buried by that many books all at once!", character: CHARACTERS[MRS_T] },
      { type: "textMessage", text: "You got a clue!", 
        cb: () => window.playerState.clues === 0 ? window.playerState.clues++ : window.playerState.clues 
      },
      { type: "stateChange", status: { type: "shocked", expiresIn: 2 } },
      { type: "stateChange", damage: 10 }
    ]
  },
  ask_death_gen: {
    name: "Ask about death",
    description: "In general. Because you're curious",
    success: [
      { type: "textMessage", text: "How does one die in a library? I mean, does your soul stay here forever?"},
      { type: "textMessage", text: "Oh dear, what an interesting question.", character: CHARACTERS[MRS_T] },
      { type: "textMessage", text: "I have no idea, I am afraid.", character: CHARACTERS[MRS_T], emotion: 'upset' },
      { type: "stateChange", damage: 10 }
    ]
  },
  ask_ghost: {
    name: "Ask if she's a ghost",
    description: "What can go wrong, right?",
    success: [
      { type: "textMessage", text: "So. How come you're a ghost?"},
      { type: "textMessage", text: "What could you possibly mean, dear?..", character: CHARACTERS[MRS_T], emotion: 'upset' },
      { type: "stateChange", status: { type: "shocked", expiresIn: 2 } },
      { type: "stateChange", damage: 10 }
    ]
  },
  damage1: {
    name: "Walk through her",
    description: "Because you can",
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
