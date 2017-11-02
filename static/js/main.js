var viewer;

var initPhotoViewer = (data) => {
    console.log(data);
    if(viewer) {
        viewer.destroy();
    }

    viewer = PhotoSphereViewer({
        container: 'viewer360',
        panorama: data
    });
    
    viewer.on('position-updated', (e) => {
        console.log('Position Updated: Latitude: ', e.latitude, ' longitude: ', e.longitude);
    });
    
    viewer.on('click', (e) => {
        console.log(e);
    });
};

var presentThumbnail = (images) => {
    console.log('here', images);
    images.map(val => {
        var tmp = imageThumbnail(val);
        document.getElementById('thumbnail-container').appendChild(tmp);
    });
};

var imageThumbnail = data => {
    var div = document.createElement('div');
    div.setAttribute('style', "background-image: url('"+ data.url +"'); background-size: cover;");
    div.setAttribute('data-img-src', data.url);
    return div;
};

var fetchImages = () => {
    return fetch('/api/getimages')
        .then(response => response.json())
        .then(data => {
            console.log('Image Data', data);
            return data;
        })
        .catch(err => console.error(err));
};

var init = () => {
    fetchImages()
    .then(data => {
        console.log('Images', data);
        presentThumbnail(data.images);
    });
};

document.getElementById('thumbnail-container').addEventListener('click', (e) => {
    console.log(e.target.dataset.imgSrc);
    if(e.target.dataset.imgSrc) {
        initPhotoViewer(e.target.dataset.imgSrc);
    }
});

window.addEventListener('load', init);