
// ----------------------------
// Product data (with images)
// ----------------------------
const productData = {
  "Dhoop Cones": {
     "Mix Cone": { 500: 150,1000:300, img: "images/MixCone.jpg" },
        "Mogra Cone": { 100: 30, 200: 60, 250: 75, 1000: 300, img: "images/MograCone.jpg" },
        "Rose Cone": { 100: 30, 200: 60, 250: 75, 1000: 300, img: "images/RoseCone.jpg" },
        "Chandan Cone": { 100: 30, 200: 60, 250: 75, 1000: 300, img: "images/ChandanCone.jpg" },
        "Lavender Cone": { 100: 30, 200: 60, 250: 75, 1000: 300, img: "images/LavenderCone.jpg" }
  },
  "Dhoop Sticks": {
    "Vedha Stick": { 100: 35, 200: 70, 250: 88, 1000: 350, img: "images/Vedha.jpg" },
        "Lavender Stick": { 100: 35, 200: 70, 250: 88, 1000: 350, img: "images/Lavender.jpg" },
        "Intimate Stick": { 100: 35, 200: 70, 250: 88, 1000: 350, img: "images/Intimate.jpg" },
        "Fantasia Stick": { 100: 35, 200: 70, 250: 88, 1000: 350, img: "images/Fantasiya.jpg" }

  },
  "Sambhrani Cups": {
    "Loban Cup": {100:30,200:60,250:75,1000:300,img:"images/Loban.jpg"},
    "Rose Cup": {100:30,200:60,250:75,1000:300,img:"images/Rose.jpg"},
    "Chandan Cup": {100:30,200:60,250:75,1000:300,img:"images/Loban.jpg"},
    "Black Cup": {100:30,200:60,250:75,1000:300,img:"images/Black.jpg"}
  },
  "Agarbattis": {
    "Masala Agarbatti": {100:75,200:150,250:182,1000:750,img:"images/Masala.jpg"},
    "Regular Agarbatti": {100:15,200:30,250:22,1000:150,img:"images/Regular.jpg"}
  }
};

// ----------------------------
// Order ID + Cart persistence
// ----------------------------
let orderId = localStorage.getItem('orderId') || Math.floor(1000 + Math.random() * 900000).toString();
localStorage.setItem('orderId', orderId);
document.getElementById('order-id').textContent = "Order ID: " + orderId;

let cart = JSON.parse(localStorage.getItem('cart')) || {}; // key: name_weight, value: {name,weight,qty,price}

// helpers
function saveCart(){ localStorage.setItem('cart', JSON.stringify(cart)); }
function toggleMenu(){ document.getElementById('sidebar').classList.toggle('active'); }
function toggleCart(){ document.getElementById('cart-details').classList.toggle('active'); }
function scrollToId(id){ document.getElementById(id) && document.getElementById(id).scrollIntoView({behavior:'smooth'}); }

// ----------------------------
// Populate categories & cards
// ----------------------------
function populateProducts(){
  const container = document.getElementById('products-container');
  const sidebarMenu = document.getElementById('sidebar-menu');
  container.innerHTML = '';
  sidebarMenu.innerHTML = '';

  for(const categoryName in productData){
    const catId = categoryName.toLowerCase().replace(/\s+/g,'-');

    // sidebar entry
    const li = document.createElement('li');
    li.textContent = categoryName;
   // li.onclick = () => scrollToId(catId);
    li.onclick = () => { toggleMenu(); scrollToId(catId); };  
    sidebarMenu.appendChild(li);

    // category block
    const catDiv = document.createElement('div');
    catDiv.className = 'category';
    catDiv.id = catId;
    const h2 = document.createElement('h2');
    h2.textContent = categoryName;
    const cardsDiv = document.createElement('div');
    cardsDiv.className = 'cards';

    const products = productData[categoryName];
    for(const name in products){
      cardsDiv.appendChild(createCard(name, products[name]));
    }

    catDiv.appendChild(h2);
    catDiv.appendChild(cardsDiv);
    container.appendChild(catDiv);
  }
}

