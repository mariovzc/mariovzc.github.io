function stack () {
  const skills = [
    'Ruby on rails',
    'Javascript',
    'HTML5',
    'CSS3',
    'Bootstrap',
    'Materialize',
    'Vuejs',
    'Quasar',
    'Git',
    'Node',
    'Heroku',
    'Pusher.io',
    'SQL',
    'POO',
    'MVC',
    'SWIFT',
    'JQuery',
    'Objective-C',
    'Ajax',
    'Scrum',
    'Phonegap'
  ]
  let container = document.getElementsByClassName('stack')[0]
  skills.forEach((element) => {
    let chip = document.createElement('div')
    chip.className = 'chip green darken-2 white-text'
    chip.appendChild(document.createTextNode(element))
    container.appendChild(chip)
  })
}
stack()
$('.materialboxed').materialbox()
