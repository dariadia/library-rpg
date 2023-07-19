const MILOS = 'Miloš'

const CHARACTERS = {
  MILOS: {
    id: MILOS,
    name: 'Miloš Lukić',
    avatar: ''
  }
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
    ctx.drawImage(
      this.lowerImage, 
      utils.withGrid(10.5) - cameraPerson.x, 
      utils.withGrid(6) - cameraPerson.y
    )
  }

  drawUpperImage(ctx, cameraPerson) {
    ctx.drawImage(
      this.upperImage, 
      utils.withGrid(10.5) - cameraPerson.x, 
      utils.withGrid(6) - cameraPerson.y
    )
  } 

  isSpaceTaken(currentX, currentY, direction) {
    const {x,y} = utils.nextPosition(currentX, currentY, direction)
    if (this.walls[`${x},${y}`]) return true
    return Object.values(this.gameObjects).find(obj => {
      if (obj.x === x && obj.y === y) { return true }
      if (obj.intentPosition 
        && obj.intentPosition[0] === x 
        && obj.intentPosition[1] === y ) return true
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
        case 'PizzaStone':
          instance = new PizzaStone(object)
      }
      this.gameObjects[key] = instance
      this.gameObjects[key].id = key
      instance.mount(this)
    })
  }

  async startCutscene(events) {
    this.isCutscenePlaying = true

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
  }

  checkForActionCutscene() {
    const hero = this.gameObjects["hero"]
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
    const hero = this.gameObjects["hero"]
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
        x: utils.withGrid(10),
        y: utils.withGrid(5),
      },
      Milos: {
        type: "Person",
        x: utils.withGrid(5),
        y: utils.withGrid(5),
        direction: "up",
        src: "/images/characters/people/milos.png",
        talking: [
          {
            events: [
              { type: "textMessage", character: CHARACTERS.MILOS, sayRandom: true },
            ]
          }
        ],
        behaviorLoop: [
          { type: "stand", direction: "up", time: 2000 },
          { type: "walk", direction: "right", },
          { type: "walk", direction: "right", },
          { type: "walk", direction: "right", },
          { type: "walk", direction: "right", },
          { type: "stand", direction: "right", time: 500 },
          { type: "stand", direction: "left", time: 1000 },
          { type: "walk", direction: "down", },
          { type: "walk", direction: "left", },
          { type: "walk", direction: "left", },
          { type: "walk", direction: "left", },
          { type: "walk", direction: "left", },
          { type: "walk", direction: "up", },
          { type: "stand", direction: "up", time: 1000 },
          { type: "stand", direction: "left", time: 500 },
        ]
      },
      // readingRoomNpcB: {
      //   type: "Person",
      //   x: utils.withGrid(3),
      //   y: utils.withGrid(6),
      //   src: "/images/characters/people/npc3.png",
      //   talking: [
      //     {
      //       events: [
      //         { type: "textMessage", text: "People take their jobs here very seriously.", faceHero: "readingRoomNpcB" },
      //       ]
      //     }
      //   ],
      //   behaviorLoop: [
      //     { type: "walk", direction: "right", },
      //     { type: "walk", direction: "right", },
      //     { type: "walk", direction: "down", },
      //     { type: "walk", direction: "down", },
      //     { type: "walk", direction: "left", },
      //     { type: "walk", direction: "left", },
      //     { type: "walk", direction: "up", },
      //     { type: "walk", direction: "up", },
      //     { type: "stand", direction: "up", time: 500 },
      //     { type: "stand", direction: "left", time: 500 },
      //   ]
      // },
    },
    cutsceneSpaces: {
      [utils.asGridCoord(5,10)]: [
        {
          events: [
            { 
              type: "changeMap", 
              map: "ReadingRoom",
              x: utils.withGrid(7),
              y: utils.withGrid(3),
              direction: "down"
            }
          ]
        }
      ],
      [utils.asGridCoord(9,5)]: [{
        disqualify: ["SEEN_INTRO"],
        events: [
          { type: "addStoryFlag", flag: "SEEN_INTRO"},
          { type: "textMessage", text: "* You fall asleep in the library only to realise you've been locked in *"},
          { type: "walk", who: "Milos", direction: "right"},
          { type: "walk", who: "Milos", direction: "right"},
          { type: "walk", who: "Milos", direction: "right"},
          { type: "stand", who: "Milos", direction: "right", time: 200},
          { type: "stand", who: "hero", direction: "left", time: 200},
          { type: "textMessage", text: "Howdy! First time dead?", character: CHARACTERS.MILOS },
          // { type: "textMessage", text: "Ahah, just kidding. But those books of yours look plenty enough to kill."},
          // { type: "textMessage", text: "Happened before, *nudges you* you'd never believe the things you get to see around these parts."},
          // { type: "textMessage", text: "Like Miss Tussy over there. The name is Miloš, by the way. That's a 'sh' at the end, make an effort."},
          // { type: "stand", who: "Milos", direction: "up", time: 200},
          // { type: "walk", who: "Milos", direction: "down"},
          // { type: "walk", who: "Milos", direction: "left"},
          // { type: "walk", who: "Milos", direction: "left"},
          // { type: "stand", who: "hero", direction: "down", time: 400},
          // { type: "stand", who: "Milos", direction: "right", time: 300},
          // { type: "textMessage", text: "*shouts after you*  Also, you're stuck with till the morning. Have fun!"},
          // { type: "stand", who: "Milos", direction: "left", time: 300},
          // { type: "textMessage", text: "This is just a dream. A really weird dream *you tell yourself*"},
          // { type: "textMessage", text: "Might as well explore it. For research purposes."},
          {
            type: "changeMap",
            map: "Hall",
            x: utils.withGrid(9),
            y: utils.withGrid(10),
            direction: "down"
          },
        ]
      }]
    },
    walls: function() {
      let walls = {};
      ["1,10","2,10","3,10","4,10","6,10","7,10","8,10","9,10","10,10","11,10","12,10",
      "1,3","2,3","3,3","4,3","5,3","6,3","7,3","8,3","9,3","10,3","11,3","12,3",
      "0,3","0,4","0,5","0,6","0,7","0,8","0,9",
      "13,3","13,4","13,5","13,6","13,7","13,8","13,9",
      "12,9","11,9","9,9","8,9","6,7","7,7","9,7","10,7","11,7",
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
      hallNpcC: {
        type: "Person",
        x: utils.withGrid(22),
        y: utils.withGrid(10),
        src: "/images/characters/people/npc8.png",
        talking: [
          {
            required: ["hallBattle"],
            events: [
              { type: "textMessage", text: "You are quite capable.", faceHero: "hallNpcC" },
            ]
          },
          {
            events: [
              { type: "textMessage", text: "You should have just stayed home!", faceHero: "hallNpcC" },
              { type: "battle", enemyId: "hallBattle" },
              { type: "addStoryFlag", flag: "hallBattle"},
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
      "23,19","23,18","22,18",
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
              map: "ReadingRoom",
              x: utils.withGrid(5),
              y: utils.withGrid(10),
              direction: "up"
            }
          ]
        }
      ],
      [utils.asGridCoord(29,9)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "Shop",
              x: utils.withGrid(5),
              y: utils.withGrid(12),
              direction: "up"
            }
          ]
        }
      ],
      [utils.asGridCoord(25,5)]: [
        {
          events: [
            {
              type: "changeMap",
              map: "HallNorth",
              x: utils.withGrid(7),
              y: utils.withGrid(16),
              direction: "up"
            }
          ]
        }
      ]
    }
  },
  Shop: {
    id: "Shop",
    lowerSrc: "/images/maps/PizzaShopLower.png",
    upperSrc: "/images/maps/PizzaShopUpper.png",
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
        src: "/images/characters/people/erio.png",
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
        src: "/images/characters/people/npc2.png",
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
      pizzaStone: {
        type: "PizzaStone",
        x: utils.withGrid(1),
        y: utils.withGrid(4),
        storyFlag: "STONE_SHOP",
        pizzas: ["v002", "f002"],
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
        src: "/images/characters/people/npc2.png",
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
        src: "/images/characters/people/npc3.png",
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
              { type: "textMessage", text: "Finally... a pizza place that gets me!", faceHero: "darkHallNpcB" },
            ]
          }
        ]
      },
      darkHallNpcC: {
        type: "Person",
        x: utils.withGrid(3),
        y: utils.withGrid(5),
        src: "/images/characters/people/secondBoss.png",
        talking: [
          {
            required: ["chefRootie"],
            events: [ {type: "textMessage", faceHero:["darkHallNpcC"], text: "My veggies need more growth."} ]
          },
          {
            events: [
              { type: "textMessage", text: "Veggies are the fuel for the heart and soul!", faceHero: "darkHallNpcC" },
              { type: "battle", enemyId: "chefRootie", arena: "dark-hall" },
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
        src: "/images/characters/people/npc1.png",
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
              { type: "textMessage", text: "This place is famous for veggie pizzas!", faceHero: "streetNorthNpcA" },
            ]
          }
        ]
      },
      streetNorthNpcB: {
        type: "Person",
        x: utils.withGrid(4),
        y: utils.withGrid(12),
        src: "/images/characters/people/npc3.png",
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
        src: "/images/characters/people/npc8.png",
        talking: [
          {
            required: ["streetNorthBattle"],
            events: [
              { type: "textMessage", text: "Could you be the Legendary one?", faceHero: "streetNorthNpcC" },
            ]
          },
          {
            events: [
              { type: "textMessage", text: "This is my turf!", faceHero: "streetNorthNpcC" },
              { type: "battle", enemyId: "streetNorthBattle" },
              { type: "addStoryFlag", flag: "streetNorthBattle"},
            ]
          },
        ]
      },
      pizzaStone: {
        type: "PizzaStone",
        x: utils.withGrid(2),
        y: utils.withGrid(9),
        storyFlag: "STONE_STREET_NORTH",
        pizzas: ["v001", "f001"],
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
  DiningRoom: {
    id: "DiningRoom",
    lowerSrc: "/images/maps/DiningRoomLower.png",
    upperSrc: "/images/maps/DiningRoomUpper.png",
    configObjects: {
      hero: {
        type: "Person",
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(8),
      },
      diningRoomNpcA: {
        type: "Person",
        x: utils.withGrid(12),
        y: utils.withGrid(8),
        src: "/images/characters/people/npc8.png",
        talking: [
          {
            required: ["diningRoomBattle"],
            events: [
              { type: "textMessage", text: "Maybe I am not ready for this place.", faceHero: "diningRoomNpcA" },
            ]
          },
          {
            events: [
              { type: "textMessage", text: "You think you have what it takes to cook here?!", faceHero: "diningRoomNpcA" },
              { type: "battle", enemyId: "diningRoomBattle", arena: "dining-room" },
              { type: "addStoryFlag", flag: "diningRoomBattle"},
            ]
          },
        ]
      },
      diningRoomNpcB: {
        type: "Person",
        x: utils.withGrid(9),
        y: utils.withGrid(5),
        src: "/images/characters/people/npc4.png",
        talking: [
          {
            events: [
              { type: "textMessage", text: "People come from all over to dine here.", faceHero: "diningRoomNpcB" },
            ]
          },
        ]
      },
      diningRoomNpcC: {
        type: "Person",
        x: utils.withGrid(2),
        y: utils.withGrid(8),
        src: "/images/characters/people/npc7.png",
        behaviorLoop: [
          { type: "stand", direction: "right", time: 800, },
          { type: "stand", direction: "down", time: 700, },
          { type: "stand", direction: "right", time: 800, },
        ],
        talking: [
          {
            events: [
              { type: "textMessage", text: "I was so lucky to score a reservation!", faceHero: "diningRoomNpcC" },
            ]
          },
        ]
      },
      diningRoomNpcD: {
        type: "Person",
        x: utils.withGrid(8),
        y: utils.withGrid(9),
        src: "/images/characters/people/npc1.png",
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
              { type: "textMessage", text: "I've been dreaming of this pizza for weeks!", faceHero: "diningRoomNpcD" },
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
