const elements = [
  {
    name: 'Todos',
    value: 100
  },
  {
    name: 'Hombre',
    value: 4
  },
  {
    name: 'Mujer',
    value: 12
  },
  {
    name: 'Hipster',
    value: 24
  },
  {
    name: 'Metal',
    value: 6
  },
  {
    name: 'Universidad',
    value: 5
  },
  {
    name: 'Deportiva',
    value: 8
  },
  {
    name: 'Rayas',
    value: 11
  },
  {
    name: 'Apretada',
    value: 19
  }
]

const cardsElements = [
  {
    title: 'Hipster Ultimate',
    description: 'La camiseta para los hipsters'
  },
  {
    title: 'One Motion Live',
    description: 'Perfecta para salidas rocosas'
  },
  {
    title: 'Underground Max',
    description: 'otra camiseta mas para probar'
  },
  {
    title: 'Max Underground',
    description: 'soy un texto de relleno nueva'
  },
  {
    title: 'Live Motion One',
    description: 'estoy probando ahora otra mas'
  }
]
function displayCategoriesList (categories) {
  let html = ''
  categories.forEach((category, index) => {
    let isActive = index === 0 ? 'active' : ''
    html += `
      <a href="javascript:void(0)" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center ${isActive} ">
        ${category.name}
        <span class="badge badge-secondary badge-pill">${category.value}</span>
      </a>
    `
  })  
  document.getElementById('elements').innerHTML = html
}

function displayCards (cards) {
  let html = ''
  cards.forEach((card, index) => {
    html += `
    <div class="col-6 col-md-4 col-lg-4">
      <div class="card">
        <img class="card-img-top" src="https://s3.amazonaws.com/makeitreal/projects/e-commerce/camiseta-${index + 1}.jpg" alt="Card image cap">
        <div class="card-body">
          <h5 class="card-title">${card.title}</h5>
          <p class="card-text">${card.description}</p>
          <div class="card-actions">
            <button class="btn btn-primary btn-sm buy-btn"><span>$299</span><i class="material-icons custom-icon">shopping_cart</i></button>
            <button class="btn btn-outline-secondary btn-sm" data-toggle="modal" data-target="#detailsModal">Detalles</button>
          </div>
        </div>
      </div>
    </div>
    `
  })
  document.getElementById('cards').innerHTML = html
}

displayCategoriesList(elements)
displayCards(cardsElements)
