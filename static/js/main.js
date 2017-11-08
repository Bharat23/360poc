var viewer360;

var initPhotoViewer = (data) => {
    console.log(data);
    if(viewer360) {
        viewer360.destroy();
    }

    viewer360 = PhotoSphereViewer({
        container: 'viewer360',
        panorama: data,
        fisheye: true,
        time_anim: false,
        markers: [
            // {
            //     id: 'image',
            //     longitude: 1.3810192118694424,
            //     latitude: 0.024623999874564317,
            //     image: 'https://s3.amazonaws.com/novainspec/Pier+17/skin/NOVA_Hotspot%20Circle.png',
            //     width: 32,
            //     height: 32,
            //     anchor: 'bottom center',
            //     tooltip: 'A image marker. <b>Click me!</b>',
            //     content: ''
            // },
            {
                id: 'circle',
                circle: 30,
                latitude: 0.024623999874564317,
                longitude: 1.3810192118694424,
                tooltip: 'Move',
                data: {
                    redirect: true,
                    imageUrl: '/images/2.jpg'
                }
            }
        ]
    });
    
    viewer360.on('position-updated', (e) => {
        console.log('Position Updated: Latitude: ', e.latitude, ' longitude: ', e.longitude*(180/Math.PI));
        let tmp = document.getElementsByClassName('pointer-selected')[0];
        let oldStyle = tmp.getAttribute('style');
        if(oldStyle.indexOf('transform:') !== -1) {
            let oldStyleArr = oldStyle.split(';');
            oldStyleArr.splice(2);
            oldStyle = oldStyleArr.join(';') + ';';
        }
        oldStyle += (' transform: rotate(' + e.longitude*(180/Math.PI) + 'deg);');
        tmp.setAttribute('style', oldStyle);
    });
    
    viewer360.on('click', (e) => {
        console.log(e);
        viewer360.addMarker({
            id: '#' + Math.random(),
            longitude: e.longitude,
            latitude: e.latitude,
            image: '/images/red-pin.png',
            width: 32,
            height: 32,
            anchor: 'bottom center',
            tooltip: 'Generated pin',
            data: {
              generated: true
            }
          });
    });

    viewer360.on('select-marker', (e) => {
        if(e.data && e.data.redirect) {
            console.log('From circle', e.data.redirect);
            setTimeout(() => {
                initPhotoViewer(e.data.imageUrl);
                movePointerLocation('tag-237-121');
            }, 2000);
        }
    });
};

var presentThumbnail = (images) => {
    console.log('here', images);
    images.map(val => {
        var tmp = imageThumbnail(val);
        document.getElementById('thumbnail-container').appendChild(tmp);
    });
};

var imageThumbnail = (data) => {
    var div = document.createElement('div');
    div.setAttribute('style', "background-image: url('"+ data.url +"'); background-size: cover;");
    div.setAttribute('data-img-src', data.url);
    div.setAttribute('data-tag-id', data.tagId);
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

var fetchBlueprintPointers = (imageId) => {
    return fetch('/api/admin/getpointers?imageid=1')
            .then(response => response.json())
            .then(data => {
                console.log(data);
                return data;
            })
            .catch(err => console.log('Some Error Occurred', err));
};

var createPointer = data => {
    var div = document.createElement('div');
    div.setAttribute('class', 'pointer');
    div.setAttribute('style', 'top: '+ data.yPerc + '%; left: ' + data.xPerc + '%;');
    div.setAttribute('data-tag-id', data.tagId);
    return div;
};

document.getElementById('thumbnail-container').addEventListener('click', (e) => {
    console.log(e.target.dataset.imgSrc);
    if(e.target.dataset.imgSrc) {
        initPhotoViewer(e.target.dataset.imgSrc);
    }
    if(e.target.dataset.tagId) {
        movePointerLocation(e.target.dataset.tagId);
    }
});

var movePointerLocation = (tagId) => {
    cleanSelectedPointers();
    let tmp = "div[data-tag-id=" + tagId + "][class=pointer]";
    let selectedPointer = document.querySelector(tmp);
    selectedPointer.classList += ' pointer-selected';
};

var cleanSelectedPointers = () => {
    var pointers = document.getElementsByClassName('pointer');
    for (let el of pointers) {
        el.setAttribute('class', 'pointer');
    }
};

document.getElementsByClassName('blueprint-thumbnail-container')[0].addEventListener('click', (e) => {

});

var init = () => {
    fetchImages()
    .then(data => {
        console.log('Images', data);
        presentThumbnail(data.images);
    });
    fetchBlueprintPointers()
    .then(data => {
        console.log(data);
        data.map(val => {
            let div = createPointer(val);
            document.getElementsByClassName('blueprint-thumbnail')[0].appendChild(div);
        });
    });
};
window.addEventListener('load', init);