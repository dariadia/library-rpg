class ChooseCharacter {
  init() {
    const chooseCharacterEl = document.createElement("form")
    chooseCharacterEl.classList.add("ChooseCharacter_wrapper")
    chooseCharacterEl.onsubmit = () => console.log(this)
    chooseCharacterEl.innerHTML = `
      <section class="ChooseCharacter_skin"> 
        <h1>Choose your character:</h1>
        <label for="hero_1">
          <input type="radio" id="hero_1" name="hero_skin" />
          <span class="hero-icon one"></span><span class="hero-icon two"></span>
        </label>
       <label for="hero_2">
         <input type="radio" id="hero_2" name="hero_skin" />
          <span class="hero-icon one"></span><span class="hero-icon two"></span>
        </label>
        <label for="hero_3">
          <input type="radio" id="hero_3" name="hero_skin">
          <span class="hero-icon one"></span><span class="hero-icon two"></span>
        </label>
      </section> 
      <section class="ChooseCharacter_pronouns">    
        <h2>Choose your pronouns:</h2>
        <label for="they"><input type="radio" id="they" name="pronouns" value="they">They/their</label>
        <label for="age2"><input type="radio" id="she" name="pronouns" value="she">She/her</label> 
        <label for="age3"><input type="radio" id="he" name="pronouns" value="he">He/his</label>
      </section>
      <section class="ChooseCharacter_name"> 
        <label for="hero_name" >Enter your name:</label>
        <input id="hero_name" name="your_name" value="YN">
      </section> 
      <button>OK</button>`
    return chooseCharacterEl
  }
}