// ----------------------------
// Create product card
// ----------------------------
function createCard(name, priceMap){
  // find first numeric key to be default weight
  const weightKeys = Object.keys(priceMap).filter(k => k !== 'img');
  const defaultWeight = weightKeys[0];

  const card = document.createElement('div');
  card.className = 'card';
  card.dataset.name = name;
  card.dataset.selectedWeight = defaultWeight;

  card.innerHTML = `
    <h3>${name}</h3>
    <div class="card-content">
      <img src="${priceMap.img || 'https://via.placeholder.com/80'}" alt="${name}">
      <div>
        <div class="custom-select">
          <div class="select-selected"><span>${defaultWeight}gm</span><span class="select-arrow"></span></div>
          <div class="select-items">
            ${weightKeys.map(w => `<div data-value="${w}">${w}gm</div>`).join('')}
          </div>
        </div>
        <div class="price">₹${priceMap[defaultWeight]}</div>
      </div>
    </div>
    <div class="actions">
      <button class="add-to-cart">Add to Cart</button>
      <div class="quantity-control" style="display:none;">
        <button class="dec">-</button><span>0</span><button class="inc">+</button>
      </div>
    </div>
  `;

  // dropdown
  const select = card.querySelector('.custom-select');
  const selected = select.querySelector('.select-selected');
  const items = select.querySelector('.select-items');
  const arrow = select.querySelector('.select-arrow');

  selected.addEventListener('click', e => { e.stopPropagation(); items.classList.toggle('show'); arrow.classList.toggle('open'); });
  items.querySelectorAll('div').forEach(option => {
    option.addEventListener('click', () => {
      const value = option.dataset.value;
      selected.querySelector('span').textContent = option.textContent;
      card.dataset.selectedWeight = value;
      // update price text
      card.querySelector('.price').textContent = `₹${priceMap[value]}`;
      items.classList.remove('show'); arrow.classList.remove('open');
      updateCardQtyDisplay(card); // reflect if this variant exists in cart
    });
  });
  document.addEventListener('click', e => { if(!select.contains(e.target)){ items.classList.remove('show'); arrow.classList.remove('open'); } });

  // buttons
  const addBtn = card.querySelector('.add-to-cart');
  const incBtn = card.querySelector('.inc');
  const decBtn = card.querySelector('.dec');

  addBtn.addEventListener('click', () => addToCartFromCard(card, priceMap));
  incBtn.addEventListener('click', () => changeQtyFromCard(card, 1, priceMap));
  decBtn.addEventListener('click', () => changeQtyFromCard(card, -1, priceMap));

  // ensure display sync with existing cart
  updateCardQtyDisplay(card);
  return card;
}

// ----------------------------
// Cart operations
// ----------------------------
function addToCartFromCard(card, priceMap){
  const name = card.dataset.name;
  const weight = card.dataset.selectedWeight;
  const key = `${name}__${weight}`; // separator unlikely in name
  const price = priceMap[weight];

  if(!cart[key]) cart[key] = { name, weight, qty: 0, price };
  cart[key].qty++;
  saveCart(); updateCart(); updateCardQtyDisplay(card);
}

function changeQtyFromCard(card, delta, priceMap){
  const name = card.dataset.name;
  const weight = card.dataset.selectedWeight;
  const key = `${name}__${weight}`;
  if(!cart[key] && delta > 0){
    cart[key] = { name, weight, qty: 0, price: priceMap[weight] };
  }
  if(cart[key]){
    cart[key].qty += delta;
    if(cart[key].qty <= 0) delete cart[key];
    saveCart(); updateCart(); updateCardQtyDisplay(card);
  }
}

function updateCardQtyDisplay(card){
  const name = card.dataset.name;
  const weight = card.dataset.selectedWeight;
  const key = `${name}__${weight}`;
  const addBtn = card.querySelector('.add-to-cart');
  const qtyCtrl = card.querySelector('.quantity-control');
  const qtySpan = qtyCtrl.querySelector('span');

  if(cart[key]){
    addBtn.style.display = 'none';
    qtyCtrl.style.display = 'flex';
    qtySpan.textContent = cart[key].qty;
  } else {
    addBtn.style.display = 'inline-block';
    qtyCtrl.style.display = 'none';
    qtySpan.textContent = '0';
  }
}

function updateAllCards(){
  document.querySelectorAll('.card').forEach(card => updateCardQtyDisplay(card));
}

function updateCart(){
  const itemsDiv = document.getElementById('cart-items');
  itemsDiv.innerHTML = '';
  let total = 0, count = 0;

  for(const key in cart){
    const it = cart[key];
    const subtotal = it.price * it.qty;
    total += subtotal;
    count += it.qty;

    const row = document.createElement('div');
    row.className = 'cart-item';
    row.innerHTML = `<span>${it.name} (${it.weight}gm) x ${it.qty}</span><span>₹${subtotal}</span>`;
    const delBtn = document.createElement('button');
    delBtn.className = 'delete-btn';
    delBtn.textContent = '🗑️';
    delBtn.onclick = () => { delete cart[key]; saveCart(); updateCart(); updateAllCards(); };
    row.appendChild(delBtn);
    itemsDiv.appendChild(row);
  }

  document.getElementById('cart-total').textContent = total;
  document.getElementById('cart-count').textContent = count;

  const cartEmpty = document.getElementById('cart-empty');
  const cartActions = document.getElementById('cart-actions');
  if(count === 0){
    cartEmpty.style.display = 'block';
    cartActions.style.display = 'none';
    document.getElementById('order-form').style.display = 'none';
  } else {
    cartEmpty.style.display = 'none';
    cartActions.style.display = 'flex';
  }
}

