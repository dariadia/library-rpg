(function () {

  if (navigator.userAgent.match(/Android/i)
  || navigator.userAgent.match(/webOS/i)
  || navigator.userAgent.match(/iPhone/i)
  || navigator.userAgent.match(/iPad/i)
  || navigator.userAgent.match(/iPod/i)
  || navigator.userAgent.match(/BlackBerry/i)
  || navigator.userAgent.match(/Windows Phone/i)) {
    const bodyElement = document.querySelector("body")
    bodyElement.classList.add("device-error")
    return bodyElement.innerHTML = `<span class="device-error_message">Sorry, you need a keyboard to play this game (yet).</span>`
  }

  const overworld = new Overworld({
    element: document.querySelector(".game-container")
  })
  overworld.init()

})()
