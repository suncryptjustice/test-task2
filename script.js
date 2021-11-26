window.addEventListener("DOMContentLoaded", (event) => {
  // Gallery div, hold all our images
  const gallery = document.getElementById("gallery");

  // Form that user use for add new images to the gallery
  const imgSrcForm = document.getElementById("imgSrcForm");

  // Sort fields
  const priceSortHandler = document.getElementById("priceFilter");

  // Items array contains values from local storage
  const dataFromStorage = JSON.parse(localStorage.getItem("items"));
  let items = [];

  function sortByPrice(sortType) {
    if (sortType === "max") items.sort((a, b) => b.price - a.price);
    if (sortType === "min") items.sort((a, b) => a.price - b.price);
  }

  function priceTextFormatter(price) {
    const rondedPart = Math.round((price % 1) * 100);
    return (
      Math.trunc(price) +
      " руб. " +
      (rondedPart !== 0 ? rondedPart : "00") +
      " коп."
    );
  }

  priceSortHandler.addEventListener("change", (e) => {
    rerenderGallery(e.target.value);
  });

  // Check if have items in local storage and if have then fill items array with them
  if (Array.isArray(dataFromStorage) && dataFromStorage.length)
    items = dataFromStorage;

  function rerenderGallery(sortType) {
    while (gallery.firstChild) {
      gallery.removeChild(gallery.firstChild);
    }
    sortByPrice(sortType);
    for (item of items) {
      createImage(item);
    }
  }

  rerenderGallery(priceSortHandler.value);

  function createImage(item) {
    const container = document.createElement("div");
    container.classList.add("img__container");

    const img = document.createElement("img");
    img.setAttribute("src", item.src);
    img.setAttribute("alt", item.alt);
    img.classList.add("img");

    const priceContainer = document.createElement("div");
    priceContainer.classList.add("img__price__container");

    const imgName = document.createElement("div");
    imgName.classList.add("img__name");
    imgName.innerHTML = item.alt;

    const priceLabel = document.createElement("div");
    priceLabel.classList.add("img__price__label");
    priceLabel.innerHTML = priceTextFormatter(item.price);
    priceContainer.appendChild(imgName);
    priceContainer.appendChild(priceLabel);

    container.appendChild(img);
    container.appendChild(priceContainer);

    // Add event listener for delete image on user click
    img.addEventListener("click", function () {
      const result = confirm("Вы уверены, что хотите удалить изображение?");
      if (result) {
        items = items.filter((obj) => obj.id !== item.id);
        localStorage.setItem("items", JSON.stringify(items));
        container.remove();
      }
    });

    // Append element to image gallery
    gallery.appendChild(container);
    setTimeout(() => {
      container.style.opacity = 1;
      container.style.transform = "translateX(0)";
    }, 0);
  }

  function addImage(data) {
    // Validation
    const { imgSrc, imgAlt, price } = data;
    if (imgSrc.match(/\.(jpeg|jpg|gif|png)$/) == null)
      throw new Error("Проверьте корректность введенной ссылки");
    if (!imgAlt) throw new Error("Изображение должно иметь описание");
    const convertedPrice = parseFloat(price);
    if (!convertedPrice)
      throw new Error("Проверьте правильность введенной цены");

    // Create item for local storage
    const item = {
      id: (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1),
      src: imgSrc,
      alt: imgAlt,
      price: convertedPrice
    };
    items.push(item);
    localStorage.setItem("items", JSON.stringify(items));

    // Create image element
    createImage(item);

    // Reset Form
    imgSrcForm.reset();
  }

  // Listen to the form submit events
  imgSrcForm.addEventListener("submit", function (e) {
    // Prevent page from reload
    e.preventDefault();

    // Extract data from the form
    const data = Object.fromEntries(new FormData(e.target));

    // Try to add image to the gallery
    try {
      addImage(data);
    } catch (error) {
      alert(error.message);
    }
  });
});