// ----------------------------
// Reset, checkout, submit
// ----------------------------
document.getElementById('reset-cart').addEventListener('click', () => {
  cart = {}; saveCart(); updateCart(); updateAllCards();
});

document.getElementById('checkout').addEventListener('click', () => {
  if(Object.keys(cart).length === 0){ alert('Your cart is empty. Add items first.'); return; }
  document.getElementById('order-form').style.display = 'block';
});

document.getElementById('submit-order').addEventListener('click', () => {
  const name = document.getElementById('customer-name').value.trim();
  const addr = document.getElementById('customer-address').value.trim();
  if(!name || !addr){ alert('Please fill in name & address.'); return; }

  // build order text
  let msg = `Please confirm my order\nOrder ID: ${orderId}\nName: ${name}\nAddress: ${addr}\n\nItems:\n`;
  let total = 0;
  for(const key in cart){
    const it = cart[key];
    msg += `${it.name} (${it.weight}gm) x ${it.qty} = ₹${it.price * it.qty}\n`;
    total += it.price * it.qty;
  }
  msg += `\nTotal: ₹${total}`;
  // Your Whatsapp number here (with country code, no + or spaces)
 // const whatsappNumber = '+919823337894';
  const whatsappNumber = '+918552098949'; 
  //Open Whatsapp with prefilled message
  window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`, '_blank');
  

 // alert('Order placed!\n\n' + msg);

  // clear cart and refresh
  cart = {}; saveCart(); updateCart(); updateAllCards();
  document.getElementById('order-form').style.display = 'none';

  // generate new order id
  orderId = Math.floor(1000 + Math.random() * 900000).toString();
  localStorage.setItem('orderId', orderId);
  document.getElementById('order-id').textContent = 'Order ID: ' + orderId;
});

// shop now button
document.getElementById('shop-now').addEventListener('click', () => {
  toggleCart();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
/*
// ----------------------------
// Search Old
// ----------------------------
function searchProducts(q){
  q = (q || '').toLowerCase().trim();
  document.querySelectorAll('.card').forEach(card => {
    const name = card.dataset.name.toLowerCase();
    card.style.display = name.includes(q) ? 'block' : 'none';
  });
}*/

//NEW SEARCH
function searchProducts(q){
  q = (q || '').toLowerCase().trim();
  //LOOP THROUGH CATEGORIES
  document.querySelectorAll('.category').forEach(category => {
    const cards = category.querySelectorAll('.card');
    let visibleCount = 0;
    //LOOP THROUGH CARDS IN CATEGORY
    cards.forEach(card => {
      const name = card.dataset.name.toLowerCase();
      if(name.includes(q)){
        card.style.display = 'block';
        visibleCount++;
      }else{
        card.style.display = 'none';
      }
    });
    //Hide category if no product matches
    category.style.display = visibleCount > 0 ? 'block' : 'none';
  } );
}
//----------------------------
// Search icon toggle
// ----------------------------
const searchIcon = document.getElementById('search-icon');
const searchInput = document.getElementById('search-input');
//const searchBar = document.querySelector('.search-bar');

//Flag to track search mode

let isSearching = false;
searchIcon.addEventListener('click', ()=>{
  if(!isSearching){
    //Focus input to start searching
    searchInput.focus();
  }else{
    //Go back to top of page (simulate "Back" action) 
    window.scrollTo({ top: 0, behavior: 'smooth' });
    searchInput.value = '';
    searchProducts('');
   // isSearching = false;
    isSearching = true;
    searchIcon.textContent = '🔍'; // search icon
  }
});

searchInput.addEventListener('input', () => {
 if (searchInput.value.trim().length>0){
 searchIcon.textContent='❌'; // clear icon
isSearching = true;
}else{
  searchIcon.textContent = '🔍'; // search ico
  isSearching = false;  
}
});

//Close sidebar when user clicks outside of sidebar and hamberger
document.addEventListener('click', function(e){
  const sidebar = document.getElementById('sidebar');
  const hamburger = document.querySelector('.hamburger');
  //only run if sidebar is open 
  if(sidebar.classList.contains('active')){
    const clickInsideSidebar = sidebar.contains(e.target);  
    const clickOnHamburger = hamburger.contains(e.target);
    if(!clickInsideSidebar && !clickOnHamburger){
      sidebar.classList.remove('active');
    }
  }
});

//Close sidebar when pressing Escape  
document.addEventListener('keydown', (e) => {
  if(e.key === 'Escape'){
    document.getElementById('sidebar').classList.remove('active');
    document.getElementById('cart-details').classList.remove('active');
  }
});

// ----------------------------
// Init
// ----------------------------
populateProducts();
updateCart();
// ensure card displays reflect persisted cart
updateAllCards();

//Copyright footer year
document.getElementById('current_year').textContent = new Date().getFullYear();