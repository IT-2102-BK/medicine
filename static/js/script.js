if (window.XMLHttpRequest) { // Mozilla, Safari, IE7+, etc.
    httpRequest = new XMLHttpRequest();
} else if (window.ActiveXObject) { // IE 6 and older
    httpRequest = new ActiveXObject("Microsoft.XMLHTTP");
}
httpRequest.onreadystatechange = () => {
    if (httpRequest.readyState === XMLHttpRequest.DONE) {
       let data = JSON.parse(httpRequest.response);
       doThings(data);
    }
    
};

httpRequest.open('GET', '/products', true);
httpRequest.send();

// Everything is inside
function doThings(data){

let dataSet = data;


// удаление всех элементов из контейнера отображения
function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

// обработка корзины
let cartList = document.getElementById('cartList'); //контейнер корзины, в нее будут записываться все товары добавленные в корзину
let counter = document.getElementById('cart-counter'); //счетчик товаров добавленных в корзину, на сайте отмечен оранжевым кружком над корзиной
let fullPrice = document.getElementById('cart-full-price'); // итого (сумма всех продуктов) в корзине, в корзине находится в самом низу
let offerBtn = document.getElementById('offerBtn'); //кнопка заказать из корзины
let productsInCart = []; //все продкеты добавленные в корзину


// создание одного продукта из корзины
function renderSingleCartItem(product, item_id) {
    let div = document.createElement('div'); // создаем контейнер для продукта
    div.classList.add('item'); //добавляем ему класс (чтобы применились стили)

    let img = document.createElement('img'); //создание картинки
    img.setAttribute('src', product.img);
    img.classList.add('cart-img'); //также добавление для нее стилей

    let info = document.createElement('div'); //принцип тот же самый что и выше
    info.classList.add('item-info');

    header = document.createElement('h3');
    header.classList.add('cart-header');
    header.textContent = product.name;

    price = document.createElement('h3');
    price.classList.add('cart-header');
    price.classList.add('cart-price');
    price.textContent = product.price + 'тг';

    btn = document.createElement('button');
    btn.textContent = 'Удалить';
    btn.classList.add('delete-from-cart');
    btn.addEventListener('click', () => { deleteItemFromCart(item_id); }) //кнопка удалить у продукта в корзине, здесь
    //на ее нажатие будет запускаться функция deleteItemFromCart - строка кода 117, которая будет удалять продукт по item_id и заново
    //перерисовывать корзину

    info.appendChild(header); //собираем наш продукт для корзины 
    info.appendChild(price);

    div.appendChild(img);
    div.appendChild(info);
    div.appendChild(btn);
    return div;
}


//удаление элемента
function deleteItemFromCart(item_id) {
    productsInCart.splice(item_id, 1); //splice - изменяет массив делая в нем разрез по определенному индексу,
    //таким образом мы удаляем элемент под индексом item_id из продуктов в корзине (productsInCart)
    renderShoppingCart(); //запускаем полную перерисовку корзины
}


// отрисовка всей корзины
function renderShoppingCart() {
    removeAllChildNodes(cartList); //удаляем все уже отрисованные элементы из корзины
    //если этого не делать, то в корзину постоянно будут прибавляться уже отрисованные продукты из корзины

    //array.reduce() проходится по элементам и считает сумму всех продуктов в корзине, нам необходимо для Итого
    let price = productsInCart.reduce((acc, current) => acc + parseInt(current.price.replace(' ', '')), 0);  
    //replace(' ',''), замещаем пробел на пустоту,  используем чтобы происходила корректная конвертация из строки в число //

    fullPrice.textContent = `Итого: ${price}`; //отображаем цену
    counter.textContent = productsInCart.length; //отображаем кол-во товаров в корзине
 
    let fragment = document.createDocumentFragment(); 
    for (let i = 0; i < productsInCart.length; i++)
        fragment.appendChild(renderSingleCartItem(productsInCart[i], i)); //добавляем в фрагмент по одному предмету из корзины

    cartList.appendChild(fragment); //добавляем фрагмент со всеми продуктами в корзину
}


// добавление элемента в корзину
function addInCart(cat_id, item_id) {
    let product = dataSet[cat_id - 1][item_id - 1]; //находим продукт, на который нажали "В корзину"
    productsInCart.push(product); //добавляем его в массив продуктов из корзины
    renderShoppingCart(); //целиком перерисовываем корзину
}
//

// кнопка отправки заказа, при нажатии корзина очищается
offerBtn.addEventListener('click', () => { //на клик кнопки Заказать вся корзина очищается и перерисовывается пустой
    productsInCart = [];
    renderShoppingCart();
});

//start product list block render

let productsList = document.getElementById('prod-list'); //список всех доступных продуктов в магазине
let productsHeader = document.getElementById('prod-header'); //заголовок, какая категория выбрана


// создание единичного продукта для списка
//здесь идет создание элемента продукта, по тому же принципу что и продукт из корзины
function renderSingleProduct(product) {
    let div = document.createElement('div');
    div.classList.add('product-item');

    let header = document.createElement('h3');
    header.classList.add('product-header');
    header.textContent = product.name;

    let img = document.createElement('img');
    img.setAttribute('src', product.img);
    img.classList.add('product-img');

    let price = document.createElement('h3');
    price.classList.add('.product-header.product-price');
    price.textContent = product.price + 'тг';

    let btn = document.createElement('button');
    btn.textContent = 'В корзину';
    btn.classList.add('add-to-cart');

    btn.addEventListener('click', () => {
        addInCart(product.cat_id, product.item_id); //на кнопку В корзину будет вызываться функция addInCart строка кода 146
    })

    div.appendChild(header);
    div.appendChild(img);
    div.appendChild(price);
    div.appendChild(btn);
    return div;
}

//отрисовка всего списка продуктов
//тот же принцип продукта из корзины, отрисовка всех продуктов
function renderProducts() {
    removeAllChildNodes(productsList);
    let fragment = document.createDocumentFragment();
    for (let i = 0; i < dataSet.length; i++) {
        fragment.appendChild(renderSingleProduct(dataSet[i]));
    }
    productsList.appendChild(fragment);
}

//end product list block render



//categories click handler


//отрисовка продуктов только по выбранной категори
//когда в каталоге человек переключает категорию, показываются продукты только из выбранной категории
function renderByCategory(category_id, category_name) {
    removeAllChildNodes(productsList); 
    productsHeader.textContent = category_name; //меняем нашу категорию, показывается на сайте как Все Категории, Оптика и тд. над продуктами

    if (category_id === 0) //если категория == Все категории отрисовываем все продукты
        renderProducts();
    else { //иначе отрисовываем только выбранную категорию
        //dateSet[cateogry_id-1][j]
        //category_id-1 - выбранная пользователем категория
        //j - продукт из выбранной категории
        let fragment = document.createDocumentFragment();
        for (let j = 0; j < dataSet[category_id - 1].length; j++) {
            fragment.appendChild(renderSingleProduct(dataSet[category_id - 1][j]));
        }
        productsList.appendChild(fragment);
    }
}

let categories = document.querySelectorAll('.category'); //все наши доступные на сайте категории

for (let i = 0; i < categories.length; i++) { //при нажатии на категорию из каталога будет вызываться функция renderByCategory 220 строка кода
    //с помощью addEventListener на нажатие реализуем эту возможность
    let category_id = parseInt(categories[i].lastElementChild.getAttribute('cat_id'));
    categories[i].addEventListener('click', () => { renderByCategory(category_id, categories[i].lastElementChild.textContent); })
}

// sort block


let sort_types = document.querySelectorAll('.sort_type'); //варианты упорядочивания доступные на сайте 
for (let i = 0; i < sort_types.length; i++) {
    //также как и для категорий, при нажатии на сортировку будет вызываться функция sortProducts с выбранным типом сортировки
    //используем для этого аттрибуты, также как и у категорий,
    //атриббуты мы задаем в тегах например <div sort_type="1">От а до я</div> sort_type здесь это аттрибут, который мы получаем в 254 строке кода
    let sort_type = parseInt(sort_types[i].lastElementChild.getAttribute('sort_type')); 
    sort_types[i].addEventListener('click', () => { sortProducts(sort_type); })
}

let allProductsList = []; //массив всех доступных продуктов, для сортировки, т.к. сортировать наш двумерный массив dataSet не стоит,
//так как на положении продуктов в дата сете завязано их добавление в корзину
for (let i = 0; i < dataSet.length; i++) { //добавляем все продукты в одномерный массив
    for (let j = 0; j < dataSet[i].length; j++) {
        allProductsList.push(dataSet[i][j]);
    }
}


//шейкерная сортировка (сортировка перемешиванием)
//про нее можно прочитать здесь https://academy.yandex.ru/posts/osnovnye-vidy-sortirovok-i-primery-ikh-realizatsii
function ShakerSort(items, comparer) {
    if (items.length === 0)
        return;

    let left = 0;
    let right = items.length - 1;
    while (left <= right) {
        for (let i = right; i > left; --i) {
            if (comparer(items[i - 1], items[i]) == 1) { //comparer - функция сравнения, для того чтобы не писать две сортировки но с разным сравнением
                //используется одна сортировка, и просто так сказать сравниватель элементов
                [items[i - 1], items[i]] = [items[i], items[i - 1]] //вариант свапа в JavaScript
            }
        }
        ++left;
        for (let i = left; i < right; ++i) {
            if (comparer(items[i], items[i + 1]) == 1) {
                [items[i], items[i + 1]] = [items[i + 1], items[i]]
            }
        }
        --right;
    }
    return items;
}


//функция сравнения по цене
let compareByPrice = (productA, productB) => {
    let price1 = parseInt(productA.price.replace(' ', ''));
    let price2 = parseInt(productB.price.replace(' ', ''));
    return price1 > price2;
}

//функция сравнения по имени
let compareByName = (productA, productB) => productA.name.localeCompare(productB.name); //localCompare сравнивает строки


//сортировка по выбранному типу сортировки
function sortProducts(sort_type) { //сортируем продукты, при нажатии на вариант упорядочивания, возможность нажатия на них добавляем в строке 249
    if (sort_type === 0)
        allProductsList = ShakerSort(allProductsList, compareByName);
    else if (sort_type === 1)
        allProductsList = ShakerSort(allProductsList, compareByPrice);

    removeAllChildNodes(productsList); //удаляем все отображаемые продукты
    let fragment = document.createDocumentFragment(); //отрисовываем упорядоченный список продуктов
    for (let i = 0; i < allProductsList.length; i++) {
        fragment.appendChild(renderSingleProduct(allProductsList[i]));
    }
    productsList.appendChild(fragment);
}

//end sort block


// start search block

let searchPanel = document.getElementById('search-panel'); //панель поиска на нашем сайте
let searchBtn = document.getElementById('start-search'); //кнопка найти, отображается как лупа

searchBtn.addEventListener('click', (e) => { //по нажатию на кнопку найти будет производится бинарный поиск
    //
    productBinaryRecSearch(allProductsList);
})


// рекурсивный бинарный поиск по имени продукта
function productBinaryRecSearch(products) {
    ShakerSort(products, compareByName); //для применения бинарного поиска массив
    //по которому будет производится поиск сначала нужно отсортировать 

    let str = searchPanel.value; //забираем строку которую написал пользователь в панели поиска
    let idx = binarySearchRecursive(products, 0, products.length - 1, str); //бинарный поиск возвращает искомый индекс элемента из массива

    let searched = products[idx]; //берем этот продукт по индексу из массива
    removeAllChildNodes(productsList); 
    productsList.appendChild(renderSingleProduct(searched)); //отображаем этот продукт
    searchPanel.value = ''; //очищаем строку поиска
}

// рекурсивный бинарный поиск
function binarySearchRecursive(products, l, r, x) {
    if (r >= l) {
        let mid = parseInt(l + (r - l) / 2);
        if (products[mid].name.localeCompare(x) == 0) return mid;

        if (products[mid].name.localeCompare(x) == 1) return binarySearchRecursive(products, l, mid - 1, x);

        return binarySearchRecursive(products, mid + 1, r, x);
    }
    return -1;
}

// end search block


//start popup

let overlay = document.getElementById('overlay'); //overlay темная пленка поверх всего
let cart = document.getElementById('cart'); //наша корзина
let close_x = document.getElementById('close_x'); //крестик закрытия корзины

//открытие корзины
cart.addEventListener('click', () => { //при нажатии на корзину открываем ее путем изменения стилей
    overlay.style.display = "flex";
    document.body.style.overflow = "hidden"; //убираем возможность прокрутки страницы - скролл бар
})

//закрытие корзины
close_x.addEventListener('click', () => { //при нажатии на Х закрываем корзину путем изменения стилей
    overlay.style.display = "none"; 
    document.body.style.overflow = "visible"; //возвращаем скролл
})

// end popup


renderProducts();
}