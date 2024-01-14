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
const MET_STUDENTS = 'MET_STUDENTS'
const GREETED_BY_MRS_T = 'GREETED_BY_MRS_T'

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
    const { x, y } = utils.nextPosition(currentX, currentY, direction)
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
      switch (object.type) {
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


    for (let i = 0; i < events.length; i++) {
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
    const match = this.cutsceneSpaces[`${hero.x},${hero.y}`]
    if (!this.isCutscenePlaying && match) {
      const _events = match[0]?.events
      const events = typeof _events === 'function' ? _events() : _events
      this.startCutscene(events)
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
      [utils.asGridCoord(5, 10)]: [
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
      [utils.asGridCoord(11, 6)]: [{
        disqualify: ["SEEN_INTRO"],
        events: [
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
          {
            type: "prompt", options: [
              {
                text: "run away", actions: [
                  { type: "addStoryFlag", flag: RAN_AWAY, upSkill: '0quick' },
                  { type: "textMessage", text: "A-A-A-A!!!" },
                  { type: "walk", who: HERO, direction: "right" },
                  { type: "walk", who: HERO, direction: "down" },
                  { type: "walk", who: HERO, direction: "down" },
                  { type: "walk", who: HERO, direction: "left" },
                  { type: "walk", who: HERO, direction: "left" },
                  { type: "walk", who: HERO, direction: "left" },
                  { type: "walk", who: HERO, direction: "left" },
                  { type: "walk", who: HERO, direction: "left" },
                  { type: "walk", who: HERO, direction: "down" },
                  { type: "walk", who: HERO, direction: "left" },
                  { type: "walk", who: HERO, direction: "left" },
                  { type: "walk", who: HERO, direction: "down" },
                  {
                    type: "changeMap",
                    map: "Hall",
                    x: utils.withGrid(9),
                    y: utils.withGrid(10),
                    direction: "down"
                  }
                ]
              },
              {
                text: "keep quiet and watch", actions: [
                  { type: "addStoryFlag", flag: QUIET_WATCH, upSkill: '0obs' },
                  { type: "stand", who: HERR_DOKTOR, direction: "up", time: 1000 },
                  { type: "walk", who: HERR_DOKTOR, direction: "left" },
                  { type: "stand", who: HERR_DOKTOR, direction: "left", time: 500 },
                  { type: "stand", who: HERR_DOKTOR, direction: "up", time: 500 },
                  {
                    type: "changeMap",
                    map: "ReadingRoomEmpty",
                    x: utils.withGrid(11),
                    y: utils.withGrid(6),
                    direction: "left",
                    disappear: true,
                    shadeOptions: "width:14px;height:18px;top:60px;left:9px;border-radius:50px;filter:blur(3px);"
                  },
                  { type: "textMessage", text: "...a-and he went through the bookshelves..." },
                  { type: "textMessage", text: "Of course." },
                ]
              }
            ]
          },
        ]
      }],
      [utils.asGridCoord(4, 4)]: [{
        events: [
          { type: "textMessage", text: "Ugh, it's locked. The security guard should come by the morning." },
        ]
      }]
    },
    walls: function () {
      let walls = {};
      ["1,10", "2,10", "3,10", "4,10", "6,10", "7,10", "8,10", "9,10", "10,10", "11,10", "12,10",
        "1,3", "2,3", "3,3", "4,3", "5,3", "6,3", "7,3", "8,3", "9,3", "10,3", "11,3", "12,3",
        "0,3", "0,4", "0,5", "0,6", "0,7", "0,8", "0,9",
        "13,3", "13,4", "13,5", "13,6", "13,7", "13,8", "13,9",
        "12,9", "11,9", "9,9", "8,9", "6,7", "7,7", "9,7", "10,7", "11,7", "5,11"
      ].forEach(coord => {
        let [x, y] = coord.split(",")
        walls[utils.asGridCoord(x, y)] = true
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
      [utils.asGridCoord(5, 10)]: [
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
      [utils.asGridCoord(4, 4)]: [{
        events: [
          { type: "textMessage", text: "Ugh, it's locked. The security guard should come by the morning." },
        ]
      }]
    },
    walls: function () {
      let walls = {};
      ["1,10", "2,10", "3,10", "4,10", "6,10", "7,10", "8,10", "9,10", "10,10", "11,10", "12,10",
        "1,3", "2,3", "3,3", "4,3", "5,3", "6,3", "7,3", "8,3", "9,3", "10,3", "11,3", "12,3",
        "0,3", "0,4", "0,5", "0,6", "0,7", "0,8", "0,9",
        "13,3", "13,4", "13,5", "13,6", "13,7", "13,8", "13,9",
        "12,9", "11,9", "9,9", "8,9", "6,7", "7,7", "9,7", "10,7", "11,7", "5,11"
      ].forEach(coord => {
        let [x, y] = coord.split(",")
        walls[utils.asGridCoord(x, y)] = true
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
          { type: "stand", who: MRS_T, direction: "down", time: 4000 },
          {
            type: "textMessage", text: "Oh, dear, oh dear!", character:
            {
              name: () => window.playerState.storyFlags[GREETED_BY_MRS_T]
                ? CHARACTERS[MRS_T].name
                : "another ghost???",
              avatar: CHARACTERS[MRS_T].avatar, emotion: UPSET
            }
          },
          { type: "stand", who: MRS_T, direction: "left", time: 500 },
          { type: "stand", who: MRS_T, direction: "right", time: 500 },
          { type: "walk", who: MRS_T, direction: "left" },
          { type: "walk", who: MRS_T, direction: "left" },
          { type: "walk", who: MRS_T, direction: "left" },
          { type: "walk", who: MRS_T, direction: "left" },
          { type: "stand", who: MRS_T, direction: "up", time: 500 },
          { type: "stand", who: MRS_T, direction: "right", time: 500 },
          {
            type: "textMessage", text: "Isn't the weather just lovely today?", character:
            {
              name: () => window.playerState.storyFlags[GREETED_BY_MRS_T]
                ? CHARACTERS[MRS_T].name
                : "another ghost???",
              avatar: CHARACTERS[MRS_T].avatar
            }
          },
          { type: "walk", who: MRS_T, direction: "down" },
          { type: "walk", who: MRS_T, direction: "down" },
          { type: "walk", who: MRS_T, direction: "right" },
          { type: "walk", who: MRS_T, direction: "right" },
          { type: "walk", who: MRS_T, direction: "right" },
          { type: "walk", who: MRS_T, direction: "right" },
          { type: "stand", who: MRS_T, direction: "left", time: 500 },
          { type: "stand", who: MRS_T, direction: "right", time: 500 },
          { type: "stand", who: MRS_T, direction: "down", time: 3000 },
        ],
        talking: [
          {
            required: [GREETED_BY_MRS_T],
            events: [
              { type: "textMessage", text: "Goodness gracious, where are my manners?", faceHero: MRS_T, character: CHARACTERS[MRS_T], emotion: UPSET },
              { type: "textMessage", text: "Please, accept my apologies... I am Mrs... do you happen to know my name?", faceHero: MRS_T, character: CHARACTERS[MRS_T] },
            ]
          },
          {
            events: [
              { type: "textMessage", character: { name: "a ghost?", avatar: CHARACTERS[MRS_T].avatar }, text: "Oh, hello, dear. I believe we never were introduced?", faceHero: MRS_T },
              { type: "addStoryFlag", flag: GREETED_BY_MRS_T },
              { type: "question", enemy: { ...CHARACTERS[MRS_T], name: "Mrs Ghost Lady" }, arena: "hall" },
              { type: "textMessage", text: "Oh dear. So many things to do, so little time! Please, excuse me, dear.", character: { ...CHARACTERS[MRS_T], name: "" } },
              { type: "stand", who: MRS_T, direction: "down", time: 500 },
              { type: "walk", who: MRS_T, direction: "right" },
              { type: "walk", who: MRS_T, direction: "right" },
              { type: "walk", who: MRS_T, direction: "right" },
              { type: "walk", who: MRS_T, direction: "right" },
              { type: "walk", who: MRS_T, direction: "right" },
              { type: "textMessage", text: "Wait!" },
              { type: "walk", who: HERO, direction: "right" },
              { type: "walk", who: MRS_T, direction: "right" },
              { type: "walk", who: MRS_T, direction: "right" },
              { type: "walk", who: MRS_T, direction: "right" },
              { type: "walk", who: MRS_T, direction: "right" },
              { type: "walk", who: MRS_T, direction: "right" },
              { type: "walk", who: MRS_T, direction: "right" },
              { type: "walk", who: MRS_T, direction: "right" },
              { type: "walk", who: MRS_T, direction: "down" },
              { type: "walk", who: MRS_T, direction: "down" },
              { type: "walk", who: MRS_T, direction: "down" },
              { type: "walk", who: MRS_T, direction: "down" },
              { type: "walk", who: MRS_T, direction: "down" },
              { type: "walk", who: MRS_T, direction: "down" },
              { type: "walk", who: MRS_T, direction: "down" },
              { type: "stand", who: HERO, direction: "left" },
              { type: "stand", who: HERO, direction: "right" },
              { type: "textMessage", text: "Great. Now she's gone too!" },
              { type: "stand", who: HERO, direction: "down" },
              { type: "textMessage", text: "*some noise*" },
              { type: "textMessage", text: "Huh?" },
              { type: "walk", who: HERO, direction: "right" },
              { type: "walk", who: HERO, direction: "right" },
              { type: "walk", who: HERO, direction: "right" },
              { type: "walk", who: HERO, direction: "right" },
              { type: "walk", who: HERO, direction: "right" },
              { type: "walk", who: HERO, direction: "right" },
              { type: "walk", who: HERO, direction: "right" },
              { type: "walk", who: HERO, direction: "right" },
              { type: "walk", who: HERO, direction: "right" },
              {
                type: "textMessage", text: () => window.playerState.storyFlags["INTRO:RAN_AWAY"]
                  ? "... ugh, let's hope they're friendly and don't eat people."
                  : `Anyone in there? Helloooo!`
              },
              { type: "stand", who: HERO, direction: "up" },
              {
                type: "changeMap",
                map: "StorageRoom",
                x: utils.withGrid(7),
                y: utils.withGrid(12),
                direction: "up",
              }
            ]
          },
        ]
      },
    },
    walls: function () {
      let walls = {};
      ["8,9", "7,9", "6,9", "5,9", "4,9",
        "10,8", "11,8", "12,8", "13,8", "14,8", "15,8", "16,8", "17,8", "18,8", "19,8",
        "20,7", "21,7", "22,7", "23,7", "24,6", "25,6", "26,6", "27,6", "27,7", "28,8", "30,9",
        "31,9", "32,9", "33,9",
        "34,10", "34,11", "34,12", "34,13", "34,14", "34,15", "34,16", "34,17", "34,18", "34,19",
        "24,20", "25,20", "26,20", "27,20", "28,20", "29,20", "30,20", "31,20", "32,20", "33,20", "34,20",
        "23,19", "23,18", "22,18", "18,18", "18,19", "18,20", "18,17", "19,20", "20,20", "21,20", "22,20",
        "17,18", "16,18", "15,18", "14,18", "13,18", "12,19", "11,19", "10,18", "9,18", "8,18", "7,18", "6,19", "5,19", "4,18",
        "3,18", "3,17", "3,16", "3,15", "3,14", "3,13", "3,12", "3,11", "3,10",
      ].forEach(coord => {
        let [x, y] = coord.split(",")
        walls[utils.asGridCoord(x, y)] = true
      })
      return walls
    }(),
    cutsceneSpaces: {
      [utils.asGridCoord(9, 9)]: [
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
      [utils.asGridCoord(29, 9)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "StorageRoom",
              x: utils.withGrid(7),
              y: utils.withGrid(12),
              direction: "up",
            }
          ]
        }
      ],
      [utils.asGridCoord(9, 11)]: [{
        events: [
          { type: "textMessage", text: "Huh? Who's there?" },
        ]
      }],
    }
  },
  StorageRoom: {
    id: "StorageRoom",
    lowerSrc: "/images/maps/RoomLower.png",
    upperSrc: "/images/maps/RoomUpper.png",
    configObjects: {
      hero: {
        type: "Person",
        isPlayerControlled: true,
        x: utils.withGrid(7),
        y: utils.withGrid(12),
      },
      [KARINA]: {
        type: "Person",
        x: utils.withGrid(6),
        y: utils.withGrid(11),
        direction: "right",
        visible: CHARACTERS[KARINA].visible,
        src: CHARACTERS[KARINA].character,
        talking: [
          {
            required: ["TALKED_TO_KARINA"],
            events: [
              { type: "textMessage", text: "todo", faceHero: KARINA, character: CHARACTERS[KARINA], emotion: UPSET },
              { type: "textMessage", text: "todo", faceHero: KARINA, character: CHARACTERS[KARINA] },
            ]
          },
          {
            events: [
              { type: "textMessage", character: CHARACTERS[KARINA], text: "todo", faceHero: KARINA },
              { type: "addStoryFlag", flag: "TALKED_TO_KARINA" },
              { type: "question", enemy: CHARACTERS[KARINA], arena: "storage-room" },
              { type: "textMessage", text: "todo", character: CHARACTERS[KARINA] },
            ]
          },
        ],
        behaviorLoop: [{ type: "stand", who: KARINA, direction: "right", time: 30000 },
        {
          type: "textMessage", text: "...", character:
          {
            name: () => window.playerState.storyFlags[MET_STUDENTS]
              ? CHARACTERS[KARINA].name
              : "???",
            avatar: CHARACTERS[KARINA].avatar,
          }
        },
        {
          type: "textMessage", text: "...", character:
          {
            name: () => window.playerState.storyFlags[MET_STUDENTS]
              ? CHARACTERS[KARINA].name
              : "???",
            avatar: CHARACTERS[KARINA].avatar,
            emotion: SCEPTIC
          }
        }, {
          type: "textMessage", text: "...", character:
          {
            name: () => window.playerState.storyFlags[MET_STUDENTS]
              ? CHARACTERS[KARINA].name
              : "???",
            avatar: CHARACTERS[KARINA].avatar,
          }
        }, { type: "stand", who: KARINA, direction: "right", time: 20000 }]
      },
      [ARYLHAN]: {
        type: "Person",
        x: utils.withGrid(8),
        y: utils.withGrid(11),
        direction: "left",
        visible: CHARACTERS[ARYLHAN].visible,
        src: CHARACTERS[ARYLHAN].character,
        talking: [
          {
            required: ["TALKED_TO_ARYLHAN"],
            events: [
              { type: "textMessage", text: "Karina's been teaching me German so that I understand the others. Dunno, sometimes they seem to get me just fine.", faceHero: ARYLHAN, character: CHARACTERS[ARYLHAN], emotion: SCEPTIC },
              { type: "textMessage", text: "Guess you don't wanna run into the Doctor. Don't tell him I said that.", faceHero: ARYLHAN, character: CHARACTERS[ARYLHAN], emotion: UPSET },
              { type: "textMessage", text: "You'll be fi-i-i-i-ine. Probably.", faceHero: ARYLHAN, character: CHARACTERS[ARYLHAN] },
            ]
          },
          {
            events: [
              { type: "textMessage", character: CHARACTERS[ARYLHAN], text: "Hiya", faceHero: ARYLHAN },
              { type: "addStoryFlag", flag: "TALKED_TO_ARYLHAN" },
              { type: "question", enemy: CHARACTERS[ARYLHAN], arena: "storage-room" },
              { type: "textMessage", text: "todo", character: CHARACTERS[ARYLHAN] },
            ]
          },
        ],
        behaviorLoop: [{ type: "stand", who: ARYLHAN, direction: "left", time: 15000 },
        {
          type: "textMessage", text: "You can talk to us, you know?", character:
          {
            name: () => window.playerState.storyFlags[MET_STUDENTS]
              ? CHARACTERS[ARYLHAN].name
              : "a friendly guy",
            avatar: CHARACTERS[ARYLHAN].avatar,
          }
        },
        {
          type: "textMessage", text: "Please do! It's so-o-o boring in here.", character:
          {
            name: () => window.playerState.storyFlags[MET_STUDENTS]
              ? CHARACTERS[ARYLHAN].name
              : "a friendly guy",
            avatar: CHARACTERS[ARYLHAN].avatar,
          }
        },
        { type: "walk", who: ARYLHAN, direction: "up" },
        { type: "walk", who: ARYLHAN, direction: "up" },
        { type: "stand", who: ARYLHAN, direction: "left", time: 3000 },
        {
          type: "textMessage", text: "How's it out there? Did we send more people into space?", character:
          {
            name: () => window.playerState.storyFlags[MET_STUDENTS]
              ? CHARACTERS[ARYLHAN].name
              : "a friendly guy",
            avatar: CHARACTERS[ARYLHAN].avatar,
          }
        },
        { type: "walk", who: ARYLHAN, direction: "down" },
        { type: "walk", who: ARYLHAN, direction: "down" },
        { type: "stand", who: ARYLHAN, direction: "left", time: 20000 },
        {
          type: "textMessage", text: "Oh! Tell me about the latest USSR space program!", character:
          {
            name: () => window.playerState.storyFlags[MET_STUDENTS]
              ? CHARACTERS[ARYLHAN].name
              : "a friendly guy",
            avatar: CHARACTERS[ARYLHAN].avatar,
          }
        },]
      },
    },
    walls: function () {
      let walls = {};
      ["6,12", "5,12", "4,12", "3,12", "2,12", "1,12", "0,12", "0,11", "0,10", "0,9", "0,8", "0,7", "0,6", "0,5", "1,4", "2,4", "3,3", "4,3", "5,3", "6,3", "7,3", "8,3", "9,3", "10,3", "11,3", "12,3", "13,3", "13,4", "13,5", "13,6", "13,7", "13,8", "13,9", "13,10", "13,11", "12,12", "11,12", "10,12", "9,12", "8,12", "10,7", "9,7", "11,7"
      ].forEach(coord => {
        let [x, y] = coord.split(",")
        walls[utils.asGridCoord(x, y)] = true
      })
      return walls
    }(),
    cutsceneSpaces: {
      [utils.asGridCoord(7, 13)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "Hall",
              x: utils.withGrid(30),
              y: utils.withGrid(10),
              back: "StorageRoom",
              direction: "down"
            }
          ]
        }
      ],
      [utils.asGridCoord(11, 4)]: [{
        events: [
          { type: "textMessage", text: "They got some really weird stuff in here." },
        ]
      }],
      [utils.asGridCoord(4, 4)]: [{
        events: [
          { type: "textMessage", text: "Wonder how long these books have been here. Wait. Are those German?.." },
        ]
      }],
      [utils.asGridCoord(7, 11)]: [{
        events: () => window.playerState.storyFlags[MET_STUDENTS] ? [] : [
          { type: "addStoryFlag", flag: MET_STUDENTS },
          { type: "textMessage", text: "Don't mind Mrs T, she's a bit–", character: { ...CHARACTERS[ARYLHAN], name: 'some ghost' } },
          { type: "textMessage", text: "Unconventional. She is a bit unconventional.", character: { ...CHARACTERS[KARINA], name: 'another one' } },
          { type: "textMessage", text: "That's what I-", character: { ...CHARACTERS[ARYLHAN], name: '???' }, emotion: SCEPTIC },
          { type: "textMessage", text: "Don't be rude.", character: { ...CHARACTERS[KARINA], name: '???' } },
          { type: "textMessage", text: "She's loony.", character: { ...CHARACTERS[ARYLHAN], name: '???' }, emotion: UPSET },
          { type: "textMessage", text: "Eccentric.", italics: true, character: { ...CHARACTERS[KARINA], name: '???' }, emotion: SCEPTIC },
          { type: "textMessage", text: "That's what I said. Anyway. Hiya there!", character: { ...CHARACTERS[ARYLHAN], name: '???' } },
          {
            type: "textMessage", text: () => window.playerState.storyFlags["INTRO:RAN_AWAY"]
              ? "... please tell me this is all but a weird dream."
              : `Hey. I'm ${window.playerState.hero.your_name}. So. Do you guys live here? Like, all the time?`
          },
          { type: "textMessage", text: "Heh, this one is funny.", emotion: UPSET, character: { ...CHARACTERS[ARYLHAN], name: '???' } },
          { type: "textMessage", text: () => `I like ${getPronouns(window.playerState.hero.pronouns)}.`, character: { ...CHARACTERS[ARYLHAN], name: 'the friendliest ghost so far' } },
          { type: "textMessage", text: "....", character: { ...CHARACTERS[KARINA], name: 'his not amused friend' } },
          { type: "textMessage", text: "...", character: { ...CHARACTERS[KARINA], name: 'his not amused friend' }, emotion: SCEPTIC },
          { type: "textMessage", text: () => `Oh, come on! At least ${window.playerState.hero.pronouns} ${window.playerState.hero.pronouns === 'they' ? 'speak' : 'speaks'} the same language we do.`, character: { ...CHARACTERS[ARYLHAN], name: '???' } },
          {
            type: "textMessage", emotion: SCEPTIC, character: { ...CHARACTERS[KARINA], name: 'his not amused friend' }, text: () => window.playerState.storyFlags["INTRO:RAN_AWAY"]
              ? "... a blessing, indeed."
              : `So they're others?`
          },
          { type: "textMessage", text: "Aha! See? I told you, this one is funny!", character: { ...CHARACTERS[ARYLHAN], name: '???' } },
          { type: "textMessage", text: "...", character: { ...CHARACTERS[KARINA], name: 'grumpy' }, emotion: UPSET },
          { type: "textMessage", text: "Yeah, there're others, mostly Germans, considering they've had this town longer and all.", character: { ...CHARACTERS[ARYLHAN], name: '???' } },
          { type: "textMessage", text: "Most of the time I don't get a word they're saying!", character: { ...CHARACTERS[ARYLHAN], name: '???' }, emotion: SCEPTIC },
          { type: "textMessage", text: "Oh, sorry. Forgot to introduce ourselves. We rarely see new faces, ya know?", character: { ...CHARACTERS[ARYLHAN], name: '???' }, emotion: UPSET },
          { type: "textMessage", text: `The name's ${ARYLHAN}, ${CHARACTERS[ARYLHAN].name}`, character: CHARACTERS[ARYLHAN] },
          { type: "textMessage", text: "...", character: { ...CHARACTERS[KARINA], name: 'grumpy' }, emotion: SCEPTIC },
          { type: "textMessage", text: `And my comrade there is ${KARINA}. ${CHARACTERS[KARINA].name}`, character: CHARACTERS[ARYLHAN] },
          { type: "textMessage", text: "...", character: CHARACTERS[KARINA], emotion: SCEPTIC },
          { type: "textMessage", text: "Oh, come on! Maybe this one doesn't stick around.", character: CHARACTERS[ARYLHAN], emotion: SCEPTIC },
        ]
      }],
    }
  },
}
