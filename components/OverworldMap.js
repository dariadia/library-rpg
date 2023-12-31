const LEFT = 'left'
const RIGHT = 'right'
const UPSET = 'upset'
const SCEPTIC = 'sceptic'

const HERR_DOKTOR = 'HerrDoktor'
const HERO = 'hero'
const MRS_T = 'MrsT'
const KARINA = 'Karina'
const ARYLHAN = 'Arylhan'

const RAN_AWAY = 'INTRO:RAN_AWAY'
const QUIET_WATCH = 'INTRO:QUIET_WATCH'

const getPronouns = (pronoun) => {
  switch (pronoun) {
    case 'he':
      return "him"
    case 'she':
      return "her"
    case 'they':
      return "them"
    default:
      return "them"
  }
}

const CHARACTERS = {
  [HERR_DOKTOR]: {
    id: HERR_DOKTOR,
    visible: 0.7,
    name: 'Herr Doktor von Reichshoffen',
    position: LEFT,
    avatar: {
      gen: '/images/characters/avatars/herr-doktor_gen.png',
      adm: '/images/characters/avatars/herr-doktor_adm.png',
      happy: '/images/characters/avatars/herr-doktor_happy.png',
      smile: '/images/characters/avatars/herr-doktor_smile.png'
    },
    character: '/images/characters/icons/herr-doktor.png',
  },
  [MRS_T]: {
    id: MRS_T,
    visible: 0.6,
    name: 'Mrs T',
    position: LEFT,
    avatar: {
      gen: '/images/characters/avatars/mrs-t_gen.png',
      upset: '/images/characters/avatars/mrs-t_upset.png'
    },
    character: '/images/characters/icons/mrs-t.png',
    skills: {
      "a": {
        skillId: "mrsT",
        maxHp: 20,
      }
    }
  },
  [KARINA]: {
    id: KARINA,
    visible: 0.7,
    position: LEFT,
    name: 'Karina Saroyan',
    avatar: {
      gen: '/images/characters/avatars/karina_gen.png',
      [UPSET]: '/images/characters/avatars/karina_upset.png',
      [SCEPTIC]: '/images/characters/avatars/karina_sceptic.png'
    },
    character: '/images/characters/icons/karina.png',
  },
  [ARYLHAN]: {
    id: ARYLHAN,
    visible: 0.7,
    position: RIGHT,
    name: 'Arylhan Ivanov',
    avatar: {
      gen: '/images/characters/avatars/arylhan_gen.png',
      [UPSET]: '/images/characters/avatars/arylhan_upset.png',
      [SCEPTIC]: '/images/characters/avatars/arylhan_sceptic.png'
    },
    character: '/images/characters/icons/arylhan.png',
  },
}

class OverworldMap {
  constructor(config) {
    this.overworld = null
    this.gameObjects = {}
    this.configObjects = config.configObjects
    this.cutsceneSpaces = config.cutsceneSpaces || {}
    this.walls = config.walls || {}
    this.lowerImage = new Image()
    this.lowerImage.src = config.lowerSrc
    this.upperImage = new Image()
    this.upperImage.src = config.upperSrc
    this.isCutscenePlaying = false
    this.isPaused = false
  }

  drawLowerImage(ctx, cameraPerson) {
    ctx.globalAlpha = 1
    ctx.drawImage(
      this.lowerImage, 
      utils.withGrid(10.5) - cameraPerson.x, 
      utils.withGrid(6) - cameraPerson.y
    )
  }

  drawUpperImage(ctx, cameraPerson) {
    ctx.globalAlpha = 1
    ctx.drawImage(
      this.upperImage, 
      utils.withGrid(10.5) - cameraPerson.x, 
      utils.withGrid(6) - cameraPerson.y
    )
  } 

  isSpaceTaken(currentX, currentY, direction, isGhost) {
    if (isGhost) return false
    const {x,y} = utils.nextPosition(currentX, currentY, direction)
    if (this.walls[`${x},${y}`]) return true
    return Object.values(this.gameObjects).find(obj => {
      if (obj.x === x && obj.y === y && !(obj.visible < 1)) { return true }
      if (obj.intentPosition 
        && obj.intentPosition[0] === x 
        && obj.intentPosition[1] === y 
        && !(obj.visible < 1)) return true
      return false
    })
  }

  mountObjects() {
    Object.keys(this.configObjects).forEach(key => {
      let object = this.configObjects[key]
      object.id = key
      let instance
      switch(object.type) {
        case 'Person':
          instance = new Person(object)
          break
        case 'SkillBook':
          instance = new SkillBook(object)
      }
      this.gameObjects[key] = instance
      this.gameObjects[key].id = key
      instance.mount(this)
    })
  }

  async startCutscene(events) {
    const seenScenes = events.filter(item => item.type === "addStoryFlag")
      .map(item => item.flag)
    const isSeenScene = seenScenes
      .filter(scene => window.playerState.storyFlags.hasOwnProperty(scene))

    if (isSeenScene.length) return

    this.isCutscenePlaying = true
    const mobileKeyboard = window.playerState.mobileKeyboard
    if (mobileKeyboard) mobileKeyboard.hide()
    

    for (let i=0; i<events.length; i++) {
      const eventHandler = new OverworldEvent({
        event: events[i],
        map: this,
      })
      const result = await eventHandler.init()
      if (result === "LOST_BATTLE") {
        break
      }
    }
    this.isCutscenePlaying = false
    if (mobileKeyboard) mobileKeyboard.show()
  }

  checkForActionCutscene() {
    const hero = this.gameObjects[HERO]
    const nextCoords = utils.nextPosition(hero.x, hero.y, hero.direction)
    const match = Object.values(this.gameObjects).find(object => {
      return `${object.x},${object.y}` === `${nextCoords.x},${nextCoords.y}`
    })
    if (!this.isCutscenePlaying && match && match.talking.length) {

      const relevantScenario = match.talking.find(scenario => {
        return (scenario.required || []).every(sf => {
          return playerState.storyFlags[sf]
        })
      })
      relevantScenario && this.startCutscene(relevantScenario.events)
    }
  }

  checkForFootstepCutscene() {
    const hero = this.gameObjects[HERO]
    const match = this.cutsceneSpaces[ `${hero.x},${hero.y}` ]
    if (!this.isCutscenePlaying && match) {
      this.startCutscene( match[0].events )
    }
  }
}

