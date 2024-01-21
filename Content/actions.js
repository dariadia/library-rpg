const shouldGiveClue = (level) =>
  window.playerState.clues === level
    ? window.playerState.clues++
    : window.playerState.clues

const isRepeat = (clue) =>
  window.playerState.storyFlags.includes(clue)
    ? "Haven't you heard that somewhere before?"
    : "You got a clue!"

const CLUES = 'CLUES'

window.Clues = {
  BOOKCASE: `${CLUES}:BOOKCASE`,
  FOOTSTEPS: `${CLUES}:FOOTSTEPS`,
  ACHOKED: `${CLUES}:ACHOKED`,
}

window.Actions = {
  ask_name: {
    name: "Ask for her name",
    description: "It's friendly... right?",
    success: [
      { type: "textMessage", text: "So. What's your name?" },
      { type: "stateChange", status: { type: "disoriented", expiresIn: 3 } },
      { type: "textMessage", text: "Nice to meet you.", character: window.window.Characters[MRS_T] },
      { type: "textMessage", text: "It's Mrs... Mrs... Mrs Ta- Mrs Te... Oh dear, oh dear...", character: window.window.Characters[MRS_T], emotion: 'upset' },
      { type: "stateChange", damage: 5 }
    ]
  },
  ask_death: {
    name: "Ask how she died",
    description: "Because you're curious",
    success: [
      { type: "textMessage", text: "How did you die?" },
      { type: "textMessage", text: "I am not dead, dear...", character: window.window.Characters[MRS_T] },
      { type: "textMessage", text: "What a sense of humour you have there!", character: window.window.Characters[MRS_T] },
      { type: "textMessage", text: "I am not dead... Am I? That bookcase looked so heavy.", character: window.window.Characters[MRS_T], emotion: 'upset' },
      { type: "textMessage", text: "Imagine being buried by that many books all at once!", character: window.window.Characters[MRS_T] },
      {
        type: "textMessage",
        text: () => isRepeat(1),
        cb: () => shouldGiveClue(0),
      },
      { type: "addStoryFlag", flag: window.Clues.BOOKCASE },
      { type: "stateChange", status: { type: "shocked", expiresIn: 2 } },
      { type: "stateChange", damage: 10 }
    ]
  },
  ask_death_gen: {
    name: "Ask about death",
    description: "In general. Because you're curious",
    success: [
      { type: "textMessage", text: "How does one die in a library? I mean, does your soul stay here forever?" },
      { type: "textMessage", text: "Oh dear, what an interesting question.", character: window.Characters[MRS_T] },
      { type: "textMessage", text: "I have no idea, I am afraid.", character: window.Characters[MRS_T], emotion: 'upset' },
      { type: "textMessage", text: "Some days I think I work so much in this library, I might be dead myself!", character: window.Characters[MRS_T] },
      { type: "textMessage", text: "Haunting a library, can you imagine? ", character: window.Characters[MRS_T], emotion: "upset" },
      {
        type: "textMessage",
        text: () => isRepeat(1),
        cb: () => shouldGiveClue(0),
      },
      { type: "addStoryFlag", flag: window.Clues.BOOKCASE },
      { type: "stateChange", damage: 10 }
    ]
  },
  ask_ghost: {
    name: "Ask if she's a ghost",
    description: "What can go wrong, right?",
    success: [
      { type: "textMessage", text: "So. How come you're a ghost?" },
      { type: "textMessage", text: "What could you possibly mean, dear?..", character: window.Characters[MRS_T], emotion: 'upset' },
      { type: "stateChange", status: { type: "shocked", expiresIn: 2 } },
      { type: "stateChange", damage: 10 }
    ]
  },
  ask_neck: {
    name: "Ask about her bruise",
    description: "You're observant so you notice the thin mark on her neck.",
    success: [
      { type: "textMessage", text: "Do you mind me asking what's with your neck?" },
      { type: "textMessage", text: "I actually do.", character: window.Characters[KARINA], emotion: UPSET },
      { type: "textMessage", text: "...", character: window.Characters[KARINA] },
      { type: "textMessage", text: "...", character: window.Characters[KARINA], emotion: SCEPTIC },
      { type: "textMessage", text: "...mind you asking.", character: window.Characters[KARINA], emotion: UPSET },
      { type: "textMessage", text: "But you already did that. So.", character: window.Characters[KARINA] },
      { type: "textMessage", text: "See this necklace? It was my favourite. Apparently whoever came behind me liked it too.", character: window.Characters[KARINA], emotion: UPSET },
      { type: "textMessage", text: "We were studying, cheated the guard and stayed the night in the library. Then I went to the bathroom.", character: window.Characters[KARINA] },
      { type: "textMessage", text: "I heard footsteps. Remember? Footsteps, I didn't see them when they grabbed me by my necklace.", character: window.Characters[KARINA] },
      {
        type: "textMessage",
        text: () => isRepeat(2),
        cb: () => shouldGiveClue(1),
      },
      { type: "addStoryFlag", flag: window.Clues.FOOTSTEPS },
      { type: "textMessage", text: "I struggled. Then choked. Then I woke up with my cold body on the floor and that one choking himself to death because he's allergic to nuts but grabbed my snacks.", character: window.Characters[KARINA] },
      { type: "textMessage", text: "Ugh. That idiot...", character: window.Characters[KARINA], emotion: UPSET },
      {
        type: "textMessage",
        text: () => isRepeat(3),
        cb: () => shouldGiveClue(2),
      },
      { type: "addStoryFlag", flag: window.Clues.ACHOKED },
      { type: "stateChange", damage: 40 }
    ]
  },
  ask_hlong: {
    name: "Ask about her time here",
    description: "That vest looks so 80s?..",
    success: [
      { type: "textMessage", text: "So. Been around a long time?" },
      { type: "textMessage", text: "....", character: window.Characters[KARINA] },
      { type: "textMessage", text: "...", character: window.Characters[KARINA], emotion: SCEPTIC },
      { type: "textMessage", text: "Sigh. Fi-ine. Ten years.", character: window.Characters[KARINA], emotion: UPSET },
      { type: "textMessage", text: "Don't you rather want to know how we ended up in here in the first place?", character: window.Characters[KARINA] },
      { type: "textMessage", text: "We-e-ell. Yeah?" },
      { type: "textMessage", text: "....", character: window.Characters[KARINA] },
      { type: "textMessage", text: "... of course, you do.", character: window.Characters[KARINA], emotion: SCEPTIC },

      {
        type: "textMessage",
        text: () => isRepeat(2),
        cb: () => shouldGiveClue(1),
      },
      { type: "addStoryFlag", flag: window.Clues.ACHOKED },
      { type: "stateChange", damage: 40 }
    ]
  },
  kadvice: {
    name: "Ask for advice",
    description: "Maybe she could suggest something",
    success: [
      { type: "textMessage", text: "TODO" },
    ]
  },
  ask_hdied: {
    name: "todo",
    description: "todo",
    success: [
      { type: "textMessage", text: "TODO" },
    ]
  },
  damage1: {
    name: "Walk through her",
    description: "Because you can",
    success: [
      { type: "animation", animation: "move", direction: "forward" },
      { type: "textMessage", text: "Oh shit, this feels weird." },
      { type: "textMessage", text: "*gasps*", character: window.Characters[MRS_T], emotion: UPSET },
      { type: "animation", animation: "move", direction: "backward" },
      { type: "stateChange", status: { type: "shocked", expiresIn: 2 } },
      { type: "stateChange", damage: 10 }
    ]
  },
  damage2: {
    name: "Walk through her",
    description: "Let's try this?..",
    success: [
      { type: "animation", animation: "move", direction: "forward" },
      { type: "textMessage", text: "This is so weird." },
      { type: "textMessage", text: "Did you – have to – do that?", character: window.Characters[KARINA], emotion: UPSET },
      { type: "animation", animation: "move", direction: "backward" },
      { type: "stateChange", status: { type: "upset", expiresIn: 5 } },
      { type: "stateChange", damage: 10 }
    ]
  },
  damage3: {
    name: "Walk through him",
    description: "He won't get mad, right?",
    success: [
      { type: "animation", animation: "move", direction: "forward" },
      { type: "textMessage", text: "Oh shit, this feels weird" },
      { type: "textMessage", text: "Hey, what the heck?!", character: window.Characters[ARYLHAN], emotion: UPSET },
      { type: "animation", animation: "move", direction: "backward" },
      { type: "textMessage", text: "Oh, wait.", character: window.Characters[ARYLHAN], emotion: SCEPTIC },
      { type: "textMessage", text: "Is this a game? How do I play? Do I walk through you next? I'm doing it, I'm doing it, what did I win??", character: window.Characters[ARYLHAN] },
      { type: "stateChange", status: { type: "disoriented", expiresIn: 3 } },
      { type: "stateChange", damage: 5 }
    ]
  },
  confident: {
    name: "Feeling confident!",
    description: "Emergency confidence boost",
    targetType: "friendly",
    success: [
      { type: "textMessage", text: "{CASTER} uses {ACTION}!" },
      { type: "animation", animation: "glob", color: "#dafd2a" },
      { type: "stateChange", status: { type: "confident", expiresIn: 3 } }
    ]
  },
  sleepy: {
    name: "sleepy",
    description: "Do they all talk without a point this much?..",
    success: [
      { type: "textMessage", text: "Oh dear, oh dear, the weather today is just lovely, isn't it?", character: window.Characters[MRS_T] },
      { type: "textMessage", character: window.Characters[MRS_T], text: "I remember when my husband was still around, we would..." },
      { type: "textMessage", character: window.Characters[MRS_T], text: "... and then, oh, do you remind me of our neighbour, dearest Frau Schmidt! So lively, so animated..." },
      { type: "textMessage", character: window.Characters[MRS_T], emotion: 'upset', text: "... my poor Karl left us so early. My job here keeps me going, of course. Oh dear, all the books to look after..." },
      { type: "stateChange", status: { type: "sleepy", expiresIn: 3 } },
      { type: "textMessage", text: "Ugh... she has a point, right?.." },
    ]
  },
  disoriented1: {
    name: "Disoriented",
    description: "No longer has any idea what's going on!",
    success: [
      { type: "textMessage", character: window.Characters[MRS_T], text: "Hello, dear. Sorry, I did not see you there!" },
      { type: "stateChange", damage: 3 }
    ]
  },
  disoriented2: {
    name: "Disoriented",
    description: "No longer has any idea what's going on!",
    success: [
      { type: "textMessage", character: window.Characters[MRS_T], text: "What book did you come for? Let me check..." },
      { type: "stateChange", status: { type: "disoriented", expiresIn: 2 } },
      { type: "textMessage", character: window.Characters[MRS_T], text: "Oh dear, I was so sure this is the West wing..." },
    ]
  },
  ask_about_place: {
    name: "Ask if she's a ghost",
    description: "What can go wrong, right?",
    success: [
      { type: "textMessage", text: "So. How come you're a ghost?" },
      { type: "textMessage", text: "What could you possibly mean, dear?..", character: window.Characters[MRS_T], emotion: 'upset' },
      { type: "stateChange", status: { type: "shocked", expiresIn: 2 } },
      { type: "stateChange", damage: 10 }
    ]
  },
  silent_treatment: {
    name: "Silent treatment",
    description: "She just doesn't want to talk to anyone.",
    success: [
      { type: "textMessage", character: window.Characters[KARINA], text: "..." },
      { type: "textMessage", character: window.Characters[KARINA], text: "...", emotion: SCEPTIC },
      { type: "stateChange", status: { type: "uneasy", expiresIn: 3 } },
    ]
  },
  chatter: {
    name: "Chatter",
    description: "He talks way too much.",
    success: [
      { type: "textMessage", character: window.Characters[ARYLHAN], text: "I came here to study. All across the USSR, can you image? Took me two weeks by train." },
      { type: "textMessage", character: window.Characters[ARYLHAN], text: "Possibly would've taken less if I took the right train. I was lucky they just left me at the next station, and I went back to catch my train. Anyway.", emotion: SCEPTIC },
      { type: "stateChange", status: { type: "disoriented", expiresIn: 5 } },
      { type: "textMessage", character: window.Characters[ARYLHAN], text: "Did I tell you about how I met Karina?" },
    ]
  },
  chatter2: {
    name: "Chatter",
    description: "He talks way too much.",
    success: [
      { type: "textMessage", character: window.Characters[ARYLHAN], text: "Some people say I talk too much, I know, I know! Karina told me that the first day we met." },
      { type: "textMessage", character: window.Characters[ARYLHAN], text: "Heh, such a long time ago it was! I just saw her standing by the wall, it was our start of the year greeting ceremony.", emotion: UPSET },
      { type: "stateChange", status: { type: "disoriented", expiresIn: 5 } },
      { type: "textMessage", character: window.Characters[ARYLHAN], text: "She looked so serious, I was surprised we were in the same class. First years!" },
    ]
  },

  // Items
  item_recoverStatus: {
    name: "Heating Lamp",
    description: "Feeling fresh and warm",
    targetType: "friendly",
    success: [
      { type: "textMessage", text: "{CASTER} uses a {ACTION}!" },
      { type: "stateChange", status: null },
      { type: "textMessage", text: "Feeling fresh!", },
    ]
  },
  item_recoverHp: {
    name: "stale granola bar",
    description: "Tastes better when hungry",
    targetType: "friendly",
    success: [
      { type: "textMessage", text: `{HERO} finds a {ACTION} in their bag!` },
      { type: "stateChange", recover: 10, },
      { type: "textMessage", text: `{HERO} recovers HP!`, },
    ]
  },
}
