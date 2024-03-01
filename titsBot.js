window.location.href = 'https://ya.ru/images/search?from=tabbar&text=girl';

window.onload = function() {
  let images = document.querySelectorAll('img');
  let filteredUrls = [];

  for (let img of images) {
    if (img.src.includes('images-thumbs')) {
      filteredUrls.push(img.src);
    }
  }

  console.log(filteredUrls);
};