window.OverworldMaps = {
  ReadingRoom: {
    id: "ReadingRoom",
    lowerSrc: "/images/maps/ReadingRoomLower.png",
    upperSrc: "/images/maps/ReadingRoomUpper.png",
    configObjects: {
      hero: {
        type: "Person",
        isPlayerControlled: true,
        x: utils.withGrid(11),
        y: utils.withGrid(6),
      },
      [HERR_DOKTOR]: {
        type: "Person",
        x: utils.withGrid(3),
        y: utils.withGrid(4),
        direction: "up",
        visible: CHARACTERS[HERR_DOKTOR].visible,
        src: CHARACTERS[HERR_DOKTOR].character,
        behaviorLoop: []
      },
    },
    cutsceneSpaces: {
      [utils.asGridCoord(5,10)]: [
        {
          events: [
            { 
              type: "changeMap", 
              map: "Hall",
              x: utils.withGrid(9),
              y: utils.withGrid(10),
              direction: "down"
            }
          ]
        }
      ],
      [utils.asGridCoord(11,6)]: [{
        disqualify: ["SEEN_INTRO"],
        events: [
          // mock for dev
          // { type: "textMessage", text: "February, 29. 1992.", effect: "intro" },
          // { type: "textMessage", text: "Kaliningrad, Russia.", effect: "intro" },
          // { type: "textMessage", text: "You stay late in the library writing your thesis.", effect: "intro", effectType: "text" },
          // { type: "externalEffect", kind: "darkMax", time: 5000},
          // { type: "stand", who: HERO, direction: "up", time: 200},
          // { type: "stand", who: HERO, direction: "left", time: 200},
          // { type: "textMessage", text: "Ugh...."},
          // { type: "stand", who: HERO, direction: "right", time: 200},
          // { type: "stand", who: HERO, direction: "down", time: 200},
          // { type: "addStoryFlag", flag: "SEEN_INTRO"},
          // { type: "textMessage", text: "... did I fall asleep? Ugh... "},
          // { type: "stand", who: HERO, direction: "left", time: 200},
          // { type: "textMessage", text: "... wha-at"},
          // { type: "walk", who: HERR_DOKTOR, direction: "left"},
          // { type: "stand", who: HERR_DOKTOR, direction: "up", time: 200},
          // { type: "textMessage", text: "...", character: { name: "ghost???", avatar: CHARACTERS[HERR_DOKTOR].avatar }},
          // { type: "textMessage", text: "WHAT?!"},
          { type: "prompt", options: [
            { text: "run away", actions: [
              { type: "addStoryFlag",  flag: RAN_AWAY, upSkill: '0quick' },
              { type: "textMessage", text: "A-A-A-A!!!"},
              { type: "walk", who: HERO, direction: "right"},
              { type: "walk", who: HERO, direction: "down"},
              { type: "walk", who: HERO, direction: "down"},
              { type: "walk", who: HERO, direction: "left"},
              { type: "walk", who: HERO, direction: "left"},
              { type: "walk", who: HERO, direction: "left"},
              { type: "walk", who: HERO, direction: "left"},
              { type: "walk", who: HERO, direction: "left"},
              { type: "walk", who: HERO, direction: "down"},
              { type: "walk", who: HERO, direction: "left"},
              { type: "walk", who: HERO, direction: "left"},
              { type: "walk", who: HERO, direction: "down"},
              { 
                type: "changeMap", 
                map: "Hall",
                x: utils.withGrid(9),
                y: utils.withGrid(10),
                direction: "down"
              }
            ] }, 
            { text: "keep quiet and watch", actions: [
              { type: "addStoryFlag",  flag: QUIET_WATCH, upSkill: '0obs'},
              { type: "stand", who: HERR_DOKTOR, direction: "up", time: 1000},
              { type: "walk", who: HERR_DOKTOR, direction: "left"},
              { type: "stand", who: HERR_DOKTOR, direction: "left", time: 500},
              { type: "stand", who: HERR_DOKTOR, direction: "up", time: 500},
              { 
                type: "changeMap", 
                map: "ReadingRoomEmpty",
                x: utils.withGrid(11),
                y: utils.withGrid(6),
                direction: "left",
                disappear: true,
                shadeOptions: "width:14px;height:18px;top:60px;left:9px;border-radius:50px;filter:blur(3px);"
              },
              { type: "textMessage", text: "...a-and he went through the bookshelves..."},
              { type: "textMessage", text: "Of course."},
            ] }
          ]},
        ]
      }],
      [utils.asGridCoord(4,4)]: [{
        events: [
          { type: "textMessage", text: "Ugh, it's locked. The security guard should come by the morning."},
        ]
      }]
    },
    walls: function() {
      let walls = {};
      ["1,10","2,10","3,10","4,10","6,10","7,10","8,10","9,10","10,10","11,10","12,10",
      "1,3","2,3","3,3","4,3","5,3","6,3","7,3","8,3","9,3","10,3","11,3","12,3",
      "0,3","0,4","0,5","0,6","0,7","0,8","0,9",
      "13,3","13,4","13,5","13,6","13,7","13,8","13,9",
      "12,9","11,9","9,9","8,9","6,7","7,7","9,7","10,7","11,7","5,11"
      ].forEach(coord => {
        let [x,y] = coord.split(",")
        walls[utils.asGridCoord(x,y)] = true
      })
      return walls
    }(),
  },
  ReadingRoomEmpty: {
    id: "ReadingRoom",
    lowerSrc: "/images/maps/ReadingRoomLower.png",
    upperSrc: "/images/maps/ReadingRoomUpper.png",
    configObjects: {
      hero: {
        type: "Person",
        isPlayerControlled: true,
        x: utils.withGrid(11),
        y: utils.withGrid(6),
      },
    },
    cutsceneSpaces: {
      [utils.asGridCoord(5,10)]: [
        {
          events: [
            { 
              type: "changeMap", 
              map: "Hall",
              optionalBack: true,
              x: utils.withGrid(9),
              y: utils.withGrid(10),
              direction: "down"
            }
          ]
        }
      ],
      [utils.asGridCoord(4,4)]: [{
        events: [
          { type: "textMessage", text: "Ugh, it's locked. The security guard should come by the morning."},
        ]
      }]
    },
    walls: function() {
      let walls = {};
      ["1,10","2,10","3,10","4,10","6,10","7,10","8,10","9,10","10,10","11,10","12,10",
      "1,3","2,3","3,3","4,3","5,3","6,3","7,3","8,3","9,3","10,3","11,3","12,3",
      "0,3","0,4","0,5","0,6","0,7","0,8","0,9",
      "13,3","13,4","13,5","13,6","13,7","13,8","13,9",
      "12,9","11,9","9,9","8,9","6,7","7,7","9,7","10,7","11,7","5,11"
      ].forEach(coord => {
        let [x,y] = coord.split(",")
        walls[utils.asGridCoord(x,y)] = true
      })
      return walls
    }(),
  },
  Hall: {
    id: "Hall",
    lowerSrc: "/images/maps/HallLower.png",
    upperSrc: "/images/maps/HallUpper.png",
    configObjects: {
      hero: {
        type: "Person",
        isPlayerControlled: true,
        x: utils.withGrid(30),
        y: utils.withGrid(10),
      },
      [MRS_T]: {
        type: "Person",
        x: utils.withGrid(20),
        y: utils.withGrid(10),
        direction: "down",
        visible: CHARACTERS[MRS_T].visible,
        src: CHARACTERS[MRS_T].character,
        behaviorLoop: [
          { type: "stand", who: MRS_T, direction: "down", time: 4000},
          { type: "textMessage", text: "Oh, dear, oh dear!", character: 
            { name: () => window.playerState.storyFlags.GREETED_BY_MRS_T 
                ? CHARACTERS[MRS_T].name 
                : "another ghost???", 
              avatar: CHARACTERS[MRS_T].avatar, emotion: UPSET }},
          { type: "stand", who: MRS_T, direction: "left", time: 500},
          { type: "stand", who: MRS_T, direction: "right", time: 500},
          { type: "walk", who: MRS_T, direction: "left"},
          { type: "walk", who: MRS_T, direction: "left"},
          { type: "walk", who: MRS_T, direction: "left"},
          { type: "walk", who: MRS_T, direction: "left"},
          { type: "stand", who: MRS_T, direction: "up", time: 500},
          { type: "stand", who: MRS_T, direction: "right", time: 500},
          { type: "textMessage", text: "Isn't the weather just lovely today?", character: 
          { name: () => window.playerState.storyFlags.GREETED_BY_MRS_T 
              ? CHARACTERS[MRS_T].name 
              : "another ghost???", 
            avatar: CHARACTERS[MRS_T].avatar }},
          { type: "walk", who: MRS_T, direction: "down"},
          { type: "walk", who: MRS_T, direction: "down"},
          { type: "walk", who: MRS_T, direction: "right"},
          { type: "walk", who: MRS_T, direction: "right"},
          { type: "walk", who: MRS_T, direction: "right"},
          { type: "walk", who: MRS_T, direction: "right"},
          { type: "stand", who: MRS_T, direction: "left", time: 500},
          { type: "stand", who: MRS_T, direction: "right", time: 500},
          { type: "stand", who: MRS_T, direction: "down", time: 3000},
        ],
        talking: [
          {
            required: ["GREETED_BY_MRS_T"],
            events: [
              { type: "textMessage", text: "Goodness gracious, where are my manners?", faceHero: MRS_T, character: CHARACTERS[MRS_T], emotion: UPSET },
              { type: "textMessage", text: "Please, accept my apologies... I am Mrs... do you happen to know my name?", faceHero: MRS_T, character: CHARACTERS[MRS_T] },
            ]
          },
          {
            events: [
             { type: "textMessage", character: { name: "a ghost?", avatar: CHARACTERS[MRS_T].avatar }, text: "Oh, hello, dear. I believe we never were introduced?", faceHero: MRS_T },
             { type: "question", enemy: CHARACTERS[MRS_T], arena: "hall" },
             { type: "addStoryFlag", flag: "GREETED_BY_MRS_T"},
             { type: "textMessage", text: "Oh dear. So many things to do, so little time! Please, excuse me, dear.", character: CHARACTERS[MRS_T] },
             { type: "stand", who: MRS_T, direction: "down", time: 500},
             { type: "walk", who: MRS_T, direction: "right"},
             { type: "walk", who: MRS_T, direction: "right"},
             { type: "walk", who: MRS_T, direction: "right"},
             { type: "walk", who: MRS_T, direction: "right"},
             { type: "walk", who: MRS_T, direction: "right"},
             { type: "textMessage", text: "Wait!" },
             { type: "walk", who: HERO, direction: "right"},
             { type: "walk", who: MRS_T, direction: "right"},
             { type: "walk", who: MRS_T, direction: "right"},
             { 
              type: "changeMap", 
              map: "SecondHall",
              direction: "right",
              noTransition: true,
            },
            ]
          },
        ]
      },
    },
    walls: function() {
      let walls = {};
      ["8,9","7,9","6,9","5,9","4,9",
      "10,8","11,8","12,8","13,8","14,8","15,8","16,8","17,8","18,8","19,8",
      "20,7","21,7","22,7","23,7","24,6","25,6","26,6","27,6","27,7","28,8","29,9","30,9",
      "31,9","32,9","33,9",
      "34,10","34,11","34,12","34,13","34,14","34,15","34,16","34,17","34,18","34,19",
      "24,20","25,20","26,20","27,20","28,20","29,20","30,20","31,20","32,20","33,20","34,20",
      "23,19","23,18","22,18","18,18","18,19","18,20","18,17","19,20","20,20","21,20","22,20",
      "17,18","16,18","15,18","14,18","13,18","12,19","11,19","10,18","9,18","8,18","7,18","6,19","5,19","4,18",
      "3,18","3,17","3,16","3,15","3,14","3,13","3,12","3,11","3,10",
      ].forEach(coord => {
        let [x,y] = coord.split(",")
        walls[utils.asGridCoord(x,y)] = true
      })
      return walls
    }(),
    cutsceneSpaces: {
      [utils.asGridCoord(9,9)]: [
        {
          events: [
            { 
              type: "changeMap",
              map: "ReadingRoomEmpty",
              x: utils.withGrid(5),
              y: utils.withGrid(10),
              direction: "up"
            }
          ]
        }
      ],
      [utils.asGridCoord(9,11)]: [{
        events: [
          { type: "textMessage", text: "Huh? Who's there?"},
        ]
      }],
    }
  },
  SecondHall: {
    id: "SecondHall",
    lowerSrc: "/images/maps/HallLower.png",
    upperSrc: "/images/maps/HallUpper.png",
    configObjects: {
      hero: {
        type: "Person",
        isPlayerControlled: true,
        x: utils.withGrid(20),
        y: utils.withGrid(10),
      },
    },
    walls: function() {
      let walls = {};
      ["8,9","7,9","6,9","5,9","4,9",
      "10,8","11,8","12,8","13,8","14,8","15,8","16,8","17,8","18,8","19,8",
      "20,7","21,7","22,7","23,7","24,6","25,6","26,6","27,6","27,7","28,8","29,9","30,9",
      "31,9","32,9","33,9",
      "34,10","34,11","34,12","34,13","34,14","34,15","34,16","34,17","34,18","34,19",
      "24,20","25,20","26,20","27,20","28,20","29,20","30,20","31,20","32,20","33,20","34,20",
      "23,19","23,18","22,18","18,18","18,19","18,20","18,17","19,20","20,20","21,20","22,20",
      "17,18","16,18","15,18","14,18","13,18","12,19","11,19","10,18","9,18","8,18","7,18","6,19","5,19","4,18",
      "3,18","3,17","3,16","3,15","3,14","3,13","3,12","3,11","3,10",
      ].forEach(coord => {
        let [x,y] = coord.split(",")
        walls[utils.asGridCoord(x,y)] = true
      })
      return walls
    }(),
    cutsceneSpaces: {
      [utils.asGridCoord(9,9)]: [
        {
          events: [
            { 
              type: "changeMap",
              map: "ReadingRoomEmpty",
              x: utils.withGrid(5),
              y: utils.withGrid(10),
              direction: "up"
            }
          ]
        }
      ],
      [utils.asGridCoord(18,10)]: [{
        events: [
          { type: "textMessage", text: "Great. Now she's gone too!" },
          { type: "stand", who: HERO, direction: "up"},
          { type: "stand", who: HERO, direction: "left"},
          { type: "textMessage", text: "Huh?" },
          { 
            type: "changeMap",
            map: "ThirdHall",
            x: utils.withGrid(18),
            y: utils.withGrid(10),
            direction: "left",
            noTransition: true,
          }
        ]
      }],
      [utils.asGridCoord(20,10)]: [{
        events: [
          { type: "textMessage", text: "Great. Now she's gone too!" },
          { type: "stand", who: HERO, direction: "up"},
          { type: "stand", who: HERO, direction: "left"},
          { type: "textMessage", text: "Huh?" },
          { 
            type: "changeMap",
            map: "ThirdHall",
            x: utils.withGrid(20),
            y: utils.withGrid(10),
            direction: "left",
            noTransition: true,
          }
        ]
      }],
      [utils.asGridCoord(19,11)]: [{
        events: [
          { type: "textMessage", text: "Great. Now she's gone too!" },
          { type: "stand", who: HERO, direction: "up"},
          { type: "stand", who: HERO, direction: "left"},
          { type: "textMessage", text: "Huh?" },
          { 
            type: "changeMap",
            map: "ThirdHall",
            x: utils.withGrid(19),
            y: utils.withGrid(11),
            direction: "left",
            noTransition: true,
          }
        ]
      }],
      [utils.asGridCoord(19,9)]: [{
        events: [
          { type: "textMessage", text: "Great. Now she's gone too!" },
          { type: "stand", who: HERO, direction: "up"},
          { type: "stand", who: HERO, direction: "left"},
          { type: "textMessage", text: "Huh?" },
          { 
            type: "changeMap",
            map: "ThirdHall",
            x: utils.withGrid(19),
            y: utils.withGrid(9),
            direction: "left",
            noTransition: true,
          }
        ]
      }],
    }
  },
  ThirdHall: {
    id: "ThirdHall",
    lowerSrc: "/images/maps/HallLower.png",
    upperSrc: "/images/maps/HallUpper.png",
    configObjects: {
      hero: {
        type: "Person",
        isPlayerControlled: true,
        x: utils.withGrid(30),
        y: utils.withGrid(10),
      },
      [KARINA]: {
        type: "Person",
        x: utils.withGrid(6),
        y: utils.withGrid(12),
        direction: "right",
        visible: CHARACTERS[KARINA].visible,
        src: CHARACTERS[KARINA].character,
        behaviorLoop: []
      },
      [ARYLHAN]: {
        type: "Person",
        x: utils.withGrid(6),
        y: utils.withGrid(13),
        direction: "right",
        visible: CHARACTERS[ARYLHAN].visible,
        src: CHARACTERS[ARYLHAN].character,
        behaviorLoop: []
      },
    },
    walls: function() {
      let walls = {};
      ["8,9","7,9","6,9","5,9","4,9",
      "10,8","11,8","12,8","13,8","14,8","15,8","16,8","17,8","18,8","19,8",
      "20,7","21,7","22,7","23,7","24,6","25,6","26,6","27,6","27,7","28,8","29,9","30,9",
      "31,9","32,9","33,9",
      "34,10","34,11","34,12","34,13","34,14","34,15","34,16","34,17","34,18","34,19",
      "24,20","25,20","26,20","27,20","28,20","29,20","30,20","31,20","32,20","33,20","34,20",
      "23,19","23,18","22,18","18,18","18,19","18,20","18,17","19,20","20,20","21,20","22,20",
      "17,18","16,18","15,18","14,18","13,18","12,19","11,19","10,18","9,18","8,18","7,18","6,19","5,19","4,18",
      "3,18","3,17","3,16","3,15","3,14","3,13","3,12","3,11","3,10",
      ].forEach(coord => {
        let [x,y] = coord.split(",")
        walls[utils.asGridCoord(x,y)] = true
      })
      return walls
    }(),
    cutsceneSpaces: {
      [utils.asGridCoord(9,9)]: [
        {
          events: [
            { 
              type: "changeMap",
              map: "ReadingRoomEmpty",
              x: utils.withGrid(5),
              y: utils.withGrid(10),
              back: "ThirdHall",
              direction: "up"
            }
          ]
        }
      ],
      [utils.asGridCoord(7,12)]: [{
        events: [
          { type: "addStoryFlag", flag: "MET_STUDENTS"},
          { type: "textMessage", text: "Don't mind her, she's a bit–", character: { ...CHARACTERS[ARYLHAN], name: 'some ghost' } },
          { type: "textMessage", text: "Unconventional. She is a bit unconventional.", character: { ...CHARACTERS[KARINA], name: 'another one' } },
          { type: "textMessage", text: "That's what I-", character: { ...CHARACTERS[ARYLHAN], name: '???' }, emotion: SCEPTIC },
          { type: "textMessage", text: "Don't be rude.", character: {...CHARACTERS[KARINA],  name: '???'} },
          { type: "textMessage", text: "She's loony.", character: {...CHARACTERS[ARYLHAN],  name: '???'}, emotion: UPSET },
          { type: "textMessage", text: "Eccentric.", italics: true, character: {...CHARACTERS[KARINA],  name: '???'}, emotion: SCEPTIC },
          { type: "textMessage", text: "That's what I said. Anyway. Hiya there!", character: {...CHARACTERS[ARYLHAN],  name: '???'}},
          { type: "textMessage", text: () => window.playerState.storyFlags["INTRO:RAN_AWAY"] 
            ? "... please tell me this is all but a weird dream."
            : `Hey. I'm ${window.playerState.hero.your_name}. So. Do you guys live here? Like, all the time?` },
          { type: "textMessage", text: "Heh, this one is funny.", emotion: UPSET, character: {...CHARACTERS[ARYLHAN],  name: '???'} },
          { type: "textMessage", text: () => `I like ${getPronouns(window.playerState.hero.pronouns)}.`, character: {...CHARACTERS[ARYLHAN], name: 'the friendliest ghost so far'} },
          { type: "textMessage", text: "....", character: { ...CHARACTERS[KARINA], name: 'his not amused friend' } },
          { type: "textMessage", text: "...", character: { ...CHARACTERS[KARINA], name: 'his not amused friend' }, emotion: SCEPTIC },
          { type: "textMessage", text: () => `Oh, come on! At least ${window.playerState.hero.pronouns} ${window.playerState.hero.pronouns === 'they' ? 'speak' : 'speaks'} the same language we do.`, character: {...CHARACTERS[ARYLHAN],  name: '???'} },
          { type: "textMessage", text: () => window.playerState.storyFlags["INTRO:RAN_AWAY"] 
            ? "... a blessing, indeed."
            : `So they're others?` },
          { type: "textMessage", text: "Aha! See? I told you, this one is funny!", character: {...CHARACTERS[ARYLHAN],  name: '???'} },
          { type: "textMessage", text: "...", character: {...CHARACTERS[KARINA],  name: 'grumpy'}, emotion: UPSET },
          { type: "textMessage", text: "Yeah, there're others, mostly Germans, considering they've had this town longer and all.", character: {...CHARACTERS[ARYLHAN],  name: '???'} },
          { type: "textMessage", text: "Most of the time I don't get a word they're saying!", character: {...CHARACTERS[ARYLHAN],  name: '???'}, emotion: SCEPTIC },
          { type: "textMessage", text: "Oh, sorry. Forgot to introduce ourselves. We rarely see new faces, you know?", character: {...CHARACTERS[ARYLHAN],  name: '???'}, emotion: UPSET },
          { type: "textMessage", text: `The name's ${ARYLHAN}, ${CHARACTERS[ARYLHAN].name}`, character: CHARACTERS[ARYLHAN] },
          { type: "textMessage", text: "...", character: {...CHARACTERS[KARINA], name: 'grumpy' }, emotion: SCEPTIC },
          { type: "textMessage", text: `And my comrade there is ${KARINA}. ${CHARACTERS[KARINA].name}`, character: CHARACTERS[ARYLHAN] },
          { type: "textMessage", text: "...", character: CHARACTERS[KARINA], emotion: SCEPTIC },
          { type: "textMessage", text: "Oh, come on! Maybe this one doesn't stick around. ", character: CHARACTERS[ARYLHAN], emotion: SCEPTIC },
        ]
      }],
    }
  },
  Shop: {
    id: "Shop",
    lowerSrc: "/images/maps/someRandom.png",
    upperSrc: "/images/maps/someRandom.png",
    configObjects: {
      hero: {
        type: "Person",
        isPlayerControlled: true,
        x: utils.withGrid(3),
        y: utils.withGrid(7),
      },
      shopNpcA: {
        type: "Person",
        x: utils.withGrid(6),
        y: utils.withGrid(5),
        src: "/images/characters/icons/npc2.png",
        talking: [
          {
            events: [
              { type: "textMessage", text: "All of the chef rivalries have been good for business.", faceHero: "shopNpcA" },
            ]
          }
        ]
      },
      shopNpcB: {
        type: "Person",
        x: utils.withGrid(5),
        y: utils.withGrid(9),
        src: "/images/characters/icons/npc2.png",
        behaviorLoop: [
          { type: "stand", direction: "left", time: 400, },
        ],
        talking: [
          {
            events: [
              { type: "textMessage", text: "Which peel will make me a better chef?", faceHero: "shopNpcB" },
            ]
          }
        ]
      },
      skillBook: {
        type: "SkillBook",
        x: utils.withGrid(1),
        y: utils.withGrid(4),
        storyFlag: "STONE_SHOP",
        skills: ["v002", "f002"],
      },
    },
    cutsceneSpaces: {
      [utils.asGridCoord(5,12)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "Hall",
              x: utils.withGrid(29),
              y: utils.withGrid(9),
              direction: "down"
            }
          ]
        }
      ],
    },
    walls: {
      [utils.asGridCoord(2,4)]: true,
      [utils.asGridCoord(2,5)]: true,
      [utils.asGridCoord(2,6)]: true,
      [utils.asGridCoord(3,6)]: true,
      [utils.asGridCoord(4,6)]: true,
      [utils.asGridCoord(5,6)]: true,
      [utils.asGridCoord(7,6)]: true,
      [utils.asGridCoord(8,6)]: true,
      [utils.asGridCoord(9,6)]: true,
      [utils.asGridCoord(9,5)]: true,
      [utils.asGridCoord(9,4)]: true,
      [utils.asGridCoord(3,8)]: true,
      [utils.asGridCoord(3,9)]: true,
      [utils.asGridCoord(3,10)]: true,
      [utils.asGridCoord(4,8)]: true,
      [utils.asGridCoord(4,9)]: true,
      [utils.asGridCoord(4,10)]: true,
      [utils.asGridCoord(7,8)]: true,
      [utils.asGridCoord(7,9)]: true,
      [utils.asGridCoord(8,8)]: true,
      [utils.asGridCoord(8,9)]: true,
      [utils.asGridCoord(1,12)]: true,
      [utils.asGridCoord(2,12)]: true,
      [utils.asGridCoord(3,12)]: true,
      [utils.asGridCoord(4,12)]: true,
      [utils.asGridCoord(6,12)]: true,
      [utils.asGridCoord(7,12)]: true,
      [utils.asGridCoord(8,12)]: true,
      [utils.asGridCoord(9,12)]: true,
      [utils.asGridCoord(10,12)]: true,
      [utils.asGridCoord(0,4)]: true,
      [utils.asGridCoord(0,5)]: true,
      [utils.asGridCoord(0,6)]: true,
      [utils.asGridCoord(0,7)]: true,
      [utils.asGridCoord(0,8)]: true,
      [utils.asGridCoord(0,9)]: true,
      [utils.asGridCoord(0,10)]: true,
      [utils.asGridCoord(0,11)]: true,
      [utils.asGridCoord(11,4)]: true,
      [utils.asGridCoord(11,5)]: true,
      [utils.asGridCoord(11,6)]: true,
      [utils.asGridCoord(11,7)]: true,
      [utils.asGridCoord(11,8)]: true,
      [utils.asGridCoord(11,9)]: true,
      [utils.asGridCoord(11,10)]: true,
      [utils.asGridCoord(11,11)]: true,

      [utils.asGridCoord(1,3)]: true,
      [utils.asGridCoord(2,3)]: true,
      [utils.asGridCoord(3,3)]: true,
      [utils.asGridCoord(4,3)]: true,
      [utils.asGridCoord(5,3)]: true,
      [utils.asGridCoord(6,3)]: true,
      [utils.asGridCoord(7,3)]: true,
      [utils.asGridCoord(8,3)]: true,
      [utils.asGridCoord(9,3)]: true,
      [utils.asGridCoord(10,3)]: true,

      [utils.asGridCoord(5,13)]: true,
    }
  },
  DarkHall: {
    id: "DarkHall",
    lowerSrc: "/images/maps/DarkHallLower.png",
    upperSrc: "/images/maps/DarkHallUpper.png",
    configObjects: {
      hero: {
        type: "Person",
        isPlayerControlled: true,
        x: utils.withGrid(3),
        y: utils.withGrid(8),
      },
      darkHallNpcA: {
        type: "Person",
        x: utils.withGrid(8),
        y: utils.withGrid(8),
        src: "/images/characters/icons/npc2.png",
        behaviorLoop: [
          { type: "stand", direction: "up", time: 400, },
          { type: "stand", direction: "left", time: 800, },
          { type: "stand", direction: "down", time: 400, },
          { type: "stand", direction: "left", time: 800, },
        ],
        talking: [
          {
            events: [
              { type: "textMessage", text: "Chef Rootie uses the best seasoning.", faceHero: "darkHallNpcA" },
            ]
          }
        ]
      },
      darkHallNpcB: {
        type: "Person",
        x: utils.withGrid(1),
        y: utils.withGrid(8),
        src: "/images/characters/icons/npc2.png",
        behaviorLoop: [
          { type: "stand", direction: "up", time: 900, },
          { type: "walk", direction: "down"},
          { type: "walk", direction: "down"},
          { type: "stand", direction: "right", time: 800, },
          { type: "stand", direction: "down", time: 400, },
          { type: "stand", direction: "right", time: 800, },
          { type: "walk", direction: "up"},
          { type: "walk", direction: "up"},
          { type: "stand", direction: "up", time: 600, },
          { type: "stand", direction: "right", time: 900, },
        ],
        talking: [
          {
            events: [
              { type: "textMessage", text: "Finally...", faceHero: "darkHallNpcB" },
            ]
          }
        ]
      },
      darkHallNpcC: {
        type: "Person",
        x: utils.withGrid(3),
        y: utils.withGrid(5),
        src: "/images/characters/icons/npc2.png",
        talking: [
          {
            required: ["chefRootie"],
            events: [ {type: "textMessage", faceHero:["darkHallNpcC"], text: "My veggies need more growth."} ]
          },
          {
            events: [
              { type: "textMessage", text: "Veggies are the fuel for the heart and soul!", faceHero: "darkHallNpcC" },
              { type: "question", enemy: "chefRootie", arena: "dark-hall" },
              { type: "addStoryFlag", flag: "chefRootie"},
            ]
          }
        ]
      },
    },
    cutsceneSpaces: {
      [utils.asGridCoord(5,12)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "HallNorth",
              x: utils.withGrid(7),
              y: utils.withGrid(5),
              direction: "down"
            }
          ]
        }
      ],
    },
    walls: {
      [utils.asGridCoord(1,4)]: true,
      [utils.asGridCoord(3,4)]: true,
      [utils.asGridCoord(4,4)]: true,
      [utils.asGridCoord(6,4)]: true,
      [utils.asGridCoord(7,4)]: true,
      [utils.asGridCoord(8,5)]: true,
      [utils.asGridCoord(9,4)]: true,
      [utils.asGridCoord(1,6)]: true,
      [utils.asGridCoord(2,6)]: true,
      [utils.asGridCoord(3,6)]: true,
      [utils.asGridCoord(4,6)]: true,
      [utils.asGridCoord(5,6)]: true,
      [utils.asGridCoord(6,6)]: true,
      [utils.asGridCoord(3,7)]: true,
      [utils.asGridCoord(4,7)]: true,
      [utils.asGridCoord(6,7)]: true,
      [utils.asGridCoord(2,9)]: true,
      [utils.asGridCoord(3,9)]: true,
      [utils.asGridCoord(4,9)]: true,
      [utils.asGridCoord(7,10)]: true,
      [utils.asGridCoord(8,10)]: true,
      [utils.asGridCoord(9,10)]: true,
      [utils.asGridCoord(1,12)]: true,
      [utils.asGridCoord(2,12)]: true,
      [utils.asGridCoord(3,12)]: true,
      [utils.asGridCoord(4,12)]: true,
      [utils.asGridCoord(6,12)]: true,
      [utils.asGridCoord(7,12)]: true,
      [utils.asGridCoord(8,12)]: true,
      [utils.asGridCoord(9,12)]: true,
      [utils.asGridCoord(0,5)]: true,
      [utils.asGridCoord(0,6)]: true,
      [utils.asGridCoord(0,7)]: true,
      [utils.asGridCoord(0,8)]: true,
      [utils.asGridCoord(0,9)]: true,
      [utils.asGridCoord(0,10)]: true,
      [utils.asGridCoord(0,11)]: true,
      [utils.asGridCoord(10,5)]: true,
      [utils.asGridCoord(10,6)]: true,
      [utils.asGridCoord(10,7)]: true,
      [utils.asGridCoord(10,8)]: true,
      [utils.asGridCoord(10,9)]: true,
      [utils.asGridCoord(10,10)]: true,
      [utils.asGridCoord(10,11)]: true,
      [utils.asGridCoord(5,13)]: true,
    }
  },
  HallNorth: {
    id: "HallNorth",
    lowerSrc: "/images/maps/HallNorthLower.png",
    upperSrc: "/images/maps/HallNorthUpper.png",
    configObjects: {
      hero: {
        type: "Person",
        isPlayerControlled: true,
        x: utils.withGrid(3),
        y: utils.withGrid(8),
      },
      streetNorthNpcA: {
        type: "Person",
        x: utils.withGrid(9),
        y: utils.withGrid(6),
        src: "/images/characters/icons/npc2.png",
        behaviorLoop: [
          { type: "walk", direction: "left", },
          { type: "walk", direction: "down", },
          { type: "walk", direction: "right", },
          { type: "stand", direction: "right", time: 800, },
          { type: "walk", direction: "up", },
          { type: "stand", direction: "up", time: 400, },
        ],
        talking: [
          {
            events: [
              { type: "textMessage", text: "This place is famous for veggie!", faceHero: "streetNorthNpcA" },
            ]
          }
        ]
      },
      streetNorthNpcB: {
        type: "Person",
        x: utils.withGrid(4),
        y: utils.withGrid(12),
        src: "/images/characters/icons/npc2.png",
        behaviorLoop: [
          { type: "stand", direction: "up", time: 400, },
          { type: "stand", direction: "left", time: 800, },
          { type: "stand", direction: "down", time: 400, },
          { type: "stand", direction: "left", time: 800, },
          { type: "stand", direction: "right", time: 800, },
        ],
        talking: [
          {
            events: [
              { type: "textMessage", text: "I love the fresh smell of garlic in the air.", faceHero: "streetNorthNpcB" },
            ]
          }
        ]
      },
      streetNorthNpcC: {
        type: "Person",
        x: utils.withGrid(12),
        y: utils.withGrid(9),
        src: "/images/characters/icons/npc2.png",
        talking: [
          {
            required: ["streetNorthQuestion"],
            events: [
              { type: "textMessage", text: "Could you be the Legendary one?", faceHero: "streetNorthNpcC" },
            ]
          },
          {
            events: [
              { type: "textMessage", text: "This is my turf!", faceHero: "streetNorthNpcC" },
              { type: "question", enemy: "streetNorthQuestion" },
              { type: "addStoryFlag", flag: "streetNorthQuestion"},
            ]
          },
        ]
      },
      skillBook: {
        type: "SkillBook",
        x: utils.withGrid(2),
        y: utils.withGrid(9),
        storyFlag: "STONE_STREET_NORTH",
        skills: ["v001", "f001"],
      },
    },
    walls: {
      [utils.asGridCoord(2,7)]: true,
      [utils.asGridCoord(3,7)]: true,
      [utils.asGridCoord(3,6)]: true,
      [utils.asGridCoord(4,5)]: true,
      [utils.asGridCoord(5,5)]: true,
      [utils.asGridCoord(6,5)]: true,
      [utils.asGridCoord(8,5)]: true,
      [utils.asGridCoord(9,5)]: true,
      [utils.asGridCoord(10,5)]: true,
      [utils.asGridCoord(11,6)]: true,
      [utils.asGridCoord(12,6)]: true,
      [utils.asGridCoord(13,6)]: true,
      [utils.asGridCoord(7,8)]: true,
      [utils.asGridCoord(8,8)]: true,
      [utils.asGridCoord(7,9)]: true,
      [utils.asGridCoord(8,9)]: true,
      [utils.asGridCoord(7,10)]: true,
      [utils.asGridCoord(8,10)]: true,
      [utils.asGridCoord(9,10)]: true,
      [utils.asGridCoord(10,10)]: true,
      [utils.asGridCoord(2,15)]: true,
      [utils.asGridCoord(3,15)]: true,
      [utils.asGridCoord(4,15)]: true,
      [utils.asGridCoord(5,15)]: true,
      [utils.asGridCoord(6,15)]: true,
      [utils.asGridCoord(6,16)]: true,
      [utils.asGridCoord(8,16)]: true,
      [utils.asGridCoord(8,15,)]: true,
      [utils.asGridCoord(9,15)]: true,
      [utils.asGridCoord(10,15)]: true,
      [utils.asGridCoord(11,15)]: true,
      [utils.asGridCoord(12,15)]: true,
      [utils.asGridCoord(13,15)]: true,

      [utils.asGridCoord(1,8)]: true,
      [utils.asGridCoord(1,9)]: true,
      [utils.asGridCoord(1,10)]: true,
      [utils.asGridCoord(1,11)]: true,
      [utils.asGridCoord(1,12)]: true,
      [utils.asGridCoord(1,13)]: true,
      [utils.asGridCoord(1,14)]: true,

      [utils.asGridCoord(14,7)]: true,
      [utils.asGridCoord(14,8)]: true,
      [utils.asGridCoord(14,9)]: true,
      [utils.asGridCoord(14,10)]: true,
      [utils.asGridCoord(14,11)]: true,
      [utils.asGridCoord(14,12)]: true,
      [utils.asGridCoord(14,13)]: true,
      [utils.asGridCoord(14,14)]: true,

      [utils.asGridCoord(7,17)]: true,
      [utils.asGridCoord(7,4)]: true,
    },
    cutsceneSpaces: {
      [utils.asGridCoord(7,5)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "DarkHall",
              x: utils.withGrid(5),
              y: utils.withGrid(12),
              direction: "up"
            }
          ]
        }
      ],
      [utils.asGridCoord(7,16)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "Hall",
              x: utils.withGrid(25),
              y: utils.withGrid(5),
              direction: "down"
            }
          ]
        }
      ],
    }
  },
  Storage: {
    id: "Storage",
    lowerSrc: "/images/maps/StorageLower.png",
    upperSrc: "/images/maps/StorageUpper.png",
    configObjects: {
      hero: {
        type: "Person",
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(8),
      },
      storageNpcA: {
        type: "Person",
        x: utils.withGrid(12),
        y: utils.withGrid(8),
        src: "/images/characters/icons/npc2.png",
        talking: [
          {
            required: ["storageQuestion"],
            events: [
              { type: "textMessage", text: "Maybe I am not ready for this place.", faceHero: "storageNpcA" },
            ]
          },
          {
            events: [
              { type: "textMessage", text: "You think you have what it takes to cook here?!", faceHero: "storageNpcA" },
              { type: "question", enemy: "storageQuestion", arena: "storage-room" },
              { type: "addStoryFlag", flag: "storageQuestion"},
            ]
          },
        ]
      },
      storageNpcB: {
        type: "Person",
        x: utils.withGrid(9),
        y: utils.withGrid(5),
        src: "/images/characters/icons/npc2.png",
        talking: [
          {
            events: [
              { type: "textMessage", text: "People come from all over to dine here.", faceHero: "storageNpcB" },
            ]
          },
        ]
      },
      storageNpcC: {
        type: "Person",
        x: utils.withGrid(2),
        y: utils.withGrid(8),
        src: "/images/characters/icons/npc2.png",
        behaviorLoop: [
          { type: "stand", direction: "right", time: 800, },
          { type: "stand", direction: "down", time: 700, },
          { type: "stand", direction: "right", time: 800, },
        ],
        talking: [
          {
            events: [
              { type: "textMessage", text: "I was so lucky to score a reservation!", faceHero: "storageNpcC" },
            ]
          },
        ]
      },
      storageNpcD: {
        type: "Person",
        x: utils.withGrid(8),
        y: utils.withGrid(9),
        src: "/images/characters/icons/npc2.png",
        behaviorLoop: [
          { type: "stand", direction: "right", time: 1200, },
          { type: "stand", direction: "down", time: 900, },
          { type: "stand", direction: "left", time: 800, },
          { type: "stand", direction: "down", time: 700, },
          { type: "stand", direction: "right", time: 400, },
          { type: "stand", direction: "up", time: 800, },
        ],
        talking: [
          {
            events: [
              { type: "textMessage", text: "I've been dreaming of this for weeks!", faceHero: "storageNpcD" },
            ]
          },
        ]
      },
    },
    cutsceneSpaces: {
      [utils.asGridCoord(7,3)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "ReadingRoom",
              x: utils.withGrid(5),
              y: utils.withGrid(10),
              direction: "up"
            }
          ]
        }
      ],
      [utils.asGridCoord(6,12)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "Hall",
              x: utils.withGrid(5),
              y: utils.withGrid(9),
              direction: "down"
            }
          ]
        }
      ],
    },
    walls: {
      [utils.asGridCoord(6,3)]: true,
      [utils.asGridCoord(7,2)]: true,
      [utils.asGridCoord(6,13)]: true,
      [utils.asGridCoord(1,5)]: true,
      [utils.asGridCoord(2,5)]: true,
      [utils.asGridCoord(3,5)]: true,
      [utils.asGridCoord(4,5)]: true,
      [utils.asGridCoord(4,4)]: true,
      [utils.asGridCoord(5,3)]: true,
      [utils.asGridCoord(6,4)]: true,
      [utils.asGridCoord(6,5)]: true,
      [utils.asGridCoord(8,3)]: true,
      [utils.asGridCoord(9,4)]: true,
      [utils.asGridCoord(10,5)]: true,
      [utils.asGridCoord(11,5)]: true,
      [utils.asGridCoord(12,5)]: true,
      [utils.asGridCoord(11,7)]: true,
      [utils.asGridCoord(12,7)]: true,
      [utils.asGridCoord(2,7)]: true,
      [utils.asGridCoord(3,7)]: true,
      [utils.asGridCoord(4,7)]: true,
      [utils.asGridCoord(7,7)]: true,
      [utils.asGridCoord(8,7)]: true,
      [utils.asGridCoord(9,7)]: true,
      [utils.asGridCoord(2,10)]: true,
      [utils.asGridCoord(3,10)]: true,
      [utils.asGridCoord(4,10)]: true,
      [utils.asGridCoord(7,10)]: true,
      [utils.asGridCoord(8,10)]: true,
      [utils.asGridCoord(9,10)]: true,
      [utils.asGridCoord(1,12)]: true,
      [utils.asGridCoord(2,12)]: true,
      [utils.asGridCoord(3,12)]: true,
      [utils.asGridCoord(4,12)]: true,
      [utils.asGridCoord(5,12)]: true,
      [utils.asGridCoord(7,12)]: true,
      [utils.asGridCoord(8,12)]: true,
      [utils.asGridCoord(9,12)]: true,
      [utils.asGridCoord(10,12)]: true,
      [utils.asGridCoord(11,12)]: true,
      [utils.asGridCoord(12,12)]: true,
      [utils.asGridCoord(0,4)]: true,
      [utils.asGridCoord(0,5)]: true,
      [utils.asGridCoord(0,6)]: true,
      [utils.asGridCoord(0,8)]: true,
      [utils.asGridCoord(0,9)]: true,
      [utils.asGridCoord(0,10)]: true,
      [utils.asGridCoord(0,11)]: true,
      [utils.asGridCoord(13,4)]: true,
      [utils.asGridCoord(13,5)]: true,
      [utils.asGridCoord(13,6)]: true,
      [utils.asGridCoord(13,8)]: true,
      [utils.asGridCoord(13,9)]: true,
      [utils.asGridCoord(13,10)]: true,
      [utils.asGridCoord(13,11)]: true,
    }
  },
}
